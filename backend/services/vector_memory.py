import asyncpg
import json
import uuid
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional
from sklearn.metrics.pairwise import cosine_similarity
from .config import logger, embedding_model

async def store_user_memory_vector(
    pool: asyncpg.Pool, 
    user_id: str, 
    original_message: str,
    extracted_info: Dict[str, Any], 
    conversation_id: str = None
):
    """Store user information using vector embeddings with proper error handling."""
    try:
        if not extracted_info.get('has_meaningful_content'):
            return
        
        info_to_store = []
        extracted_data = extracted_info.get('extracted_info', {})
        
        # Process all types of information
        for info_type, items in extracted_data.items():
            if items:  # Only process non-empty lists
                for item in items:
                    if item.strip():  # Only store non-empty items
                        info_to_store.append({
                            'content': item,
                            'type': info_type.rstrip('s'),  # Remove plural
                            'priority': extracted_info.get('priority', 'medium'),
                            'source_message': original_message
                        })
        
        if not info_to_store:
            return
        
        # Store each piece of information with vector embedding
        async with pool.acquire() as conn:
            for info in info_to_store:
                try:
                    # Create embedding for the content
                    embedding = embedding_model.encode(info['content'])
                    
                    # Create metadata
                    metadata = {
                        'type': info['type'],
                        'priority': info['priority'],
                        'conversation_id': conversation_id,
                        'key_entities': extracted_info.get('key_entities', []),
                        'information_type': extracted_info.get('information_type', 'other'),
                        'source_message': info['source_message'][:200],
                        'temp_id': str(uuid.uuid4())
                    }
                    
                    # Extract person name if it's a relationship
                    if info['type'] == 'people':
                        words = info['content'].split()
                        if words:
                            potential_name = words[0]
                            if potential_name.istitle():
                                metadata['person_name'] = potential_name
                    
                    # Check if we have vector support
                    try:
                        await conn.execute(
                            """INSERT INTO user_memories 
                            (id, user_id, conversation_id, content, embedding, metadata, created_at, updated_at) 
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $7)""",
                            uuid.uuid4(),
                            user_id,
                            uuid.UUID(conversation_id) if conversation_id else None,
                            info['content'],
                            embedding.tolist(),  # Try as vector first
                            json.dumps(metadata),
                            datetime.utcnow()
                        )
                    except Exception as vector_error:
                        # Fallback to text storage
                        await conn.execute(
                            """INSERT INTO user_memories 
                            (id, user_id, conversation_id, content, embedding, metadata, created_at, updated_at) 
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $7)""",
                            uuid.uuid4(),
                            user_id,
                            uuid.UUID(conversation_id) if conversation_id else None,
                            info['content'],
                            json.dumps(embedding.tolist()),  # Store as JSON string
                            json.dumps(metadata),
                            datetime.utcnow()
                        )
                    
                    logger.info(f"Stored vector memory: {info['type']} - {info['content'][:50]}")
                    
                except Exception as e:
                    logger.error(f"Error storing individual memory: {e}")
                    continue
                
    except Exception as e:
        logger.error(f"Error storing user memory: {e}")

async def get_user_memories_vector(
    pool: asyncpg.Pool, 
    user_id: str, 
    query: str, 
    limit: int = 10,
    filter_metadata: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """Retrieve user memories using vector similarity search with proper fallbacks."""
    try:
        async with pool.acquire() as conn:
            # Check if user has any memories
            try:
                memory_count = await conn.fetchval(
                    "SELECT COUNT(*) FROM user_memories WHERE user_id = $1",
                    user_id
                )
            except Exception as table_error:
                logger.error(f"user_memories table access error: {table_error}")
                return []
            
            if memory_count == 0:
                return []
            
            if not query.strip():
                # Return recent memories if no query
                memories = await conn.fetch(
                    """SELECT content, metadata, created_at, updated_at 
                       FROM user_memories 
                       WHERE user_id = $1 
                       ORDER BY updated_at DESC 
                       LIMIT $2""",
                    user_id, limit
                )
            else:
                # Vector similarity search
                query_embedding = embedding_model.encode(query)
                
                # Get all user memories with embeddings
                all_memories = await conn.fetch(
                    """SELECT content, embedding, metadata, created_at, updated_at 
                       FROM user_memories 
                       WHERE user_id = $1 
                       ORDER BY updated_at DESC""",
                    user_id
                )
                
                if not all_memories:
                    return []
                
                # Calculate similarities
                memory_similarities = []
                for memory in all_memories:
                    try:
                        # Handle both vector and JSON string embeddings
                        embedding_data = memory['embedding']
                        if isinstance(embedding_data, str):
                            memory_embedding = np.array(json.loads(embedding_data))
                        else:
                            memory_embedding = np.array(embedding_data)
                        
                        similarity = cosine_similarity(
                            query_embedding.reshape(1, -1), 
                            memory_embedding.reshape(1, -1)
                        )[0][0]
                        
                        # Apply metadata filters if provided
                        if filter_metadata:
                            memory_metadata = json.loads(memory['metadata']) if memory['metadata'] else {}
                            if not all(memory_metadata.get(k) == v for k, v in filter_metadata.items()):
                                continue
                        
                        memory_similarities.append({
                            'memory': memory,
                            'similarity': similarity
                        })
                    except Exception as e:
                        logger.warning(f"Error calculating similarity for memory: {e}")
                        # Include memory with low similarity as fallback
                        memory_similarities.append({
                            'memory': memory,
                            'similarity': 0.1
                        })
                        continue
                
                # Sort by similarity and take top results
                memory_similarities.sort(key=lambda x: x['similarity'], reverse=True)
                memories = [item['memory'] for item in memory_similarities[:limit]]
            
            # Format results
            result_memories = []
            for memory in memories:
                try:
                    metadata = json.loads(memory['metadata']) if memory['metadata'] else {}
                    result_memories.append({
                        'content': memory['content'],
                        'metadata': metadata,
                        'created_at': memory['created_at'],
                        'updated_at': memory.get('updated_at', memory['created_at']),
                        'relevance_score': getattr(memory, 'similarity', 0.0)
                    })
                except Exception as e:
                    logger.warning(f"Error formatting memory: {e}")
                    continue
            
            logger.info(f"Retrieved {len(result_memories)} memories for query: {query[:50]}")
            return result_memories
            
    except Exception as e:
        logger.error(f"Error retrieving vector memories: {e}")
        return []

async def update_user_context_vector(
    pool: asyncpg.Pool,
    user_id: str,
    user_message: str,
    ai_response: str,
    conversation_id: str = None
):
    """Update user context with the latest interaction using proper error handling."""
    try:
        # Create interaction summary
        interaction_content = f"User said: {user_message[:100]} | AI responded about: {ai_response[:50]}"
        
        # Create embedding for the interaction
        embedding = embedding_model.encode(interaction_content)
        
        # Create metadata for the interaction
        metadata = {
            'type': 'interaction',
            'priority': 'low',
            'conversation_id': conversation_id,
            'user_message_length': len(user_message),
            'ai_response_length': len(ai_response),
            'temp_id': str(uuid.uuid4())
        }
        
        async with pool.acquire() as conn:
            try:
                # Try vector storage first
                await conn.execute(
                    """INSERT INTO user_memories 
                    (id, user_id, conversation_id, content, embedding, metadata, created_at, updated_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $7)""",
                    uuid.uuid4(),
                    user_id,
                    uuid.UUID(conversation_id) if conversation_id else None,
                    interaction_content,
                    embedding.tolist(),
                    json.dumps(metadata),
                    datetime.utcnow()
                )
            except Exception as vector_error:
                # Fallback to JSON string storage
                await conn.execute(
                    """INSERT INTO user_memories 
                    (id, user_id, conversation_id, content, embedding, metadata, created_at, updated_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $7)""",
                    uuid.uuid4(),
                    user_id,
                    uuid.UUID(conversation_id) if conversation_id else None,
                    interaction_content,
                    json.dumps(embedding.tolist()),
                    json.dumps(metadata),
                    datetime.utcnow()
                )
            
            # Clean up old interaction memories (keep only last 20)
            await conn.execute(
                """DELETE FROM user_memories 
                WHERE user_id = $1 AND metadata->>'type' = 'interaction' 
                AND id NOT IN (
                    SELECT id FROM user_memories 
                    WHERE user_id = $1 AND metadata->>'type' = 'interaction' 
                    ORDER BY created_at DESC LIMIT 20
                )""",
                user_id
            )
            
    except Exception as e:
        logger.error(f"Error updating user context: {e}")