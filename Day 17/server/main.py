import os
import asyncio
import websockets
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import assemblyai as aai
import tempfile
import wave

# Load API keys
load_dotenv()
ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")

if not ASSEMBLYAI_API_KEY:
    raise RuntimeError("Please set ASSEMBLYAI_API_KEY in .env")

app = FastAPI()

# Allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected...")

    # Temporary file to store incoming audio
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_audio_file:
        while True:
            try:
                data = await websocket.receive_bytes()
                tmp_audio_file.write(data)
            except Exception as e:
                print(f"Connection closed: {e}")
                break

    print(f"Audio saved at {tmp_audio_file.name}")
    
    # Convert audio to PCM 16kHz mono if needed, here assuming client sends correct format
    # Transcribe using AssemblyAI
    aai_client = aai.Client(ASSEMBLYAI_API_KEY)
    transcript = aai_client.transcribe(tmp_audio_file.name)
    print("Transcription:", transcript.text)
    await websocket.send_text(f"Transcription: {transcript.text}")

    await websocket.close()
    print("Client disconnected")
