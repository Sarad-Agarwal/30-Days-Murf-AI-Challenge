let mediaRecorder;
let ws;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const transcriptEl = document.getElementById("transcript");
const wsDot = document.getElementById("wsDot");
const wsText = document.getElementById("wsText");

startBtn.onclick = async () => {
  ws = new WebSocket("ws://localhost:8000/ws");

  ws.onopen = () => {
    console.log("WebSocket connected");
    wsDot.style.background = "limegreen";
    wsText.textContent = "Connected";
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  ws.onmessage = (event) => {
    transcriptEl.textContent += event.data + "\n";
  };

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
      event.data.arrayBuffer().then(buffer => ws.send(buffer));
    }
  };

  mediaRecorder.start(500);
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  ws.close();
  startBtn.disabled = false;
  stopBtn.disabled = true;
  wsDot.style.background = "red";
  wsText.textContent = "Disconnected";
};
