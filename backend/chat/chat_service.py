import random
import json
import uuid
from datetime import datetime
from typing import List
from fastapi import Request, HTTPException
from fastapi.concurrency import run_in_threadpool
from services.services import (
    get_sentiment, 
    extract_user_information, 
    construct_enhanced_prompt, 
    get_user_memories_vector,
    store_user_memory_vector,
    update_user_context_vector,
    call_ai_model_with_fallback
)
from auth import User
from .models import ChatRequest, ChatResponse
from .utils import (
    get_conversation, create_conversation, save_message, 
    get_conversation_messages, post_process_response
)
from .config import logger

async def process_chat_message(
    chat_request: ChatRequest, 
    request: Request, 
    current_user: User
) -> ChatResponse:
    try:
        pool = request.app.state.db_pool
        conversation_id = chat_request.conversation_id
        chat_history = []

        # Get or create conversation
        if not conversation_id:
            conversation_id, _ = await create_conversation(request, current_user['email'], chat_request.message)
        else:
            conversation = await get_conversation(request, conversation_id, current_user['email'])
            if not conversation: 
                raise HTTPException(status_code=404, detail="Conversation not found")
            chat_history = await get_conversation_messages(request, conversation_id, current_user['email'])

        # Get user profile
        user_profile_json = current_user.get('user_profile', '{}')
        user_profile = json.loads(user_profile_json) if user_profile_json and user_profile_json.startswith('{') else {}

        # Save user message first
        await save_message(request, conversation_id, current_user['email'], chat_request.message, "user")
        
        # Check if this is a simple greeting with no prior context
        is_simple_greeting = (
            len(chat_history) == 0 and 
            chat_request.message.lower().strip() in [
                'hello', 'hi', 'hey', 'hello clario', 'hi clario', 'hey there',
                'good morning', 'good afternoon', 'good evening'
            ]
        )
        
        if is_simple_greeting:
            greetings = [
                "Hi! How's it going?",
                "Hey! What's up?",
                "Hello! What's on your mind today?",
                "Hi there! How are you doing?",
                "Hey! Good to hear from you."
            ]
            ai_response = random.choice(greetings)
        else:
            # Full processing for substantive messages
            logger.info(f"Processing message: {chat_request.message}")
            
            # Extract and store user information using vector approach
            try:
                extracted_info = await extract_user_information(chat_request.message)
                logger.info(f"Extracted info: {extracted_info}")
                
                # Store meaningful information in vector memory
                if extracted_info.get('has_meaningful_content'):
                    await store_user_memory_vector(
                        pool, current_user['email'], 
                        chat_request.message, extracted_info, 
                        conversation_id
                    )
                    logger.info("Stored user information in vector memory")
                
                # Retrieve relevant memories using vector similarity
                relevant_memories = await get_user_memories_vector(
                    pool, current_user['email'], 
                    chat_request.message, limit=8
                )
                logger.info(f"Retrieved {len(relevant_memories)} relevant memories")
                
            except Exception as extraction_error:
                logger.error(f"Error in information extraction/storage: {extraction_error}")
                extracted_info = {"has_meaningful_content": False}
                relevant_memories = []
            
            # Build conversation context
            conversation_context = ""
            if chat_history:
                conversation_context = "RECENT CONVERSATION:\n"
                for msg in chat_history[-4:]:
                    role_label = "You" if msg.role == "user" else "Clario"
                    conversation_context += f"{role_label}: {msg.content}\n"
            
            # Generate response with enhanced context
            try:
                sentiment = await run_in_threadpool(get_sentiment, chat_request.message)
                
                final_prompt = construct_enhanced_prompt(
                    chat_request.message, 
                    sentiment, 
                    relevant_memories, 
                    user_profile, 
                    chat_history,
                    has_memories=len(relevant_memories) > 0
                )
                
                # Generate AI response with fallback
                ai_response = await call_ai_model_with_fallback(final_prompt)
                
                # Post-process the response
                ai_response = post_process_response(ai_response, chat_history)
                
            except Exception as ai_error:
                logger.error(f"Error generating AI response: {ai_error}")
                # Better contextual fallback responses
                message_lower = chat_request.message.lower()
                
                if "apologize" in message_lower and "friend" in message_lower:
                    ai_response = "That sounds tough. What happened between you and your friend? Sometimes it helps to think about both perspectives before deciding whether to apologize."
                elif "fight" in message_lower or "argument" in message_lower:
                    ai_response = "Arguments can be really draining. How are you feeling about what happened? Do you want to talk through what led to the conflict?"
                elif "friend" in message_lower:
                    ai_response = "Friendship situations can be complicated. What's been going on with your friend that's bothering you?"
                elif "work" in message_lower or "job" in message_lower:
                    ai_response = "Work can be stressful. What's happening at your job that's on your mind?"
                elif any(emotion in message_lower for emotion in ["sad", "angry", "frustrated", "upset", "worried"]):
                    ai_response = "I can hear that you're going through a tough time. What's been weighing on your mind lately?"
                else:
                    ai_response = "I'm having some technical difficulties right now, but I'm here to listen. Can you tell me more about what's going on?"

            # Update user context with the interaction
            try:
                await update_user_context_vector(
                    pool, current_user['email'], 
                    chat_request.message, ai_response, 
                    conversation_id
                )
            except Exception as context_error:
                logger.error(f"Error updating user context: {context_error}")

        # Save AI response
        ai_message_id = await save_message(request, conversation_id, current_user['email'], ai_response, "assistant")
        
        # Update conversation timestamp
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
        logger.error(f"Error processing message: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")