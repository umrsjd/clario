from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import google.generativeai as genai
from auth import get_current_user, User

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    conversation = await db.conversations.find_one({
        "_id": conversation_id,
        "user_id": user_id
    })
    if conversation:
        conversation["id"] = str(conversation["_id"])
        return Conversation(**conversation)
    return None

async def create_conversation(user_id: str, title: str = "New Conversation"):
    conversation_dict = {
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.conversations.insert_one(conversation_dict)
    return conversation_dict["_id"]

async def save_message(conversation_id: str, user_id: str, content: str, role: str):
    message_dict = {
        "_id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "user_id": user_id,
        "content": content,
        "role": role,
        "timestamp": datetime.utcnow()
    }
    await db.messages.insert_one(message_dict)
    return message_dict["_id"]

async def get_conversation_messages(conversation_id: str, user_id: str):
    messages = await db.messages.find({
        "conversation_id": conversation_id,
        "user_id": user_id
    }).sort("timestamp", 1).to_list(1000)
    
    return [ChatMessage(
        id=str(msg["_id"]),
        conversation_id=msg["conversation_id"],
        user_id=msg["user_id"],
        content=msg["content"],
        role=msg["role"],
        timestamp=msg["timestamp"]
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
            conversation_id = await create_conversation(current_user.id, "New Chat")
        else:
            conversation = await get_conversation(conversation_id, current_user.id)
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

        # Save user message
        user_message_id = await save_message(
            conversation_id,
            current_user.id,
            chat_request.message,
            "user"
        )

        # Get conversation history
        messages = await get_conversation_messages(conversation_id, current_user.id)

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
            current_user.id,
            ai_response,
            "assistant"
        )

        # Update timestamp
        await db.conversations.update_one(
            {"_id": conversation_id},
            {"$set": {"updated_at": datetime.utcnow()}}
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
    conversations = await db.conversations.find({
        "user_id": current_user.id
    }).sort("updated_at", -1).to_list(100)
    
    return [Conversation(
        id=str(conv["_id"]),
        user_id=conv["user_id"],
        title=conv["title"],
        created_at=conv["created_at"],
        updated_at=conv["updated_at"]
    ) for conv in conversations]

@router.get("/conversations/{conversation_id}", response_model=ConversationHistory)
async def get_conversation_history(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    conversation = await get_conversation(conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = await get_conversation_messages(conversation_id, current_user.id)
    
    return ConversationHistory(
        conversation_id=conversation_id,
        messages=messages
    )

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    conversation = await get_conversation(conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    await db.conversations.delete_one({"_id": conversation_id})
    await db.messages.delete_many({"conversation_id": conversation_id})
    
    return {"message": "Conversation deleted successfully"}

@router.post("/conversations/{conversation_id}/title")
async def update_conversation_title(
    conversation_id: str,
    title: str,
    current_user: User = Depends(get_current_user)
):
    conversation = await get_conversation(conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    await db.conversations.update_one(
        {"_id": conversation_id},
        {"$set": {"title": title, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Title updated successfully"}
