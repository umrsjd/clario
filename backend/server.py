from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import asyncpg
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List
import uuid
from datetime import datetime, timedelta
from auth import router as auth_router
from chat import router as chat_router
import resend

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv('DB_NAME', 'test_database')]

# Neon PostgreSQL connection
neon_url = os.getenv('NEON_DATABASE_URL')
if not neon_url:
    raise ValueError("NEON_DATABASE_URL not set in environment variables")

async def get_postgres_pool():
    return await asyncpg.create_pool(neon_url)

# Initialize Resend
resend.api_key = os.getenv('RESEND_API_KEY')
if not resend.api_key:
    raise ValueError("RESEND_API_KEY not set in environment variables")

# Create the main app
app = FastAPI(title="Calmi API", version="1.0.0")

# Add session middleware for OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv('JWT_SECRET_KEY', 'f487fe27afc6ab766f95d455b5a1aaff2eec3633dc566f1d6d47d87a3ef655ac'),
    max_age=3600,  # Session expires after 1 hour
    same_site='lax',  # Allow cookies in cross-site requests
    https_only=False  # Set to True in production with HTTPS
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class EmailRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    code: str

# OTP Generation and Sending
async def generate_and_send_otp(email: str):
    # Generate 6-digit OTP
    import random
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    expires_at = datetime.utcnow() + timedelta(minutes=10)  # OTP valid for 10 minutes

    # Store OTP in Neon PostgreSQL
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        # Delete any existing OTP for this email
        await conn.execute(
            "DELETE FROM otp_codes WHERE email = $1",
            email
        )
        # Insert new OTP
        await conn.execute(
            "INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)",
            email, code, expires_at
        )

    # Send OTP via Resend
    try:
        email_params = {
            "from": "no-reply@yourdomain.com",  # Replace with your verified Resend domain
            "to": [email],
            "subject": "Your Clario Verification Code",
            "html": f"""
            <h2>Your Verification Code</h2>
            <p>Use the following code to verify your email:</p>
            <h3>{code}</h3>
            <p>This code expires in 10 minutes.</p>
            """
        }
        resend.Emails.send(email_params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"message": "OTP sent successfully"}

# Routes
@api_router.get("/")
async def root():
    return {"message": "Calmi API is running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/auth/send-otp")
async def send_otp(request: EmailRequest):
    return await generate_and_send_otp(request.email)

@api_router.post("/auth/verify-otp")
async def verify_otp(request: OTPVerifyRequest):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        result = await conn.fetchrow(
            "SELECT code, expires_at FROM otp_codes WHERE email = $1",
            request.email
        )
        if not result:
            raise HTTPException(status_code=400, detail="No OTP found for this email")
        
        if result['expires_at'] < datetime.utcnow():
            await conn.execute("DELETE FROM otp_codes WHERE email = $1", request.email)
            raise HTTPException(status_code=400, detail="OTP has expired")
        
        if result['code'] != request.code:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        # OTP is valid, delete it
        await conn.execute("DELETE FROM otp_codes WHERE email = $1", request.email)
        
        # Create or update user in MongoDB
        user = await db.users.find_one({"email": request.email})
        if not user:
            user_data = {"email": request.email, "full_name": request.email.split('@')[0]}
            await db.users.insert_one(user_data)
        
        # Generate JWT token
        access_token = create_access_token(data={"sub": request.email})
        return {"access_token": access_token, "token_type": "bearer"}

# Include auth and chat routers
api_router.include_router(auth_router)
api_router.include_router(chat_router)

# Include the main router in the app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Be specific for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Calmi API starting up...")
    try:
        await db.users.create_index("email", unique=True)
        await db.conversations.create_index([("user_id", 1), ("updated_at", -1)])
        await db.messages.create_index([("conversation_id", 1), ("timestamp", 1)])
        logger.info("MongoDB indexes created successfully")
        
        # Verify Neon connection
        pool = await get_postgres_pool()
        async with pool.acquire() as conn:
            await conn.execute("SELECT 1")
        logger.info("Neon PostgreSQL connection established")
    except Exception as e:
        logger.error(f"Failed to initialize databases: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down Calmi API...")
    client.close()
    pool = await get_postgres_pool()
    await pool.close()

# Import create_access_token from auth.py
from auth import create_access_token