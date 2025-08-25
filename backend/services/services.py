import logging
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from openai import AsyncOpenAI
import os
from typing import List, Dict, Any, Optional
import json
import uuid
from datetime import datetime, timedelta
import asyncpg
import re
import asyncio
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Import all modules
from .config import (
    logger, 
    embedding_model, 
    sentiment_tokenizer, 
    sentiment_model, 
    device, 
    openai_client
)

from .sentiment_analysis import (
    get_sentiment,
    _load_sentiment_model
)

from .ai_model_utils import (
    call_ai_model_with_fallback,
    call_ai_for_json_with_fallback
)

from .fallback_utils import (
    generate_contextual_fallback,
    create_pattern_based_fallback,
    create_fallback_structure
)

from .information_extraction import (
    extract_user_information,
    extract_people_from_text_enhanced
)

from .vector_memory import (
    store_user_memory_vector,
    get_user_memories_vector,
    update_user_context_vector
)

from .prompt_utils import (
    construct_enhanced_prompt
)

from .health_check import (
    check_ai_services_health
)

# Export all functions for backward compatibility
__all__ = [
    'get_sentiment',
    '_load_sentiment_model',
    'embedding_model',
    'call_ai_model_with_fallback',
    'call_ai_for_json_with_fallback',
    'generate_contextual_fallback',
    'create_pattern_based_fallback',
    'extract_user_information',
    'extract_people_from_text_enhanced',
    'store_user_memory_vector',
    'get_user_memories_vector',
    'update_user_context_vector',
    'construct_enhanced_prompt',
    'create_fallback_structure',
    'check_ai_services_health'
]