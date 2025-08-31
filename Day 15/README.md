# 🎙️ AI Voice Agent — 30 Days of AI Voice Agents Challenge

An interactive AI-powered voice assistant that listens to user speech, transcribes it, generates an intelligent response using Google Gemini, and speaks back the answer using Murf AI.  
Built with **FastAPI** backend, **vanilla JS + HTML/CSS** frontend, and integrated with **AssemblyAI**, **Murf AI**, and **Google Gemini** APIs.

---

## 🚀 Features
- **🎤 Voice Input** — Record audio from your browser.
- **📝 Speech-to-Text (STT)** — Accurate transcription using AssemblyAI.
- **🤖 AI Responses** — Google Gemini generates natural conversational replies.
- **🗣️ Text-to-Speech (TTS)** — Murf AI turns responses into realistic speech.
- **💬 Chat History** — Maintains conversation state per session.
- **⚠️ Error Handling** — Graceful fallbacks with both text and audio output.
- **🌐 Cross-Origin Support** — Works seamlessly with any frontend.

---

## 🛠️ Tech Stack
### Backend
- **FastAPI** — Lightweight, fast Python web framework.
- **Python-dotenv** — Manage API keys securely.
- **Requests** — API calls to third-party services.
- **Google Generative AI SDK** — For Gemini responses.

### Frontend
- HTML, CSS, JavaScript
- Interactive microphone animations
- Audio waveform visualizations

---

## 🏗️ Project Structure
```

project-root/
│
├── backend/
│   ├── main.py               # FastAPI entry point
│   ├── models/                # Pydantic schemas
│   ├── services/              # API integrations (STT, TTS, Gemini)
│   ├── utils/                  # Helper functions
│   ├── requirements.txt
│   ├── .env.example
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│
└── README.md

````

---

## ⚙️ Environment Variables
Create a `.env` file in the `backend/` folder with:

```bash
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
MURF_API_KEY=your_murf_api_key
GEMINI_API_KEY=your_gemini_api_key
````

You can also check `.env.example` for the format.

---

## ▶️ Running Locally

### 1️⃣ Clone the repo

```bash
git clone https://github.com/your-username/ai-voice-agent.git
cd ai-voice-agent
```

### 2️⃣ Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 3️⃣ Set environment variables

Create `.env` inside `backend/` and add your API keys.

### 4️⃣ Start the backend

```bash
uvicorn backend.main:app --reload
```

### 5️⃣ Open frontend

Just open `frontend/index.html` in your browser, or serve it with a simple HTTP server:

```bash
cd frontend
python -m http.server 5500
```

---

## 📡 API Endpoints

### `POST /agent/chat/{session_id}`

* **Description:** Accepts an audio file, transcribes it, gets AI response, and returns both text and audio URL.
* **Request:** Multipart/form-data with `file` parameter.
* **Response:**

```json
{
  "transcription": "...",
  "llmResponse": "...",
  "audioUrl": "...",
  "chatHistory": [...]
}
```

---

## 🏆 Credits

* [AssemblyAI](https://www.assemblyai.com/) — Speech-to-Text
* [Murf AI](https://murf.ai/) — Text-to-Speech
* [Google Gemini](https://deepmind.google/) — AI responses

---

## 📜 License

MIT License © 2025 Sarad Agarwal


```
