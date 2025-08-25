import os
import resend
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv

# --- Setup ---
load_dotenv()

# --- Configuration ---
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080
REDIRECT_URI = 'https://clario.co.in/google-callback' if os.getenv('ENVIRONMENT') == 'production' else 'http://localhost:3000/google-callback'
resend.api_key = os.getenv("RESEND_API_KEY")
from_email = os.getenv("RESEND_FROM_EMAIL")

# --- Security & OAuth ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
oauth = OAuth()

# Google OAuth setup with better error handling
try:
    oauth.register(
        name='google',
        client_id=os.getenv('GOOGLE_CLIENT_ID'),
        client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}
    )
    print("Google OAuth client registered successfully")
except Exception as e:
    print(f"Failed to register Google OAuth client: {str(e)}")