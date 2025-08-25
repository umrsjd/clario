import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Configuration ---
logging.basicConfig(level=logging.INFO)

class AppConfig:
    """Application configuration settings."""
    
    # API Information
    TITLE = "Clario AI Companion API"
    DESCRIPTION = "An AI companion that remembers and learns from conversations"
    VERSION = "2.0.0"
    
    # CORS Settings
    CORS_ORIGINS = [
        "http://localhost:3000", 
        "https://clario.co.in", 
        "https://www.clario.co.in"
    ]
    
    # Database
    DATABASE_URL = os.getenv("NEON_DATABASE_URL")
    DB_MIN_SIZE = 5
    DB_MAX_SIZE = 20
    
    # Server Settings
    HOST = "0.0.0.0"
    PORT = 8001
    RELOAD = True
    
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    @classmethod
    def get_logger(cls, name: str = __name__) -> logging.Logger:
        """Get a configured logger instance."""
        return logging.getLogger(name)

# Create global config instance
config = AppConfig()