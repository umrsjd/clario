from fastapi import APIRouter, HTTPException, Depends, status, Request
from typing import List
from auth import get_current_user, User
from .models import (
    ChatRequest, ChatResponse, Conversation, ConversationHistory,
    MemoryEntry, FollowUp, UserProfileUpdateRequest
)
from .chat_service import process_chat_message
from .memory_service import (
    get_memories_service, get_memories_by_category_service, delete_memory_service
)
from .conversation_service import (
    get_conversations_service, get_conversation_history_service,
    delete_conversation_service, update_conversation_title_service
)
from .user_context_service import (
    get_user_relationships_service, get_person_details_service,
    get_ongoing_situations_service, get_user_follow_ups_service,
    complete_follow_up_service, debug_user_context_service,
    update_user_profile_service, reset_user_data_service
)

router = APIRouter(tags=["chat"])

# --- Enhanced API Endpoints ---
@router.post("/chat/send", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest, 
    request: Request, 
    current_user: User = Depends(get_current_user)
):
    return await process_chat_message(chat_request, request, current_user)

# --- Memory Management Endpoints ---
@router.get("/user/memories", response_model=List[MemoryEntry])
async def get_user_memories(request: Request, current_user: User = Depends(get_current_user)):
    return await get_memories_service(request, current_user)

@router.get("/user/memories/{category}")
async def get_memories_by_category(
    category: str, 
    request: Request, 
    current_user: User = Depends(get_current_user)
):
    return await get_memories_by_category_service(category, request, current_user)

@router.delete("/memories/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(
    memory_id: str, 
    request: Request, 
    current_user: User = Depends(get_current_user)
):
    await delete_memory_service(memory_id, request, current_user)

# --- User Context Endpoints ---
@router.get("/user/relationships")
async def get_user_relationships(request: Request, current_user: User = Depends(get_current_user)):
    return await get_user_relationships_service(request, current_user)

@router.get("/user/relationships/{person_name}")
async def get_person_details(
    person_name: str,
    request: Request, 
    current_user: User = Depends(get_current_user)
):
    return await get_person_details_service(person_name, request, current_user)

@router.get("/user/situations")
async def get_ongoing_situations(request: Request, current_user: User = Depends(get_current_user)):
    return await get_ongoing_situations_service(request, current_user)

@router.get("/user/follow-ups", response_model=List[FollowUp])
async def get_user_follow_ups(request: Request, current_user: User = Depends(get_current_user)):
    return await get_user_follow_ups_service(request, current_user)

@router.post("/follow-ups/{follow_up_id}/complete")
async def complete_follow_up(
    follow_up_id: str, 
    request: Request, 
    current_user: User = Depends(get_current_user)
):
    return await complete_follow_up_service(follow_up_id, request, current_user)

# --- Conversation management endpoints ---
@router.get("/chat/conversations", response_model=List[Conversation])
async def get_conversations(request: Request, current_user: User = Depends(get_current_user)):
    return await get_conversations_service(request, current_user)

@router.get("/chat/conversations/{conversation_id}", response_model=ConversationHistory)
async def get_conversation_history(
    conversation_id: str,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    return await get_conversation_history_service(conversation_id, request, current_user)

@router.delete("/chat/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    return await delete_conversation_service(conversation_id, request, current_user)

@router.post("/chat/conversations/{conversation_id}/title")
async def update_conversation_title(
    conversation_id: str,
    title: str,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    return await update_conversation_title_service(conversation_id, title, request, current_user)

# --- Debug and utility endpoints ---
@router.get("/debug/user-context/{query}")
async def debug_user_context(
    query: str,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    return await debug_user_context_service(query, request, current_user)

@router.post("/user/profile")
async def update_user_profile(
    profile_update: UserProfileUpdateRequest, 
    request: Request,
    current_user: User = Depends(get_current_user)
):
    return await update_user_profile_service(profile_update.profile_data, request, current_user)

@router.delete("/user/reset")
async def reset_user_data(
    request: Request, 
    current_user: dict = Depends(get_current_user)
):
    return await reset_user_data_service(request, current_user)