import os
import logging
import asyncpg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

async def create_database_pool():
    """Create and return a database connection pool."""
    try:
        pool = await asyncpg.create_pool(
            os.getenv("NEON_DATABASE_URL"), 
            min_size=5, 
            max_size=20
        )
        logger.info("Successfully created database pool.")
        return pool
    except Exception as e:
        logger.critical(f"Failed to create database pool: {e}", exc_info=True)
        raise

async def setup_database_schema(pool: asyncpg.Pool):
    """Setup all database tables and indexes."""
    async with pool.acquire() as conn:
        logger.info("Running database schema setup...")

        # Enable vector extension
        try:
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            logger.info("Vector extension enabled successfully.")
        except Exception as e:
            logger.warning(f"Could not enable vector extension: {e}. Continuing without vector support.")

        # Users table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                password TEXT,
                full_name TEXT,
                google_id TEXT,
                user_mcq_answers TEXT[],
                user_profile JSONB
            );
        """)

        # Conversations table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id UUID PRIMARY KEY, 
                user_id TEXT REFERENCES users(email) ON DELETE CASCADE, 
                title TEXT,
                created_at TIMESTAMPTZ NOT NULL, 
                updated_at TIMESTAMPTZ NOT NULL
            );
        """)

        # Messages table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY, 
                conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
                user_id TEXT REFERENCES users(email) ON DELETE CASCADE, 
                content TEXT NOT NULL, 
                role TEXT NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL
            );
        """)

        # User memories table with vector support
        try:
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS user_memories (
                    id UUID PRIMARY KEY,
                    user_id TEXT REFERENCES users(email) ON DELETE CASCADE,
                    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
                    content TEXT NOT NULL,
                    embedding VECTOR(384),
                    metadata JSONB,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ NOT NULL
                );
            """)
            logger.info("User memories table with vector support created.")

            # Create vector index for user_memories
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_user_memories_embedding 
                ON user_memories USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """)
            logger.info("Vector index for user_memories created successfully.")

        except Exception as e:
            logger.warning(f"Vector extension not available: {e}")
            # Fallback to storing embeddings as JSON text
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS user_memories (
                    id UUID PRIMARY KEY,
                    user_id TEXT REFERENCES users(email) ON DELETE CASCADE,
                    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
                    content TEXT NOT NULL,
                    embedding TEXT,
                    metadata JSONB,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ NOT NULL
                );
            """)
            logger.info("User memories table with text embedding fallback created.")

        # Enhanced structured memories table
        try:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS structured_memories (
                    id UUID PRIMARY KEY,
                    user_id TEXT REFERENCES users(email) ON DELETE CASCADE,
                    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
                    category TEXT NOT NULL,
                    content TEXT NOT NULL,
                    structured_data JSONB,
                    embedding VECTOR(384),
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ NOT NULL
                );
            """)

            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_structured_memories_embedding 
                ON structured_memories USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """)

        except Exception as e:
            logger.warning(f"Structured memories with vector not available: {e}")
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS structured_memories (
                    id UUID PRIMARY KEY,
                    user_id TEXT REFERENCES users(email) ON DELETE CASCADE,
                    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
                    category TEXT NOT NULL,
                    content TEXT NOT NULL,
                    structured_data JSONB,
                    embedding TEXT,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ NOT NULL
                );
            """)

        # Legacy memories table (keeping for backward compatibility)
        try:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS memories (
                    id UUID PRIMARY KEY, 
                    user_id TEXT REFERENCES users(email) ON DELETE CASCADE,
                    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
                    content TEXT NOT NULL, 
                    embedding VECTOR(384), 
                    timestamp TIMESTAMPTZ NOT NULL
                );
            """)
        except:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS memories (
                    id UUID PRIMARY KEY, 
                    user_id TEXT REFERENCES users(email) ON DELETE CASCADE,
                    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
                    content TEXT NOT NULL, 
                    embedding FLOAT[], 
                    timestamp TIMESTAMPTZ NOT NULL
                );
            """)

        # Follow-ups table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS follow_ups (
                id UUID PRIMARY KEY, 
                user_id TEXT REFERENCES users(email) ON DELETE CASCADE, 
                topic TEXT NOT NULL,
                due_at TIMESTAMPTZ NOT NULL, 
                completed_at TIMESTAMPTZ
            );
        """)

        # OTP codes table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS otp_codes (
                email TEXT PRIMARY KEY,
                code TEXT NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL
            );
        """)

        # Behavioral patterns tracking table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS behavioral_patterns (
                id UUID PRIMARY KEY,
                user_id TEXT REFERENCES users(email) ON DELETE CASCADE,
                pattern_type TEXT NOT NULL,
                pattern_data JSONB NOT NULL,
                confidence_score FLOAT,
                detected_at TIMESTAMPTZ NOT NULL,
                is_active BOOLEAN DEFAULT TRUE
            );
        """)

        # Create performance indexes
        await _create_indexes(conn)

        logger.info("Database schema setup complete.")

async def _create_indexes(conn):
    """Create all database indexes for better performance."""
    indexes = [
        """CREATE INDEX IF NOT EXISTS idx_user_memories_user_id 
           ON user_memories(user_id);""",
        
        """CREATE INDEX IF NOT EXISTS idx_user_memories_user_updated 
           ON user_memories(user_id, updated_at DESC);""",
        
        """CREATE INDEX IF NOT EXISTS idx_messages_user_timestamp 
           ON messages(user_id, timestamp DESC);""",
        
        """CREATE INDEX IF NOT EXISTS idx_conversations_user_updated 
           ON conversations(user_id, updated_at DESC);"""
    ]
    
    for index_sql in indexes:
        try:
            await conn.execute(index_sql)
        except Exception as e:
            logger.warning(f"Failed to create index: {e}")