import logging
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from openai import AsyncOpenAI
import os

# --- Configuration ---
logger = logging.getLogger(__name__)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
sentiment_tokenizer = None
sentiment_model = None
device = None

# Initialize OpenAI client
openai_client = None
if os.getenv("OPENAI_API_KEY"):
    openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))