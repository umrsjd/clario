#!/usr/bin/env python3
"""
Main server entry point for Clario AI Companion API.

This module creates and runs the FastAPI application using the modular
architecture defined in the backend.core module.
"""

from core.app import create_app
from config.app import config

# Create the FastAPI application
app = create_app()

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "server:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.RELOAD
    )