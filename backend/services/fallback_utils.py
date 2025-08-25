from typing import Dict, Any

def generate_contextual_fallback(prompt: str) -> str:
    """Generate contextual fallback responses based on the prompt content."""
    prompt_lower = prompt.lower()
    
    if "apologize" in prompt_lower and "friend" in prompt_lower:
        return "It sounds like you're dealing with a difficult situation with your friend. What happened that's making you consider apologizing?"
    elif "fight" in prompt_lower or "argument" in prompt_lower:
        return "Arguments can be really tough. How are you feeling about what happened? Sometimes talking through it helps."
    elif "friend" in prompt_lower and ("best" in prompt_lower or "close" in prompt_lower):
        return "Best friend situations can be especially hard when there's conflict. What's been going on between you two?"
    elif any(emotion in prompt_lower for emotion in ["sad", "angry", "frustrated", "upset", "low", "down"]):
        return "I can hear that you're going through a tough time. What's been weighing on your mind?"
    elif "relationship" in prompt_lower:
        return "Relationships can be complicated. What's happening that's concerning you?"
    elif "work" in prompt_lower or "job" in prompt_lower:
        return "Work situations can be stressful. What's going on at work that you'd like to talk about?"
    else:
        return "I'm here to listen and support you. Can you tell me more about what's happening?"
    
def create_pattern_based_fallback(prompt: str) -> Dict[str, Any]:
    """Create a pattern-based extraction fallback when AI calls fail."""
    message_content = ""
    
    # Extract the actual message from the prompt
    if 'Message: "' in prompt:
        try:
            message_content = prompt.split('Message: "')[1].split('"')[0]
        except:
            message_content = prompt[-200:] if len(prompt) > 200 else prompt
    
    # Basic pattern matching for meaningful content
    has_meaningful = False
    extracted_info = {
        "people": [],
        "facts": [],
        "preferences": [],
        "emotions": [],
        "situations": []
    }
    
    if message_content:
        message_lower = message_content.lower()
        
        # Check for relationships
        if any(word in message_lower for word in ["friend", "best friend", "buddy", "colleague", "family"]):
            has_meaningful = True
            if "best friend" in message_lower:
                extracted_info["people"].append("User mentioned their best friend")
            elif "friend" in message_lower:
                extracted_info["people"].append("User mentioned a friend")
        
        # Check for emotions
        emotions = ["sad", "angry", "frustrated", "upset", "happy", "excited", "worried", "anxious", "low", "down"]
        for emotion in emotions:
            if emotion in message_lower:
                has_meaningful = True
                extracted_info["emotions"].append(f"User is feeling {emotion}")
                break
        
        # Check for situations
        if any(word in message_lower for word in ["fight", "argument", "conflict", "problem", "issue"]):
            has_meaningful = True
            extracted_info["situations"].append("User is dealing with a conflict situation")
    
    return {
        "has_meaningful_content": has_meaningful,
        "information_type": "relationship" if extracted_info["people"] else "emotion" if extracted_info["emotions"] else "situation" if extracted_info["situations"] else "other",
        "extracted_info": extracted_info,
        "key_entities": [],
        "summary": message_content[:100] if message_content else "",
        "priority": "medium" if has_meaningful else "low"
    }

def create_fallback_structure(user_message: str) -> Dict[str, Any]:
    """Creates a fallback structure when extraction fails."""
    return {
        "has_meaningful_content": False,
        "information_type": "other",
        "extracted_info": {
            "people": [],
            "facts": [],
            "preferences": [],
            "emotions": [],
            "situations": []
        },
        "key_entities": [],
        "summary": user_message[:100] if user_message else "",
        "priority": "low"
    }