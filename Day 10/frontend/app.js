// app.js - Frontend logic for Day 9 + Day 10 AI Voice Agent

const FIELD_NAME = "file"; 
// For Day 10: dynamically choose endpoint depending on mode
let SESSION_ID = localStorage.getItem("session_id") || crypto.randomUUID();
localStorage.setItem("session_id", SESSION_ID);

let ENDPOINT = `http://localhost:8000/agent/chat/${SESSION_ID}`; // Day 10 endpoint

const recordBtn = document.getElementById("recordBtn");
const recText = document.getElementById("recText");
const recIcon = document.getElementById("recIcon");
const fileInput = document.getElementById("fileInput");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const transcriptEl = document.getElementById("transcript");
const player = document.getElementById("player");
const audioUrlEl = document.getElementById("audioUrl");
const shareBtn = document.getElementById("shareBtn");
const waveCanvas = document.getElementById("wave");

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let audioContext, analyser, dataArray, rafId;
let streamGlobal = null;

// ---------- UI helpers ----------
function setStatus(text, color = "#4ade80"){
  statusText.textContent = text;
  statusDot.style.background = color;
}
function setTranscript(text){
  transcriptEl.value = text || "";
}
function setAudioUrl(url){
  audioUrlEl.textContent = url || "";
  if (url) audioUrlEl.title = url;
  player.src = url || "";
}

// ---------- Recording & waveform ----------
async function startRecording(){
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamGlobal = stream;
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      await processAudioBlob(blob);
      stopVisualization();
      if (streamGlobal){
        streamGlobal.getTracks().forEach(t=>t.stop());
        streamGlobal = null;
      }
    };
    mediaRecorder.start();
    isRecording = true;
    recText.textContent = "Recording... Click to stop";
    recIcon.style.background = "#ff6b6b";
    setStatus("Recording", "#ff6b6b");
    startVisualization(stream);
  } catch (err){
    alert("Microphone access denied or not available.\n" + err.message);
  }
}
function stopRecording(){
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  isRecording = false;
  recText.textContent = "Start Recording";
  recIcon.style.background = "#ff3860";
}

// ---------- File upload/selection ----------
fileInput.addEventListener("change", async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  setStatus("Uploading file...", "#f59e0b");
  await processAudioBlob(f);
});

// ---------- Main flow: send audio to backend, handle response ----------
async function processAudioBlob(blob){
  try {
    setTranscript("");
    setAudioUrl("");
    setStatus("Processing audio...", "#f97316");

    // Build form data
    const fd = new FormData();
    const fileName = (blob.name) ? blob.name : `recording-${Date.now()}.webm`;
    fd.append(FIELD_NAME, blob, fileName);

    // POST to backend
    const resp = await fetch(ENDPOINT, {
      method: "POST",
      body: fd
    });

    if (!resp.ok){
      const t = await resp.text();
      throw new Error(`Server error: ${resp.status} ${t}`);
    }

    // Day 10 expects same response shape as Day 9
    const data = await resp.json();
    // { transcription: "...", llmResponse: "...", audioUrl: "..." }
    const transcription = data.transcription || "";
    const llmReply = data.llmResponse || "";
    const audioUrl = data.audioUrl || "";

    if (!audioUrl){
      console.warn("Response:", data);
      throw new Error("No audioUrl returned from server.");
    }

    // Display conversation style transcript
    setTranscript(`You said: ${transcription}\nBot says: ${llmReply}`);
    setAudioUrl(audioUrl);
    setStatus("Ready — Bot replied with voice", "#60a5fa");

    // auto play and chain recording when playback ends (Day 10)
    player.pause();
    player.src = audioUrl;
    player.onended = () => {
      // Automatically start recording next message
      startRecording();
    };
    try { await player.play(); } catch(e){ /* autoplay may be blocked */ }
  } catch (err){
    console.error(err);
    setStatus("Error — see console", "#ef4444");
    setTranscript(`Error: ${err.message}`);
    alert("Error processing audio: " + err.message);
  }
}

// ---------- Share / copy URL ----------
shareBtn.addEventListener("click", async () => {
  const url = audioUrlEl.textContent;
  if (!url) return alert("No audio URL to copy.");
  try {
    await navigator.clipboard.writeText(url);
    shareBtn.textContent = "Copied!";
    setTimeout(()=> shareBtn.textContent = "Copy URL", 1500);
  } catch {
    prompt("Copy this URL:", url);
  }
});

// ---------- Recording button ----------
recordBtn.addEventListener("click", () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

// ---------- Visualization ----------
const canvas = waveCanvas;
const ctx = canvas.getContext("2d");
function startVisualization(stream){
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  source.connect(analyser);
  drawWave();
}
function drawWave(){
  rafId = requestAnimationFrame(drawWave);
  analyser.getByteTimeDomainData(dataArray);
  ctx.clearRect(0,0,canvas.width, canvas.height);

  ctx.lineWidth = 2;
  const g = ctx.createLinearGradient(0,0,canvas.width,0);
  g.addColorStop(0, "#8b5cf6");
  g.addColorStop(0.6, "#06b6d4");
  ctx.strokeStyle = g;

  ctx.beginPath();
  const sliceWidth = canvas.width / dataArray.length;
  let x = 0;
  for(let i=0; i<dataArray.length; i++){
    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;
    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
    x += sliceWidth;
  }
  ctx.lineTo(canvas.width, canvas.height/2);
  ctx.stroke();

  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(139,92,246,0.02)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.globalCompositeOperation = "source-over";
}
function stopVisualization(){
  if (rafId) cancelAnimationFrame(rafId);
  if (audioContext) {
    audioContext.close().catch(()=>{});
    audioContext = null;
  }
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

// ---------- Canvas resize ----------
function fixCanvasSize(){
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  canvas.style.width = `${canvas.clientWidth}px`;
  canvas.style.height = `${canvas.clientHeight}px`;
  ctx.scale(dpr, dpr);
}
window.addEventListener("resize", () => {
  ctx.setTransform(1,0,0,1,0,0);
  fixCanvasSize();
});
fixCanvasSize();

// ---------- Initial status ----------
setStatus("Idle", "#4ade80");
