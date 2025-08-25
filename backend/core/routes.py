from fastapi import FastAPI

# Import routers
from auth import router as auth_router
from chat import router as chat_router

def setup_routes(app: FastAPI) -> None:
    """Configure all routes for the application."""
    
    # Include routers with prefixes
    app.include_router(auth_router, prefix="/api", tags=["Authentication"])
    app.include_router(chat_router, prefix="/api", tags=["Chat"])
    
    # Health check routes
    @app.get("/", tags=["Health"])
    async def root():
        """Root endpoint."""
        return {
            "message": "Clario AI Companion API is running", 
            "version": "2.0.0"
        }

    @app.get("/health", tags=["Health"])
    async def health_check():
        """Health check endpoint."""
        return {
            "status": "healthy", 
            "service": "clario-api"
        }
    
    # Add other route configurations here as needed