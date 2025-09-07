import logging
import google.generativeai as genai
import json
import asyncio
from typing import Dict, Any
from .config import logger, openai_client
from .fallback_utils import generate_contextual_fallback, create_pattern_based_fallback
import os

safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_ONLY_HIGH"  # Instead of BLOCK_NONE
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH", 
        "threshold": "BLOCK_ONLY_HIGH"
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_ONLY_HIGH"
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_ONLY_HIGH"
    }
]

# --- AI Model Utilities with Fallback ---
async def call_ai_model_with_fallback(prompt: str, max_retries: int = 2) -> str:
    """Calls Gemini first, then falls back to OpenAI with better error handling."""
    
    # Try Gemini first with better error handling
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting Gemini call (attempt {attempt + 1})")
            model = genai.GenerativeModel(os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash"))
            
            # Configure generation to be more reliable
            generation_config = genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=500,
                top_p=0.8,
                top_k=40
            )
            
            response = await model.generate_content_async(
                prompt, 
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            # Better response validation
            if response.text and response.text.strip():
                logger.info("Gemini call successful")
                return response.text.strip()
            else:
                logger.warning(f"Gemini returned empty response on attempt {attempt + 1}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    continue
                else:
                    break
                    
        except Exception as e:
            logger.warning(f"Gemini attempt {attempt + 1} failed: {e}")
            
            error_str = str(e).lower()
            rate_limit_indicators = [
                'rate limit', 'quota exceeded', 'too many requests', 
                'resource_exhausted', '429', 'quota', 'limit exceeded',
                'internal error', '500'
            ]
            
            if any(indicator in error_str for indicator in rate_limit_indicators):
                logger.warning("Rate limit or server error detected, switching to OpenAI immediately")
                break
            
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
    
    # Fallback to OpenAI with better error handling
    if openai_client:
        try:
            logger.info("Falling back to OpenAI")
            response = await openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are Clario, a helpful and empathetic AI companion. Respond naturally and supportively."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7,
                timeout=30.0
            )
            
            if response.choices and response.choices[0].message.content:
                logger.info("OpenAI call successful")
                return response.choices[0].message.content.strip()
            else:
                logger.error("OpenAI returned empty response")
                return generate_contextual_fallback(prompt)
                
        except Exception as openai_error:
            logger.error(f"OpenAI fallback also failed: {openai_error}")
            return generate_contextual_fallback(prompt)
    else:
        logger.error("No OpenAI client available for fallback")
        return generate_contextual_fallback(prompt)

async def call_ai_for_json_with_fallback(prompt: str, max_retries: int = 2) -> Dict[str, Any]:
    """Specialized function for JSON responses with better fallback."""
    
    # Try Gemini first
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting Gemini JSON call (attempt {attempt + 1})")
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            # Configure for JSON responses
            generation_config = genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=1000,
                top_p=0.8,
            )
            
            response = await model.generate_content_async(
                prompt, 
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            if not response.text:
                logger.warning(f"Gemini returned empty response on JSON attempt {attempt + 1}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(1)
                    continue
                else:
                    break
            
            cleaned_response = response.text.strip()
            
            # Clean up the response
            if "```json" in cleaned_response:
                cleaned_response = cleaned_response.split("```json")[1].split("```")[0]
            elif "```" in cleaned_response:
                cleaned_response = cleaned_response.split("```")[1].split("```")[0]
            
            cleaned_response = cleaned_response.strip()
            
            try:
                result = json.loads(cleaned_response)
                logger.info("Gemini JSON call successful")
                return result
            except json.JSONDecodeError as json_error:
                logger.error(f"JSON decode error from Gemini: {json_error}")
                logger.error(f"Raw response was: {cleaned_response[:200]}")
                if attempt == max_retries - 1:
                    break
                continue
                
        except Exception as e:
            logger.warning(f"Gemini JSON attempt {attempt + 1} failed: {e}")
            
            error_str = str(e).lower()
            rate_limit_indicators = [
                'rate limit', 'quota exceeded', 'too many requests', 
                'resource_exhausted', '429', 'quota', 'limit exceeded',
                'internal error', '500'
            ]
            
            if any(indicator in error_str for indicator in rate_limit_indicators):
                logger.warning("Rate limit detected in JSON call, switching to OpenAI")
                break
            
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
    
    # Fallback to OpenAI for JSON
    if openai_client:
        try:
            logger.info("Falling back to OpenAI for JSON response")
            response = await openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that responds with valid JSON only. Do not include any text outside the JSON structure."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3,
                timeout=30.0
            )
            
            if response.choices and response.choices[0].message.content:
                try:
                    result = json.loads(response.choices[0].message.content.strip())
                    logger.info("OpenAI JSON call successful")
                    return result
                except json.JSONDecodeError as json_error:
                    logger.error(f"JSON decode error from OpenAI: {json_error}")
                    logger.error(f"Raw OpenAI response: {response.choices[0].message.content[:200]}")
                    return create_pattern_based_fallback(prompt)
            else:
                logger.error("OpenAI returned empty JSON response")
                return create_pattern_based_fallback(prompt)
                
        except Exception as openai_error:
            logger.error(f"OpenAI JSON fallback failed: {openai_error}")
            return create_pattern_based_fallback(prompt)
    else:
        logger.error("No OpenAI client available for JSON fallback")
        return create_pattern_based_fallback(prompt)