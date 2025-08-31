import os
import tempfile
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.chat_models import ChatMessage, ChatResponse
from services.stt_service import transcribe_with_assemblyai
from services.tts_service import generate_murf_audio
from services.llm_service import generate_llm_response
from utils.logger import logger

# Load environment variables
load_dotenv()

# Debug print for API keys (mask most of the key)
for key in ["ASSEMBLYAI_API_KEY", "MURF_API_KEY", "GEMINI_API_KEY"]:
    value = os.getenv(key)
    if value:
        print(f"{key}: {value[:5]}... (loaded)")
    else:
        print(f"{key}: (missing)")

# Validate API keys
for key in ["ASSEMBLYAI_API_KEY", "MURF_API_KEY", "GEMINI_API_KEY"]:
    if not os.getenv(key):
        raise RuntimeError(f"Please set {key} in .env file")

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_history = {}  # { session_id: [ {"role": "user"/"assistant", "content": "..."} ] }
FALLBACK_MESSAGE = "I'm having trouble connecting right now."
FALLBACK_AUDIO_TEXT = "I am having trouble generating audio right now."

def generate_fallback_audio(text=FALLBACK_AUDIO_TEXT):
    try:
        audio_url = generate_murf_audio(text)
        if audio_url:
            return audio_url
        return None
    except Exception as e:
        logger.error(f"Fallback TTS failed: {e}")
        return None

@app.post("/agent/chat/{session_id}", response_model=ChatResponse)
async def agent_chat(session_id: str, file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        logger.info(f"Received audio for session {session_id}")

        # Transcribe
        transcription = transcribe_with_assemblyai(tmp_path)

        # Maintain chat history
        if session_id not in chat_history:
            chat_history[session_id] = []
        chat_history[session_id].append({"role": "user", "content": transcription})

        # Prepare conversation text
        conversation_text = "\n".join(
            [f"{msg['role'].capitalize()}: {msg['content']}" for msg in chat_history[session_id]]
        )

        # Generate LLM response
        llm_response = generate_llm_response(conversation_text)
        chat_history[session_id].append({"role": "assistant", "content": llm_response})

        # Generate audio response with safe fallback
        try:
            murf_audio_url = generate_murf_audio(llm_response)
            if not murf_audio_url:
                raise RuntimeError("Murf returned empty audio URL")
        except Exception as e:
            logger.error(f"Murf TTS failed: {e}")
            murf_audio_url = generate_fallback_audio()

        return ChatResponse(
            transcription=transcription,
            llmResponse=llm_response,
            audioUrl=murf_audio_url,
            chatHistory=[ChatMessage(**m) for m in chat_history[session_id]]
        )

    except Exception as e:
        logger.error(f"Error in session {session_id}: {e}")
        fallback_audio = generate_fallback_audio()
        return ChatResponse(
            transcription="",
            llmResponse=FALLBACK_MESSAGE,
            audioUrl=fallback_audio,
            chatHistory=[ChatMessage(**m) for m in chat_history.get(session_id, [])],
            error=str(e)
        )
