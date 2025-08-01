import os
import logging
import resend
import random
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import asyncpg
import jwt
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.responses import RedirectResponse
import httpx
from auth import REDIRECT_URI


# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
neon_url = os.getenv("NEON_DATABASE_URL")
resend.api_key = os.getenv("RESEND_API_KEY")
from_email = os.getenv("RESEND_FROM_EMAIL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# JWT settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialize FastAPI app
app = FastAPI()
api_router = APIRouter()

# CORS Middleware
origins = [
    "http://localhost:3000",
    "https://clario.co.in",
    "https://www.clario.co.in"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth setup
oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

# Database pool
async def get_postgres_pool():
    try:
        pool = await asyncpg.create_pool(neon_url, timeout=30)
        logger.debug("Successfully created Neon PostgreSQL pool")
        return pool
    except Exception as e:
        logger.error(f"Failed to create Neon PostgreSQL pool: {str(e)}")
        raise HTTPException(status_code=500, detail="Database connection failed")

# JWT token creation
def create_access_token(data: dict):
    logger.debug(f"Creating JWT with data: {data}")
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    try:
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
        logger.debug("JWT created successfully")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Failed to create JWT: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create access token")

# Pydantic models
class OTPRequest(BaseModel):
    email: str

class OTPVerifyRequest(BaseModel):
    email: str
    code: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

# Routes
@api_router.post("/auth/send-otp")
async def send_otp(request: OTPRequest):
    logger.debug(f"Sending OTP to email: {request.email}")
    otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    try:
        pool = await get_postgres_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3) "
                "ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3",
                request.email, otp_code, expires_at
            )
        r = resend.Emails.send({
            "from": from_email,
            "to": request.email,
            "subject": "Your Clario OTP Code",
            "html": f"<p>Your OTP code is <strong>{otp_code}</strong>. It expires in 10 minutes.</p>"
        })
        logger.debug(f"OTP sent successfully to {request.email}")
        return {"message": "OTP sent successfully"}
    except Exception as e:
        logger.error(f"Failed to send OTP to {request.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")

@api_router.post("/auth/verify-otp")
async def verify_otp(request: OTPVerifyRequest):
    logger.debug(f"Verifying OTP for email: {request.email}, code: {request.code}")
    try:
        pool = await get_postgres_pool()
        async with pool.acquire() as conn:
            # Check if users table exists
            table_check = await conn.fetchrow(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
            )
            if not table_check['exists']:
                logger.error("Users table does not exist in the database")
                raise HTTPException(status_code=500, detail="Database schema error: users table missing")

            logger.debug(f"Fetching OTP for email: {request.email}")
            result = await conn.fetchrow(
                "SELECT code, expires_at FROM otp_codes WHERE email = $1",
                request.email
            )
            if not result:
                logger.error(f"No OTP found for email: {request.email}")
                raise HTTPException(status_code=400, detail="No OTP found for this email")
            logger.debug(f"OTP found: {result['code']}, expires_at: {result['expires_at']}")
            if result['expires_at'] < datetime.utcnow():
                logger.debug(f"OTP expired for email: {request.email}")
                await conn.execute("DELETE FROM otp_codes WHERE email = $1", request.email)
                raise HTTPException(status_code=400, detail="OTP has expired")
            if result['code'] != request.code:
                logger.debug(f"Invalid OTP for email: {request.email}")
                raise HTTPException(status_code=400, detail="Invalid OTP")
            logger.debug(f"Deleting OTP for email: {request.email}")
            await conn.execute("DELETE FROM otp_codes WHERE email = $1", request.email)
            logger.debug(f"Fetching user for email: {request.email}")
            user = await conn.fetchrow("SELECT email, full_name FROM users WHERE email = $1", request.email)
            if not user:
                full_name = request.email.split('@')[0]
                logger.debug(f"Creating new user for email: {request.email}")
                await conn.execute(
                    "INSERT INTO users (email, full_name) VALUES ($1, $2)",
                    request.email, full_name
                )
            logger.debug(f"Generating JWT for email: {request.email}")
            access_token = create_access_token(data={"sub": request.email})
            return {"access_token": access_token, "token_type": "bearer"}
    except asyncpg.exceptions.UndefinedTableError as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database schema error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during OTP verification: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected error during OTP verification")

@api_router.get("/auth/google/url")
async def google_auth_url(request: Request, redirect_uri: str):
    logger.debug(f"Generating Google OAuth URL with redirect_uri: {redirect_uri}")
    try:
        url = await oauth.google.create_authorization_url(redirect_uri=redirect_uri)
        return {"url": url}
    except Exception as e:
        logger.error(f"Failed to generate Google OAuth URL: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate Google auth URL")

@api_router.get("/auth/google/callback")
@api_router.post("/auth/google")
async def google_callback_post(request: Request, body: dict):
    logger.debug(f"Processing Google OAuth callback via POST: {body}")
    try:
        code = body.get('code')
        if not code:
            logger.error("No authorization code provided")
            raise HTTPException(status_code=422, detail="Missing authorization code")
            
        # Manual token exchange
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'client_id': os.getenv('GOOGLE_CLIENT_ID'),
                    'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
                    'code': code,
                    'grant_type': 'authorization_code',
                    'redirect_uri': REDIRECT_URI
                }
            )
            
        if token_response.status_code != 200:
            logger.error(f"Token exchange failed: {token_response.text}")
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")
            
        token_data = token_response.json()
        id_token = token_data.get('id_token')
        
        # Get user info from ID token
        user_info = jwt.decode(id_token, options={"verify_signature": False})
        email = user_info.get('email')
        full_name = user_info.get('name', email.split('@')[0])
        google_id = user_info.get('sub')
        
        # Create or update user
        pool = await get_postgres_pool()
        async with pool.acquire() as conn:
            user = await conn.fetchrow("SELECT email, full_name FROM users WHERE email = $1", email)
            if not user:
                await conn.execute(
                    "INSERT INTO users (email, full_name, google_id) VALUES ($1, $2, $3)",
                    email, full_name, google_id
                )
                
        # Create JWT token
        access_token = create_access_token(data={"sub": email})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Google OAuth callback error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    logger.debug(f"Login attempt for email: {request.email}")
    try:
        pool = await get_postgres_pool()
        async with pool.acquire() as conn:
            user = await conn.fetchrow("SELECT email, password, full_name FROM users WHERE email = $1", request.email)
            if not user or user['password'] != request.password:
                logger.debug(f"Invalid login credentials for email: {request.email}")
                raise HTTPException(status_code=400, detail="Invalid credentials")
            access_token = create_access_token(data={"sub": request.email})
            return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@api_router.post("/auth/register")
async def register(request: RegisterRequest):
    logger.debug(f"Register attempt for email: {request.email}")
    try:
        pool = await get_postgres_pool()
        async with pool.acquire() as conn:
            existing_user = await conn.fetchrow("SELECT email FROM users WHERE email = $1", request.email)
            if existing_user:
                logger.debug(f"User already exists: {request.email}")
                raise HTTPException(status_code=400, detail="Email already registered")
            await conn.execute(
                "INSERT INTO users (email, password, full_name) VALUES ($1, $2, $3)",
                request.email, request.password, request.full_name
            )
        access_token = create_access_token(data={"sub": request.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Register error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@api_router.get("/auth/me")
async def get_current_user(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        logger.debug("No token provided in /auth/me")
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            logger.debug("Invalid token: no email in payload")
            raise HTTPException(status_code=401, detail="Invalid token")
        pool = await get_postgres_pool()
        async with pool.acquire() as conn:
            user = await conn.fetchrow("SELECT email, full_name FROM users WHERE email = $1", email)
            if not user:
                logger.debug(f"User not found for email: {email}")
                raise HTTPException(status_code=401, detail="User not found")
            return {"email": user['email'], "full_name": user['full_name']}
    except jwt.PyJWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)