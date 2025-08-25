from fastapi import FastAPI

from config.app import config
from core.lifespan import lifespan
from core.middleware import setup_middleware
from core.routes import setup_routes

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    # Initialize FastAPI app
    app = FastAPI(
        title=config.TITLE,
        description=config.DESCRIPTION,
        version=config.VERSION,
        lifespan=lifespan
    )
    
    # Setup middleware
    setup_middleware(app)
    
    # Setup routes
    setup_routes(app)
    
    return app