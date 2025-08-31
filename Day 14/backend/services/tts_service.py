import requests
import os

MURF_API_KEY = os.getenv("MURF_API_KEY")

def generate_murf_audio(text: str) -> str:
    """Generate audio from text using Murf API."""
    payload = {
        "voiceId": "en-US-natalie",
        "text": text,
        "format": "mp3",
        "style": "Narration"
    }
    murf_resp = requests.post(
        "https://api.murf.ai/v1/speech/generate",
        headers={
            "Content-Type": "application/json",
            "api-key": MURF_API_KEY
        },
        json=payload
    )
    murf_resp.raise_for_status()
    murf_data = murf_resp.json()
    return murf_data.get("audioFile")
