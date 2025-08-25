# Import all functions for easy access
from .config import *
from .sentiment_analysis import *
from .ai_model_utils import *
from .fallback_utils import *
from .information_extraction import *
from .vector_memory import *
from .prompt_utils import *
from .health_check import *

# For backward compatibility, ensure all original imports work
__all__ = [
    # Configuration
    'logger',
    'embedding_model',
    'sentiment_tokenizer',
    'sentiment_model',
    'device',
    'openai_client',
    
    # Sentiment Analysis
    'get_sentiment',
    
    # AI Model Utils
    'call_ai_model_with_fallback',
    'call_ai_for_json_with_fallback',
    
    # Fallback Utils
    'generate_contextual_fallback',
    'create_pattern_based_fallback',
    'create_fallback_structure',
    
    # Information Extraction
    'extract_user_information',
    'extract_people_from_text_enhanced',
    
    # Vector Memory
    'store_user_memory_vector',
    'get_user_memories_vector',
    'update_user_context_vector',
    
    # Prompt Utils
    'construct_enhanced_prompt',
    
    # Health Check
    'check_ai_services_health'
]