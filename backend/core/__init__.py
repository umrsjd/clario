# Core package initialization
from .app import create_app
from .lifespan import lifespan
from .middleware import setup_middleware
from .routes import setup_routes

__all__ = [
    "create_app",
    "lifespan", 
    "setup_middleware",
    "setup_routes"
]