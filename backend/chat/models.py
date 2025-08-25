from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    user_id: str
    content: str
    role: str
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

class UserProfileUpdateRequest(BaseModel):
    profile_data: Dict[str, Any]

class Memory(BaseModel):
    id: str
    content: str
    category: Optional[str] = None

class MemoryEntry(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    created_at: datetime
    relevance_score: Optional[float] = None

class FollowUp(BaseModel):
    id: str
    topic: str