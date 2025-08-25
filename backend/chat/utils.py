import uuid
import re
from datetime import datetime
from typing import List
from fastapi import Request
from .models import Conversation, ChatMessage
import google.generativeai as genai
import os

# --- Helper Functions ---
async def get_conversation(request: Request, conversation_id: str, user_id: str):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        conversation_row = await conn.fetchrow(
            "SELECT * FROM conversations WHERE id = $1 AND user_id = $2", 
            uuid.UUID(conversation_id), user_id
        )
        if conversation_row:
            conversation_dict = dict(conversation_row)
            conversation_dict['id'] = str(conversation_dict['id'])
            return Conversation(**conversation_dict)
        return None

async def create_conversation(request: Request, user_id: str, first_message: str):
    model = genai.GenerativeModel(os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash"))
    print(os.getenv("GEMINI_MODEL_NAME"))
    prompt = f"Generate a short, concise title (3-4 words max) for a conversation that starts with: \"{first_message[:100]}\""
    
    try:
        response = await model.generate_content_async(prompt)
        title = response.text.strip().replace('"', '')[:50]
    except:
        words = first_message.split()[:3]
        title = " ".join(words).title()
    
    conversation_id = str(uuid.uuid4())
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO conversations (id, user_id, title, created_at, updated_at) VALUES ($1, $2, $3, $4, $4)", 
            uuid.UUID(conversation_id), user_id, title, datetime.utcnow()
        )
    return conversation_id, title

async def save_message(request: Request, conversation_id: str, user_id: str, content: str, role: str):
    message_id = str(uuid.uuid4())
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO messages (id, conversation_id, user_id, content, role, timestamp) VALUES ($1, $2, $3, $4, $5, $6)", 
            uuid.UUID(message_id), uuid.UUID(conversation_id), user_id, content, role, datetime.utcnow()
        )
    return message_id

async def get_conversation_messages(request: Request, conversation_id: str, user_id: str, limit: int = 8):
    """Get recent messages for short-term context"""
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        messages_raw = await conn.fetch(
            """
            SELECT * FROM (
                SELECT * FROM messages 
                WHERE conversation_id = $1 AND user_id = $2 
                ORDER BY timestamp DESC 
                LIMIT $3
            ) AS recent_messages ORDER BY timestamp ASC;
            """,
            uuid.UUID(conversation_id), user_id, limit
        )
    return [ChatMessage(
        id=str(msg['id']),
        conversation_id=str(msg['conversation_id']),
        user_id=msg['user_id'],
        content=msg['content'],
        role=msg['role'],
        timestamp=msg['timestamp']
    ) for msg in messages_raw]

def post_process_response(response: str, chat_history: List[ChatMessage]) -> str:
    """Post-process response to ensure appropriate tone and avoid repetition"""
    
    # Remove overly dramatic phrases
    dramatic_phrases = [
        "let's grab coffee", "let's brainstorm", "that's absolutely", "i totally understand",
        "that sounds incredibly", "wow, that's really", "oh my goodness", "that's so tough",
        "i can only imagine", "that must be so hard"
    ]
    
    response_lower = response.lower()
    for phrase in dramatic_phrases:
        if phrase in response_lower:
            if "grab coffee" in phrase:
                response = response.replace(phrase, "talk about it")
            elif "brainstorm" in phrase:
                response = response.replace(phrase, "think through it")
            else:
                response = re.sub(re.escape(phrase), "", response, flags=re.IGNORECASE)
                response = re.sub(r'\s+', ' ', response).strip()
    
    # Avoid repetitive conversation starters
    if chat_history and len(chat_history) > 2:
        recent_ai_responses = [msg.content for msg in chat_history[-3:] if msg.role == "assistant"]
        
        starter_words = ["hey", "oh", "yeah", "hmm", "right", "so"]
        response_start = response.lower().split()[0] if response.split() else ""
        
        if response_start in starter_words:
            used_starters = [resp.lower().split()[0] for resp in recent_ai_responses if resp.split()]
            if used_starters.count(response_start) >= 2:
                alternatives = {"hey": "Right,", "oh": "Hmm,", "yeah": "I see,", "so": "Well,"}
                if response_start in alternatives:
                    response = response.replace(response.split()[0], alternatives[response_start], 1)
                else:
                    response = " ".join(response.split()[1:])
    
    # Ensure response isn't too long
    sentences = response.split('.')
    if len(sentences) > 3:
        response = '. '.join(sentences[:2]) + '.'
    
    response = re.sub(r'\s+', ' ', response).strip()
    return response