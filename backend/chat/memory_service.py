import uuid
from typing import List
from fastapi import Request, HTTPException, status
from services.services import get_user_memories_vector
from auth import User
from .models import MemoryEntry

async def get_memories_service(request: Request, current_user: User) -> List[MemoryEntry]:
    pool = request.app.state.db_pool
    memories = await get_user_memories_vector(pool, current_user['email'], "", limit=50)
    
    return [MemoryEntry(
        id=str(uuid.uuid4()),
        content=mem['content'],
        metadata=mem['metadata'],
        created_at=mem['created_at'],
        relevance_score=mem.get('relevance_score', 0.0)
    ) for mem in memories]

async def get_memories_by_category_service(
    category: str, 
    request: Request, 
    current_user: User
) -> List[MemoryEntry]:
    pool = request.app.state.db_pool
    memories = await get_user_memories_vector(
        pool, current_user['email'], 
        category, limit=20, 
        filter_metadata={'category': category}
    )
    
    return [MemoryEntry(
        id=str(uuid.uuid4()),
        content=mem['content'],
        metadata=mem['metadata'],
        created_at=mem['created_at'],
        relevance_score=mem.get('relevance_score', 0.0)
    ) for mem in memories]

async def delete_memory_service(
    memory_id: str, 
    request: Request, 
    current_user: User
):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM user_memories WHERE user_id = $1 AND metadata->>'temp_id' = $2",
            current_user['email'], memory_id
        )
        if result.strip() == "DELETE 0":
            raise HTTPException(
                status_code=404, 
                detail="Memory not found or you don't have permission to delete it."
            )