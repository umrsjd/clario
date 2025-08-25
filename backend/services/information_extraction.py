import re
from typing import List, Dict, Any
from .config import logger
from .ai_model_utils import call_ai_for_json_with_fallback
from .fallback_utils import create_fallback_structure

# --- Vector-Based Memory Functions ---
async def extract_user_information(user_message: str) -> Dict[str, Any]:
    """Extract meaningful information from user messages with fallback logic."""
    try:
        # Simple pattern-based extraction as fallback
        has_meaningful = False
        extracted_info = {
            "people": [],
            "facts": [],
            "preferences": [],
            "emotions": [],
            "situations": []
        }
        
        message_lower = user_message.lower()
        
        # Check for meaningful content patterns
        meaningful_patterns = [
            r'\b(friend|best friend|buddy|colleague|coworker|boss|manager|brother|sister|mom|dad|mother|father)\b',
            r'\b(love|hate|like|dislike|prefer|enjoy|feel|emotion)\b',
            r'\b(work|job|school|university|college)\b',
            r'\b(today|yesterday|tomorrow|next week|last week)\b'
        ]
        
        for pattern in meaningful_patterns:
            if re.search(pattern, message_lower):
                has_meaningful = True
                break
        
        # Extract relationships
        relationship_patterns = [
            (r'my\s+(friend|best friend|buddy)\s+(\w+)', 'friend'),
            (r'(\w+)\s+is\s+my\s+(friend|buddy)', 'friend'),
            (r'my\s+(colleague|coworker|boss)\s+(\w+)', 'colleague'),
            (r'my\s+(brother|sister|mom|dad)\s*(\w*)', 'family')
        ]
        
        for pattern, rel_type in relationship_patterns:
            matches = re.finditer(pattern, message_lower)
            for match in matches:
                if len(match.groups()) >= 2 and match.group(2).isalpha():
                    extracted_info["people"].append(f"{match.group(2).capitalize()} is user's {rel_type}")
                    has_meaningful = True
        
        # Extract emotions
        emotion_patterns = [
            r'feel\s+(sad|happy|angry|frustrated|excited|anxious|worried|stressed)',
            r'(sad|happy|angry|frustrated|excited|anxious|worried|stressed)\s+about',
            r'i\s+am\s+(sad|happy|angry|frustrated|excited|anxious|worried|stressed)'
        ]
        
        for pattern in emotion_patterns:
            matches = re.finditer(pattern, message_lower)
            for match in matches:
                emotion = match.group(1) if len(match.groups()) >= 1 else "emotional"
                extracted_info["emotions"].append(f"User is feeling {emotion}")
                has_meaningful = True
        
        # Try AI extraction with fallback
        prompt = f"""
        Extract key information from this message. Return ONLY valid JSON:
        {{
            "has_meaningful_content": true/false,
            "information_type": "relationship/fact/preference/situation/emotion/other",
            "extracted_info": {{
                "people": ["list of people with context"],
                "facts": ["facts about user"],
                "preferences": ["preferences mentioned"],
                "emotions": ["emotional states"],
                "situations": ["ongoing situations"]
            }},
            "key_entities": ["main topics"],
            "summary": "brief summary",
            "priority": "high/medium/low"
        }}
        
        Message: "{user_message}"
        """
        
        try:
            ai_extracted = await call_ai_for_json_with_fallback(prompt)
            if ai_extracted and ai_extracted.get('has_meaningful_content'):
                # Merge AI results with pattern-based results
                ai_info = ai_extracted.get('extracted_info', {})
                for key in extracted_info:
                    if ai_info.get(key):
                        extracted_info[key].extend(ai_info[key])
                        extracted_info[key] = list(set(extracted_info[key]))  # Remove duplicates
                
                return {
                    "has_meaningful_content": True,
                    "information_type": ai_extracted.get('information_type', 'other'),
                    "extracted_info": extracted_info,
                    "key_entities": ai_extracted.get('key_entities', []),
                    "summary": ai_extracted.get('summary', user_message[:100]),
                    "priority": ai_extracted.get('priority', 'medium')
                }
        except Exception as ai_error:
            logger.warning(f"AI extraction failed, using pattern-based results: {ai_error}")
        
        # Return pattern-based results
        return {
            "has_meaningful_content": has_meaningful,
            "information_type": "relationship" if extracted_info["people"] else "emotion" if extracted_info["emotions"] else "other",
            "extracted_info": extracted_info,
            "key_entities": [],
            "summary": user_message[:100],
            "priority": "medium" if has_meaningful else "low"
        }
            
    except Exception as e:
        logger.error(f"Information extraction failed: {e}")
        return create_fallback_structure(user_message)

def extract_people_from_text_enhanced(text: str) -> List[Dict[str, Any]]:
    """Enhanced people extraction with relationship context."""
    people = []
    text_lower = text.lower()
    
    # Patterns for explicit relationships
    patterns = [
        (r'my\s+(friend|best friend|buddy|pal|mate)\s+is\s+(\w+)', lambda m: (m.group(2), m.group(1))),
        (r'(\w+)\s+is\s+my\s+(friend|best friend|buddy|pal|mate)', lambda m: (m.group(1), m.group(2))),
        (r'my\s+(brother|sister|mom|dad|mother|father|parent)\s+(\w+)', lambda m: (m.group(2), m.group(1))),
        (r'(\w+)\s+is\s+my\s+(brother|sister|mom|dad|mother|father|parent)', lambda m: (m.group(1), m.group(2))),
        (r'my\s+(colleague|coworker|boss|manager)\s+(\w+)', lambda m: (m.group(2), m.group(1))),
        (r'(\w+)\s+is\s+my\s+(colleague|coworker|boss|manager)', lambda m: (m.group(1), m.group(2))),
    ]
    
    for pattern_regex, extract_func in patterns:
        matches = re.finditer(pattern_regex, text_lower)
        for match in matches:
            try:
                name, relationship = extract_func(match)
                people.append({
                    "name": name.capitalize(),
                    "relationship_context": relationship,
                    "specific_details": f"User's {relationship}",
                    "is_explicit_memory": True
                })
            except:
                continue
    
    return people