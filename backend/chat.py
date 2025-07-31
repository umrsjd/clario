from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path
import asyncpg
import google.generativeai as genai
from auth import get_current_user, User

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Neon PostgreSQL connection
async def get_postgres_pool():
    neon_url = os.getenv('NEON_DATABASE_URL')
    if not neon_url:
        raise ValueError("NEON_DATABASE_URL not set in environment variables")
    return await asyncpg.create_pool(neon_url)

# Router
router = APIRouter(prefix="/chat", tags=["chat"])

# Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    user_id: str
    content: str
    role: str  # "user" or "assistant"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    message_id: str

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ConversationHistory(BaseModel):
    conversation_id: str
    messages: List[ChatMessage]

# Helper functions
async def get_conversation(conversation_id: str, user_id: str):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        conversation = await conn.fetchrow(
            "SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE id = $1 AND user_id = $2",
            uuid.UUID(conversation_id), user_id
        )
        if conversation:
            return Conversation(**dict(conversation))
        return None

async def create_conversation(user_id: str, title: str = "New Conversation"):
    conversation_id = str(uuid.uuid4())
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO conversations (id, user_id, title, created_at, updated_at) VALUES ($1, $2, $3, $4, $4)",
            uuid.UUID(conversation_id), user_id, title, datetime.utcnow()
        )
    return conversation_id

async def save_message(conversation_id: str, user_id: str, content: str, role: str):
    message_id = str(uuid.uuid4())
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO messages (id, conversation_id, user_id, content, role, timestamp) VALUES ($1, $2, $3, $4, $5, $6)",
            uuid.UUID(message_id), uuid.UUID(conversation_id), user_id, content, role, datetime.utcnow()
        )
    return message_id

async def get_conversation_messages(conversation_id: str, user_id: str):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        messages = await conn.fetch(
            "SELECT id, conversation_id, user_id, content, role, timestamp FROM messages WHERE conversation_id = $1 AND user_id = $2 ORDER BY timestamp ASC",
            uuid.UUID(conversation_id), user_id
        )
    return [ChatMessage(
        id=str(msg['id']),
        conversation_id=str(msg['conversation_id']),
        user_id=msg['user_id'],
        content=msg['content'],
        role=msg['role'],
        timestamp=msg['timestamp']
    ) for msg in messages]

# Routes
@router.post("/send", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        # Get or create conversation
        conversation_id = chat_request.conversation_id
        if not conversation_id:
            conversation_id = await create_conversation(current_user.email, "New Chat")
        else:
            conversation = await get_conversation(conversation_id, current_user.email)
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

        # Save user message
        user_message_id = await save_message(
            conversation_id,
            current_user.email,
            chat_request.message,
            "user"
        )

        # Get conversation history
        messages = await get_conversation_messages(conversation_id, current_user.email)

        # Prepare messages for Gemini
        conversation_history = [
            {
                "role": "user",
                "parts": [
                    """You are Calmi, a wise and empathetic AI companion designed to help users explore their thoughts, emotions, and behaviors. You are:

- Supportive and non-judgmental
- Curious about the user's experiences
- Focused on helping users gain insights about themselves
- Conversational and relatable, with a gentle Gen Z tone
- NOT a replacement for professional therapy
- Always remind users to seek professional help for serious mental health concerns

Your goal is to help users process their thoughts and feelings through meaningful conversation."""
                ]
            }
        ]

        # Add conversation history (last 10)
        for msg in messages[-10:]:
            conversation_history.append({
                "role": msg.role,
                "parts": [msg.content]
            })

        # Add current user message
        conversation_history.append({
            "role": "user",
            "parts": [chat_request.message]
        })

        # Gemini model
        model = genai.GenerativeModel("gemini-pro")
        response = await model.generate_content_async(conversation_history)
        ai_response = response.text.strip()

        # Save AI message
        ai_message_id = await save_message(
            conversation_id,
            current_user.email,
            ai_response,
            "assistant"
        )

        # Update timestamp
        pool = await get_postgres_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                "UPDATE conversations SET updated_at = $1 WHERE id = $2",
                datetime.utcnow(), uuid.UUID(conversation_id)
            )

        return ChatResponse(
            message=ai_response,
            conversation_id=conversation_id,
            message_id=ai_message_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.get("/conversations", response_model=List[Conversation])
async def get_conversations(current_user: User = Depends(get_current_user)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        conversations = await conn.fetch(
            "SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC",
            current_user.email
        )
    return [Conversation(
        id=str(conv['id']),
        user_id=conv['user_id'],
        title=conv['title'],
        created_at=conv['created_at'],
        updated_at=conv['updated_at']
    ) for conv in conversations]

@router.get("/conversations/{conversation_id}", response_model=ConversationHistory)
async def get_conversation_history(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    conversation = await get_conversation(conversation_id, current_user.email)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = await get_conversation_messages(conversation_id, current_user.email)
    
    return ConversationHistory(
        conversation_id=conversation_id,
        messages=messages
    )

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    conversation = await get_conversation(conversation_id, current_user.email)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM conversations WHERE id = $1", uuid.UUID(conversation_id))
        await conn.execute("DELETE FROM messages WHERE conversation_id = $1", uuid.UUID(conversation_id))
    
    return {"message": "Conversation deleted successfully"}

@router.post("/conversations/{conversation_id}/title")
async def update_conversation_title(
    conversation_id: str,
    title: str,
    current_user: User = Depends(get_current_user)
):
    conversation = await get_conversation(conversation_id, current_user.email)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE conversations SET title = $1, updated_at = $2 WHERE id = $3",
            title, datetime.utcnow(), uuid.UUID(conversation_id)
        )
    
    return {"message": "Title updated successfully"}