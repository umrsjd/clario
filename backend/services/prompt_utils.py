from typing import List, Dict, Any

def construct_enhanced_prompt(
    user_query: str, 
    sentiment: str, 
    relevant_memories: List[Dict[str, Any]], 
    user_profile: Dict[str, Any],
    chat_history: List[Any],
    has_memories: bool = False
) -> str:
    """Enhanced prompt construction with better fallback handling."""
    
    # Get user name
    user_name = user_profile.get('name', user_profile.get('user_name', user_profile.get('full_name', '')))
    
    # Build conversation context
    conversation_context = ""
    if chat_history and len(chat_history) > 1:
        conversation_context = "RECENT CONVERSATION:\n"
        for msg in chat_history[-4:]:
            role_label = "User" if msg.role == "user" else "You"
            conversation_context += f"{role_label}: {msg.content}\n"
        conversation_context += "\n"
    
    # Build memory context from vector memories
    memory_context = ""
    if has_memories and relevant_memories:
        memory_context = "WHAT YOU REMEMBER ABOUT THE USER:\n"
        
        # Group memories by type
        memory_types = {}
        for memory in relevant_memories[:8]:  # Top 8 most relevant
            mem_type = memory['metadata'].get('type', 'other')
            if mem_type not in memory_types:
                memory_types[mem_type] = []
            memory_types[mem_type].append(memory)
        
        # Add relationships first (highest priority)
        if 'people' in memory_types or 'relationship' in memory_types:
            memory_context += "People in their life:\n"
            people_memories = memory_types.get('people', []) + memory_types.get('relationship', [])
            for memory in people_memories[:3]:
                memory_context += f"• {memory['content']}\n"
        
        # Add facts
        if 'fact' in memory_types:
            memory_context += "Facts about them:\n"
            for memory in memory_types['fact'][:3]:
                memory_context += f"• {memory['content']}\n"
        
        # Add preferences
        if 'preference' in memory_types:
            memory_context += "Their preferences:\n"
            for memory in memory_types['preference'][:2]:
                memory_context += f"• {memory['content']}\n"
        
        # Add current situations
        if 'situation' in memory_types:
            memory_context += "Current situations:\n"
            for memory in memory_types['situation'][:2]:
                memory_context += f"• {memory['content']}\n"
        
        # Add emotions
        if 'emotion' in memory_types:
            memory_context += "Their emotional state:\n"
            for memory in memory_types['emotion'][:2]:
                memory_context += f"• {memory['content']}\n"
        
        memory_context += "\n"
    
    # Build the enhanced prompt with better fallback responses
    final_prompt = f"""You are Clario, a helpful AI companion who remembers what users tell you about their lives.

RESPONSE GUIDELINES:
- Never reference or assume past events, situations, or decisions unless they are explicitly listed in verified information.
- Be empathetic and supportive, especially for emotional topics
- Reference what you remember about the user when relevant
- Keep responses conversational and natural (1-3 sentences typically)
- For conflicts/arguments, help them think through the situation
- Don't make assumptions about events not mentioned in your memories
- Be honest if you don't remember something specific

{conversation_context}{memory_context}CURRENT MESSAGE: "{user_query}"

CONTEXT:
- User's sentiment: {sentiment}
{"- You have memories about this user's life" if has_memories else "- This is a new user with no stored history"}

For the current message about apologizing after a fight with their best friend:
- This seems to be about a conflict situation
- Help them process their feelings
- Encourage healthy communication
- Ask clarifying questions to understand better

Respond as their supportive AI companion who cares about their wellbeing."""

    return final_prompt