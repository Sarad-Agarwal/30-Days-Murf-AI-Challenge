import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import time
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Load AssemblyAI API Key from environment variable
ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")

# Upload folder setup
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/")
def home():
    return "✅ Flask Backend is Running with AssemblyAI!"


@app.route("/upload-audio", methods=["POST"])
def upload_audio():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    return jsonify({"file_name": filename, "size": os.path.getsize(filepath)}), 200


@app.route("/generate-tts", methods=["POST"])
def generate_tts():
    data = request.get_json()
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    from gtts import gTTS
    tts = gTTS(text)
    audio_path = os.path.join(UPLOAD_FOLDER, "output.mp3")
    tts.save(audio_path)

    return jsonify({"audioFile": f"http://127.0.0.1:5000/uploads/output.mp3"})


@app.route("/transcribe/file", methods=["POST"])
def transcribe_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    audio_file = request.files["file"]
    filename = secure_filename(audio_file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    audio_file.save(filepath)

    # Step 1: Upload to AssemblyAI
    headers = {
        "authorization": ASSEMBLYAI_API_KEY,
        "content-type": "application/json"
    }

    with open(filepath, "rb") as f:
        upload_response = requests.post(
            "https://api.assemblyai.com/v2/upload",
            headers={"authorization": ASSEMBLYAI_API_KEY},
            files={"file": f}
        )
    
    if upload_response.status_code != 200:
        return jsonify({"error": "Failed to upload to AssemblyAI"}), 500

    upload_url = upload_response.json().get("upload_url")

    # Step 2: Request transcription
    transcript_request = requests.post(
        "https://api.assemblyai.com/v2/transcript",
        headers=headers,
        json={"audio_url": upload_url}
    )

    if transcript_request.status_code != 200:
        return jsonify({"error": "Transcription request failed"}), 500

    transcript_id = transcript_request.json().get("id")
    polling_url = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"

    # Step 3: Poll until transcription is complete
    while True:
        polling_response = requests.get(polling_url, headers=headers)
        polling_result = polling_response.json()

        if polling_result["status"] == "completed":
            return jsonify({"text": polling_result["text"]})
        elif polling_result["status"] == "error":
            return jsonify({"error": polling_result.get("error", "Unknown error")}), 500

        time.sleep(2)


@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
