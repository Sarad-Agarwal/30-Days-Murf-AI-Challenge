import google.generativeai as genai
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def generate_llm_response(conversation_text: str) -> str:
    """Generate a conversational response using Gemini."""
    model = genai.GenerativeModel("gemini-2.5-flash")
    return model.generate_content(conversation_text).text
