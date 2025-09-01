# 🤖 MARVIS grown JARVIS – AI Voice Agent  
### 🎙️ Built during the 30 Days of AI Voice Agents Challenge 🚀  

---

## 📅 Day 29: Documentation & Final Touches  
We’re almost at the finish line of the **30 Days of AI Voice Agents Challenge**!  
Today’s focus was on **polishing documentation** ✨ — ensuring the project is easy to understand, use, and extend.  

---

## 🧠 What’s Inside
- 📖 **Comprehensive Docs** – Everything you need to run, customize, and understand the agent.  
- 🛠 **Clear Project Structure** – Modular, clean, and deployment-ready.  
- ✅ **User-Centric Features** – Enter your own API keys, deploy to the cloud, and interact in real-time.  
- 🌍 **Cloud Ready** – Publicly accessible through Render hosting.  

---

## 🚀 Live Demo  
MARVIS grown JARVIS is live and waiting for you!  
👉 [**Try it here**](https://three0-days-murf-ai-challenge-2.onrender.com/)  

Steps to test:  
1. 🎛 Click the **Settings (⚙️)** icon.  
2. 🔑 Enter your API keys (Murf, AssemblyAI, Gemini, SerpAPI).  
3. 🎤 Grant microphone permissions.  
4. 💬 Start chatting with your personal AI assistant!  

---

## 🛠 Tech Stack  

### Backend  
- ⚡ **FastAPI** with Uvicorn  
- 🔌 **WebSockets** for real-time audio streaming  
- 🧩 **Service Modules** (`llm.py`, `stt.py`, `tts.py`) for clean architecture  

### Frontend  
- 🎨 **Bootstrap + Custom CSS**  
- 🎧 **JavaScript (AudioContext, MediaRecorder, WebSocket APIs)**  

### Deployment  
- ☁️ **Render.com** (Free Tier) – Public hosting with automatic builds  

### AI APIs  
- 🗣️ **Murf AI** – Streaming Text-to-Speech  
- 🎙️ **AssemblyAI** – Real-time Speech-to-Text + Turn Detection  
- 🧠 **Google Gemini** – LLM with Function Calling  
- 🔎 **SerpAPI** – Real-time Web Search  

---

## 📂 Project Structure  

```

AI Voice Agent/
├── main.py           # Entry point – WebSocket handling & API key logic
├── services/
│   ├── llm.py        # Gemini LLM integration
│   ├── stt.py        # AssemblyAI Speech-to-Text
│   └── tts.py        # Murf Text-to-Speech
├── schemas.py
├── templates/
│   └── index.html    # Main frontend UI
├── static/
│   ├── script.js     # Client logic (recording, WebSocket, UI)
│   └── style.css     # UI styles
├── requirements.txt  # Dependencies for deployment
└── .env              # For local dev (not used in deployed version)

```

---

## 📆 Completed Journey (Day-by-Day Highlights)  

✅ **Day 01–05:** Setup server, UI, and first TTS + STT integrations.  
✅ **Day 06–10:** Full pipeline for transcription, LLM, and responses.  
✅ **Day 11–15:** Error handling + modular refactor + WebSockets foundation.  
✅ **Day 16–20:** Real-time audio streaming, turn detection, and Murf streaming TTS.  
✅ **Day 21–23:** End-to-end conversational agent with real-time playback.  
✅ **Day 24–26:** Persona building, web search skills, and smarter tool use.  
✅ **Day 27:** **UI Revamp + Settings Panel** for user-provided API keys.  
✅ **Day 28:** **Cloud Deployment** on Render – agent goes public!  
✅ **Day 29:** Documentation polish – ready for the grand finale.  

---

## 🎯 Why MARVIS grown JARVIS?  
Because this isn’t just an AI agent – it’s a **voice-powered digital companion** 🦾 blending:  
- 🗣️ Human-like conversations  
- 🌐 Real-time knowledge from the web  
- 🎨 An engaging, modern UI  
- 🛠️ Configurability with your own API keys  

---

## 🌟 Next Steps  
- 📝 Prepare for the **Day 30 showcase** – a complete wrap-up 🎉  
- 📢 Share insights, lessons learned, and possibilities of AI Voice Agents  

---

✨ Built with ❤️ using **Murf AI, AssemblyAI, Google Gemini, SerpAPI, FastAPI, and Render**  

