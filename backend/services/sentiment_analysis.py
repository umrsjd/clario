import logging
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from .config import logger, sentiment_tokenizer, sentiment_model, device

def _load_sentiment_model():
    """Loads the sentiment analysis model into memory if not already loaded."""
    global sentiment_tokenizer, sentiment_model, device
    if sentiment_model is None:
        try:
            logger.info("Loading local sentiment model...")
            model_name = "distilbert-base-uncased-finetuned-sst-2-english"
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            sentiment_tokenizer = AutoTokenizer.from_pretrained(model_name)
            sentiment_model = AutoModelForSequenceClassification.from_pretrained(model_name)
            sentiment_model.to(device)
            sentiment_model.eval()
            logger.info(f"Sentiment model loaded successfully on {device}")
        except Exception as e:
            logger.error(f"Failed to load local sentiment model: {e}")
            sentiment_model = "failed"

def get_sentiment(text: str) -> str:
    """Analyzes sentiment using the local model."""
    _load_sentiment_model()
    if sentiment_model is None or sentiment_model == "failed":
        logger.warning("Sentiment model not available. Defaulting to NEUTRAL.")
        return "NEUTRAL"
    try:
        inputs = sentiment_tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        with torch.no_grad():
            outputs = sentiment_model(**inputs)
            prediction = torch.argmax(outputs.logits, dim=-1).item()
            return "POSITIVE" if prediction == 1 else "NEGATIVE"
    except Exception as e:
        logger.error(f"Error during local sentiment analysis: {e}")
        return "NEUTRAL"