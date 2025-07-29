from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime
from auth import router as auth_router
from chat import router as chat_router

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv('DB_NAME', 'test_database')]

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
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Failed to create database indexes: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down Calmi API...")
    client.close()