let ws;
let mediaRecorder;
let audioContext, analyser, dataArray, rafId;

const wsDot  = document.getElementById("wsDot");
const wsText = document.getElementById("wsText");
const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");
const logEl = document.getElementById("log");
const meter = document.getElementById("meter");
const ctx = meter.getContext("2d");

function log(msg){
  const time = new Date().toLocaleTimeString();
  logEl.textContent += `[${time}] ${msg}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function setWSStatus(connected){
  wsDot.classList.toggle("connected", connected);
  wsText.textContent = connected ? "Connected" : "Disconnected";
}

function drawMeter(){
  rafId = requestAnimationFrame(drawMeter);
  if (!analyser) return;
  const arr = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(arr);

  ctx.clearRect(0,0,meter.width,meter.height);
  ctx.lineWidth = 2;

  // gradient
  const g = ctx.createLinearGradient(0,0,meter.width,0);
  g.addColorStop(0, "#7c5cff");
  g.addColorStop(1, "#22d3ee");
  ctx.strokeStyle = g;

  ctx.beginPath();
  const slice = meter.width / arr.length;
  let x = 0;
  for (let i=0;i<arr.length;i++){
    const v = arr[i] / 128.0;
    const y = (v * meter.height/2);
    i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    x += slice;
  }
  ctx.lineTo(meter.width, meter.height/2);
  ctx.stroke();
}

async function start() {
  // Connect WebSocket
  ws = new WebSocket("ws://localhost:3000/ws");

  ws.onopen = () => {
    log("WebSocket connected");
    setWSStatus(true);
    startBtn.disabled = true;
    stopBtn.disabled = false;
    document.body.classList.add("recording");
  };

  ws.onclose = () => {
    log("WebSocket closed");
    setWSStatus(false);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    document.body.classList.remove("recording");
  };

  ws.onerror = (e) => {
    log("WebSocket error (see console)");
    console.error(e);
  };

  ws.onmessage = (evt) => {
    // server echoes text / sends JSON when file saved
    log(`Server: ${evt.data}`);
  };

  // Mic access
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Visualizer
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  drawMeter();

  // MediaRecorder (500ms chunks)
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "audio/webm";
  mediaRecorder = new MediaRecorder(stream, { mimeType });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
      event.data.arrayBuffer().then((buffer) => {
        ws.send(buffer); // send raw binary to server
      });
    }
  };

  mediaRecorder.onstop = () => {
    // close audio context & visualizer
    if (rafId) cancelAnimationFrame(rafId);
    if (audioContext) {
      audioContext.close().catch(()=>{});
      audioContext = null;
      analyser = null;
    }
  };

  mediaRecorder.start(500);
  log("Recording started… streaming chunks every 500ms");
}

function stop() {
  try {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  } catch {}
  try {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("END"); // tell server to finalize file and close
    }
  } catch {}
  log("Stop requested…");
}

startBtn.onclick = start;
stopBtn.onclick = stop;

// Hi-DPI canvas scale
function resizeCanvas(){
  const dpr = window.devicePixelRatio || 1;
  const rect = meter.getBoundingClientRect();
  meter.width = Math.floor(rect.width * dpr);
  meter.height = Math.floor(80 * dpr);
  meter.style.height = "80px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
