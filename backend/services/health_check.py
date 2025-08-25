import google.generativeai as genai
from typing import Dict, Any
from .config import logger, openai_client
import os

# --- Health Check Functions ---
async def check_ai_services_health() -> Dict[str, Any]:
    """Check the health of both Gemini and OpenAI services."""
    health_status = {
        "gemini": {"available": False, "error": None},
        "openai": {"available": False, "error": None}
    }
    
    # Test Gemini
    try:
        model = genai.GenerativeModel(os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash"))
        response = await model.generate_content_async("Test")
        health_status["gemini"]["available"] = True
        logger.info("Gemini service is healthy")
    except Exception as e:
        health_status["gemini"]["error"] = str(e)
        logger.warning(f"Gemini service unavailable: {e}")
    
    # Test OpenAI
    if openai_client:
        try:
            response = await openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Test"}],
                max_tokens=5
            )
            health_status["openai"]["available"] = True
            logger.info("OpenAI service is healthy")
        except Exception as e:
            health_status["openai"]["error"] = str(e)
            logger.warning(f"OpenAI service unavailable: {e}")
    else:
        health_status["openai"]["error"] = "OpenAI client not configured"
    
    return health_status