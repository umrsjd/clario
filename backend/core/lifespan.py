import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from config.database import create_database_pool, setup_database_schema
from config.app import config
from services.services import _load_sentiment_model, embedding_model

logger = config.get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown events."""
    
    # --- STARTUP ---
    logger.info("Application startup: Initializing resources...")
    
    try:
        # Initialize database
        pool = await create_database_pool()
        app.state.db_pool = pool
        
        # Setup database schema
        await setup_database_schema(pool)
        
    except Exception as e:
        logger.critical(f"Failed during database setup: {e}", exc_info=True)
        raise

    try:
        # Pre-load ML models
        logger.info("Pre-loading ML models...")
        _load_sentiment_model()
        embedding_model.encode("Pre-load test")
        logger.info("Successfully pre-loaded ML models.")
    except Exception as e:
        logger.warning(f"Failed to pre-load ML models: {e}")

    logger.info("Application startup complete.")
    
    yield
    
    # --- SHUTDOWN ---
    logger.info("Application shutdown: Closing resources...")
    
    if hasattr(app.state, 'db_pool') and app.state.db_pool:
        await app.state.db_pool.close()
        logger.info("Database pool closed.")
    
    logger.info("Application shutdown complete.")