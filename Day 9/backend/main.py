import os
import requests
import time
import tempfile
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
MURF_API_KEY = os.getenv("MURF_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not ASSEMBLYAI_API_KEY or not MURF_API_KEY or not GEMINI_API_KEY:
    raise RuntimeError("Please set ASSEMBLYAI_API_KEY, MURF_API_KEY, and GEMINI_API_KEY in .env file")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------- AssemblyAI Transcription -----------
def transcribe_with_assemblyai(file_path: str) -> str:
    with open(file_path, "rb") as f:
        upload_url_resp = requests.post(
            "https://api.assemblyai.com/v2/upload",
            headers={"authorization": ASSEMBLYAI_API_KEY},
            data=f
        )
    if upload_url_resp.status_code != 200:
        raise RuntimeError(f"AssemblyAI upload failed: {upload_url_resp.text}")

    upload_url = upload_url_resp.json()["upload_url"]

    transcript_req = requests.post(
        "https://api.assemblyai.com/v2/transcript",
        headers={
            "authorization": ASSEMBLYAI_API_KEY,
            "content-type": "application/json"
        },
        json={"audio_url": upload_url}
    )

    transcript_id = transcript_req.json()["id"]

    while True:
        polling_resp = requests.get(
            f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
            headers={"authorization": ASSEMBLYAI_API_KEY}
        )
        status = polling_resp.json()["status"]
        if status == "completed":
            return polling_resp.json()["text"]
        elif status == "error":
            raise RuntimeError(f"Transcription error: {polling_resp.json()['error']}")
        time.sleep(3)

# ----------- Murf TTS -----------
def generate_murf_audio(text: str) -> str:
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

    if murf_resp.status_code != 200:
        raise RuntimeError(f"Murf API error: {murf_resp.text}")

    murf_data = murf_resp.json()
    return murf_data.get("audioFile")

# ----------- DAY 7 Endpoint (Echo TTS) -----------
@app.post("/tts/echo")
async def echo_tts(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        transcription = transcribe_with_assemblyai(tmp_path)
        murf_audio_url = generate_murf_audio(transcription)

        return {
            "audioUrl": murf_audio_url,
            "transcription": transcription
        }
    except Exception as e:
        return {"error": str(e)}

# ----------- DAY 9 Endpoint (Audio → LLM → Audio) -----------
@app.post("/llm/query")
async def llm_query(file: UploadFile = File(...)):
    try:
        # Step 1: Save uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Step 2: Transcribe audio
        transcription = transcribe_with_assemblyai(tmp_path)

        # Step 3: Send transcription to Gemini
        model = genai.GenerativeModel("gemini-2.5-flash")
        llm_response = model.generate_content(transcription).text

        # Step 4: Convert Gemini output to audio with Murf
        murf_audio_url = generate_murf_audio(llm_response)

        # Step 5: Return results
        return {
            "transcription": transcription,
            "llmResponse": llm_response,
            "audioUrl": murf_audio_url
        }
    except Exception as e:
        return {"error": str(e)}
