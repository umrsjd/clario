import uuid
import json
from datetime import datetime
from typing import List
from fastapi import Request, HTTPException
from services.services import get_user_memories_vector
from auth import User
from .models import FollowUp
from .config import logger

async def get_user_relationships_service(request: Request, current_user: User):
    pool = request.app.state.db_pool
    memories = await get_user_memories_vector(
        pool, current_user['email'], 
        "relationships friends family", limit=10,
        filter_metadata={'type': 'relationship'}
    )
    
    relationships = {}
    for memory in memories:
        if 'person_name' in memory['metadata']:
            person_name = memory['metadata']['person_name']
            if person_name not in relationships:
                relationships[person_name] = memory['metadata']
    
    return {"relationships": relationships}

async def get_person_details_service(
    person_name: str,
    request: Request, 
    current_user: User
):
    pool = request.app.state.db_pool
    memories = await get_user_memories_vector(
        pool, current_user['email'], 
        person_name, limit=15
    )
    
    person_data = {
        "name": person_name,
        "interactions": [],
        "conversations_mentioned": []
    }
    
    for memory in memories:
        if person_name.lower() in memory['content'].lower():
            person_data['interactions'].append({
                "content": memory['content'],
                "metadata": memory['metadata'],
                "date": memory['created_at'].isoformat()
            })
            
            if 'conversation_id' in memory['metadata']:
                person_data['conversations_mentioned'].append(memory['metadata']['conversation_id'])
    
    person_data['conversations_mentioned'] = list(set(person_data['conversations_mentioned']))
    return person_data

async def get_ongoing_situations_service(request: Request, current_user: User):
    pool = request.app.state.db_pool
    memories = await get_user_memories_vector(
        pool, current_user['email'], 
        "situation ongoing current", limit=10,
        filter_metadata={'type': 'situation'}
    )
    
    return [{
        "content": mem['content'], 
        "data": mem['metadata'], 
        "updated": mem['created_at']
    } for mem in memories]

async def get_user_follow_ups_service(request: Request, current_user: User) -> List[FollowUp]:
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        follow_ups = await conn.fetch(
            "SELECT id, topic FROM follow_ups WHERE user_id = $1 AND due_at <= NOW() AND completed_at IS NULL",
            current_user['email']
        )
    return [FollowUp(id=str(f['id']), topic=f['topic']) for f in follow_ups]

async def complete_follow_up_service(
    follow_up_id: str, 
    request: Request, 
    current_user: User
):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE follow_ups SET completed_at = $1 WHERE id = $2 AND user_id = $3",
            datetime.utcnow(), uuid.UUID(follow_up_id), current_user['email']
        )
    return {"message": "Follow-up marked as complete"}

async def debug_user_context_service(
    query: str,
    request: Request,
    current_user: User
):
    pool = request.app.state.db_pool
    memories = await get_user_memories_vector(pool, current_user['email'], query, limit=10)
    
    return {
        "query": query,
        "has_memories": len(memories) > 0,
        "retrieved_memories": memories[:5],  # Show top 5 for debug
        "total_memories": len(memories),
        "memory_types": list(set(mem['metadata'].get('type', 'unknown') for mem in memories))
    }

async def update_user_profile_service(
    profile_data: dict, 
    request: Request,
    current_user: User
):
    pool = request.app.state.db_pool
    try:
        async with pool.acquire() as conn:
            existing_profile_raw = await conn.fetchval(
                "SELECT user_profile FROM users WHERE email = $1", current_user['email']
            )
            existing_profile = json.loads(existing_profile_raw) if existing_profile_raw else {}
            existing_profile.update(profile_data)
            
            if 'full_name' in existing_profile and existing_profile['full_name']:
                existing_profile['user_name'] = existing_profile['full_name']
            elif current_user['email']:
                existing_profile['user_name'] = current_user['email']
            else:
                existing_profile['user_name'] = 'User'
            
            await conn.execute(
                "UPDATE users SET user_profile = $1 WHERE email = $2", 
                json.dumps(existing_profile), current_user['email']
            )
            
        return {
            "message": "Profile updated successfully",
            "user_name": existing_profile['user_name']
        }
        
    except Exception as e:
        logger.error(f"Error updating profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update user profile")

async def reset_user_data_service(
    request: Request, 
    current_user: dict
):
    pool = request.app.state.db_pool
    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                await conn.execute("DELETE FROM follow_ups WHERE user_id = $1", current_user['email'])
                await conn.execute("DELETE FROM user_memories WHERE user_id = $1", current_user['email'])
                await conn.execute("DELETE FROM messages WHERE user_id = $1", current_user['email'])
                await conn.execute("DELETE FROM conversations WHERE user_id = $1", current_user['email'])
                
                await conn.execute(
                    """UPDATE users 
                       SET user_profile = NULL, full_name = NULL 
                       WHERE email = $1""", 
                    current_user['email']
                )
                
                logger.info(f"Successfully reset all data for user: {current_user['email']}")
        
        return {"message": "All user data reset successfully. Starting fresh."}
    
    except Exception as e:
        logger.error(f"Error resetting user data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to reset user data")