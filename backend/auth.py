from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from authlib.integrations.starlette_client import OAuth, OAuthError
from starlette.config import Config
from starlette.requests import Request
import os
from dotenv import load_dotenv

router = APIRouter()

# Explicitly load .env file
env_path = os.path.join(os.path.dirname(__file__), '.env')
print(f"Looking for .env file at: {env_path}")
if not os.path.exists(env_path):
    print(f"ERROR: .env file not found at {env_path}")
load_dotenv(env_path)

# Environment variables
config = Config('.env')
print("Loaded environment variables:", {
    "GOOGLE_CLIENT_ID": os.getenv('GOOGLE_CLIENT_ID'),
    "GOOGLE_CLIENT_SECRET": os.getenv('GOOGLE_CLIENT_SECRET'),
    "REDIRECT_URI": os.getenv('REDIRECT_URI')
})

oauth = OAuth(config)
try:
    oauth.register(
        name='google',
        client_id=os.getenv('GOOGLE_CLIENT_ID'),
        client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}
    )
except Exception as e:
    print(f"Failed to register Google OAuth client: {str(e)}")
    raise Exception(f"Google OAuth client registration failed: {str(e)}")

# MongoDB setup
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'test_database')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# JWT setup
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class User(BaseModel):
    email: str
    password: str | None = None
    full_name: str | None = None
    google_id: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str

class GoogleCallbackRequest(BaseModel):
    code: str

async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email})

async def create_user(user: User):
    user_dict = user.dict(exclude_unset=True)
    if user.password:
        user_dict['password'] = pwd_context.hash(user.password)
    await db.users.insert_one(user_dict)
    return user_dict

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/auth/register")
async def register(user: User):
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    await create_user(user)
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/login")
async def login(user: User):
    db_user = await get_user_by_email(user.email)
    if not db_user or not pwd_context.verify(user.password, db_user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/auth/google/url")
async def google_login(redirect_uri: str, request: Request):
    try:
        if not os.getenv('GOOGLE_CLIENT_ID'):
            raise HTTPException(status_code=500, detail="Google Client ID not found in environment variables")
        
        google = oauth.create_client('google')
        if not google:
            raise HTTPException(status_code=500, detail="Google OAuth client not configured")
        
        # Generate the authorization URL
        auth_data = await google.create_authorization_url(redirect_uri=redirect_uri)
        auth_url = auth_data.get('url')
        state = auth_data.get('state')
        if not auth_url or not state:
            raise HTTPException(status_code=500, detail="Failed to generate authorization URL or state")
        
        print(f"Generated Google OAuth URL: {auth_url}, State: {state}")
        print(f"Session before auth: {request.session}")
        return {"url": auth_url}
    except Exception as e:
        print(f"Error generating Google OAuth URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Google OAuth URL: {str(e)}")

@router.post("/auth/google")
async def google_callback(request: Request, body: GoogleCallbackRequest):
    try:
        code = body.code
        if not code:
            print("Google OAuth error: Authorization code is missing")
            raise HTTPException(status_code=422, detail="Missing authorization code")
        
        print(f"Received authorization code: {code}")
        print(f"Session during callback: {request.session}")
        google = oauth.create_client('google')
        if not google:
            print("Google OAuth error: OAuth client not configured")
            raise HTTPException(status_code=500, detail="Google OAuth client not configured")
        
        # Exchange code for token
        try:
            token = await google.authorize_access_token(
                request,
                redirect_uri=os.getenv('REDIRECT_URI', 'http://localhost:3000/google-callback')
            )
        except OAuthError as oauth_err:
            print(f"Google OAuth error during token exchange: {str(oauth_err)} - Error: {oauth_err.error}, Description: {oauth_err.description}")
            raise HTTPException(status_code=422, detail=f"Failed to exchange code for token: {oauth_err.error} - {oauth_err.description}")
        except Exception as token_err:
            print(f"Unexpected error during token exchange: {str(token_err)}")
            raise HTTPException(status_code=422, detail=f"Unexpected error during token exchange: {str(token_err)}")
        
        print(f"Received token: {token}")
        user_info = token.get('userinfo')
        if not user_info:
            print("Google OAuth error: Failed to retrieve user info")
            raise HTTPException(status_code=400, detail="Failed to retrieve user info from Google")
        
        email = user_info.get('email')
        full_name = user_info.get('name')
        google_id = user_info.get('sub')

        if not email or not google_id:
            print(f"Google OAuth error: Invalid user info - email: {email}, google_id: {google_id}")
            raise HTTPException(status_code=400, detail="Invalid Google user info")
        
        existing_user = await get_user_by_email(email)
        if not existing_user:
            user = User(email=email, full_name=full_name, google_id=google_id)
            await create_user(user)
        else:
            if not existing_user.get('google_id'):
                await db.users.update_one(
                    {"email": email},
                    {"$set": {"google_id": google_id, "full_name": full_name}}
                )
        
        access_token = create_access_token(data={"sub": email})
        print(f"Generated access token for user: {email}")
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"Google OAuth error: {str(e)}")
        raise HTTPException(status_code=422, detail=f"Google OAuth error: {str(e)}")