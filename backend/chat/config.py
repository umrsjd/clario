import os
import logging
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# --- File setup ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- Logging setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)