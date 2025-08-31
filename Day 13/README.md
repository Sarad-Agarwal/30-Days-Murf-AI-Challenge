# 🎙️ AI Voice Assistant — 30 Days of AI Voice Agents

An interactive, real-time AI voice assistant that listens, understands, and responds with high-quality speech synthesis — powered by **Murf AI**, **AssemblyAI**, and **Google Gemini**.

Built as part of the **#30DaysOfAI Voice Agents Challenge**, this project combines **speech-to-text**, **LLM reasoning**, and **text-to-speech** in a seamless, animated conversational UI.

---

## 🚀 Project Overview
This AI Voice Assistant:
- Listens to the user’s voice input via the browser
- Transcribes speech into text using **AssemblyAI**
- Generates smart responses using **Google Gemini**
- Speaks back naturally using **Murf AI**
- Enhances the experience with smooth animations & live waveform visualizations

The goal: make human–AI conversations **natural, interactive, and fun**.

---

## 🛠️ Technologies Used

### **Frontend**
- HTML, CSS, JavaScript (Vanilla)
- Web Audio API for recording & waveform
- Canvas API for visualizations
- SpeechSynthesis API for fallback TTS

### **Backend**
- FastAPI (Python)
- API integrations:
  - **AssemblyAI** — Speech-to-Text
  - **Google Gemini** — LLM for intelligent responses
  - **Murf AI** — Text-to-Speech
- Session handling & error recovery

---

## 🏗️ Architecture
🎤 User Speaks
↓ (Web Audio API)
🎧 Frontend Recorder
↓ (POST audio/webm)
⚡ FastAPI Backend
↓
📝 AssemblyAI (Transcription)
↓
🧠 Google Gemini (LLM Response)
↓
🔊 Murf AI (TTS Audio URL)
↓
🎨 Frontend Player + Waveform + Animations

````

## ✨ Features
- 🎙️ One-click recording with animated mic button
- 📈 Real-time waveform visualization while recording
- 🧠 AI-generated smart responses
- 🔊 High-quality voice output from Murf AI
- 🛡️ Robust error handling with fallback TTS
- 📋 One-click audio URL copy
- 🎨 Smooth, high-quality UI animations

---
````

### **2️⃣ Backend Setup**

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key
MURF_API_KEY=your_murf_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

Run the backend server:

```bash
uvicorn main:app --reload --port 8000
```

---

### **3️⃣ Frontend Setup**

```bash
cd frontend
Run the index.html file to get started
```

---

## 📸 Screenshots

*(Add your screenshots here)*

---

## 🔮 Future Improvements

* 🌍 Multi-language support
* 📱 Mobile-first UI optimizations
* 🎯 Contextual memory for longer conversations
* 🖼️ Rich media AI responses

---

## 💡 Credits

Built with ❤️ using:

* [AssemblyAI](https://www.assemblyai.com/)
* [Google Gemini](https://deepmind.google/technologies/gemini/)
* [Murf AI](https://murf.ai/)
* [FastAPI](https://fastapi.tiangolo.com/)

---

## 📢 License

This project is licensed under the MIT License.
