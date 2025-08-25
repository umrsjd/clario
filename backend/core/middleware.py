from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.app import config

def setup_middleware(app: FastAPI) -> None:
    """Configure all middleware for the application."""
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add other middleware here as needed
    # Example: Authentication middleware, rate limiting, etc.