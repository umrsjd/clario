import uuid
from typing import List
from datetime import datetime
from fastapi import Request, HTTPException
from auth import User
from .models import Conversation, ConversationHistory
from .utils import get_conversation, get_conversation_messages

async def get_conversations_service(request: Request, current_user: User) -> List[Conversation]:
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        conversations = await conn.fetch(
            "SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC",
            current_user['email']
        )
    return [Conversation(
        id=str(conv['id']), user_id=conv['user_id'], title=conv['title'],
        created_at=conv['created_at'], updated_at=conv['updated_at']
    ) for conv in conversations]

async def get_conversation_history_service(
    conversation_id: str,
    request: Request,
    current_user: User
) -> ConversationHistory:
    conversation = await get_conversation(request, conversation_id, current_user['email'])
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = await get_conversation_messages(request, conversation_id, current_user['email'], limit=50)
    return ConversationHistory(conversation_id=conversation_id, messages=messages)

async def delete_conversation_service(
    conversation_id: str,
    request: Request,
    current_user: User
):
    conversation = await get_conversation(request, conversation_id, current_user['email'])
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM conversations WHERE id = $1", uuid.UUID(conversation_id))
    return {"message": "Conversation deleted successfully"}

async def update_conversation_title_service(
    conversation_id: str,
    title: str,
    request: Request,
    current_user: User
):
    conversation = await get_conversation(request, conversation_id, current_user['email'])
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE conversations SET title = $1, updated_at = $2 WHERE id = $3",
            title, datetime.utcnow(), uuid.UUID(conversation_id)
        )
    return {"message": "Title updated successfully"}