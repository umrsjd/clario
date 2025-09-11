from typing import List, Dict, Any

def construct_enhanced_prompt(
    user_query: str,
    sentiment: str,
    relevant_memories: List[Dict[str, Any]],
    user_profile: Dict[str, Any],
    chat_history: List[Any],
    has_memories: bool = False
) -> str:
    """
    Constructs a robust prompt that distinguishes between memory and current context.
    """

    # 1. Define the AI's persona and core instructions
    system_instruction = """You are Clario, an empathetic and supportive AI companion. Your goal is to be a great listener.

**Your Core Rules:**
1.  **Be Present:** Respond ONLY to the user's most recent message.
2.  **Use Your Memory:** You have access to long-term memories. Use them to show you remember details from past conversations.
3.  **Don't State the Obvious:** If the user just told you something, don't say "I remember you mentioned..." or "You just said...". Instead, use the information to ask a follow-up question.
4.  **Be Natural and Brief:** Keep your tone calm and your responses short (1-3 sentences)."""

    # 2. Build the context from long-term memories
    # We exclude memories created from the immediate past few messages to avoid this loop.
    memory_context = ""
    if has_memories and relevant_memories:
        memory_context = "\n--- LONG-TERM MEMORIES ---\n"
        memory_context += "Here are things you remember from previous conversations:\n"
        for memory in relevant_memories[:5]:
            # This check is crucial: it prevents the AI from "remembering" what was just said.
            if user_query.lower() not in memory['metadata'].get('source_message', '').lower():
                 memory_context += f"- {memory['content']}\n"
    
    # If no relevant long-term memories are found after filtering, clear the context.
    if len(memory_context.splitlines()) < 3:
        memory_context = ""


    # 3. Build the context from the current conversation
    conversation_context = ""
    if chat_history:
        conversation_context = "\n--- CURRENT CONVERSATION HISTORY ---\n"
        for msg in chat_history[-4:]:
            role_label = "User" if msg.role == "user" else "Clario (You)"
            conversation_context += f"{role_label}: {msg.content}\n"

    # 4. Assemble the final prompt
    final_prompt = f"""{system_instruction}
{memory_context}
{conversation_context}
--- TASK ---
Respond to the user's latest message based on the context above.
User's message: "{user_query}"
"""

    return final_prompt