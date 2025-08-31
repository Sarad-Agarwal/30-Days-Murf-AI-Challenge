import requests
import time
import os

ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")

def transcribe_with_assemblyai(file_path: str) -> str:
    """Transcribe audio file using AssemblyAI."""
    with open(file_path, "rb") as f:
        upload_url_resp = requests.post(
            "https://api.assemblyai.com/v2/upload",
            headers={"authorization": ASSEMBLYAI_API_KEY},
            data=f
        )
    upload_url_resp.raise_for_status()
    upload_url = upload_url_resp.json()["upload_url"]

    transcript_req = requests.post(
        "https://api.assemblyai.com/v2/transcript",
        headers={
            "authorization": ASSEMBLYAI_API_KEY,
            "content-type": "application/json"
        },
        json={"audio_url": upload_url}
    )
    transcript_req.raise_for_status()
    transcript_id = transcript_req.json()["id"]

    while True:
        polling_resp = requests.get(
            f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
            headers={"authorization": ASSEMBLYAI_API_KEY}
        )
        polling_resp.raise_for_status()
        status = polling_resp.json()["status"]

        if status == "completed":
            return polling_resp.json()["text"]
        elif status == "error":
            raise RuntimeError(f"Transcription error: {polling_resp.json()['error']}")
        time.sleep(3)
