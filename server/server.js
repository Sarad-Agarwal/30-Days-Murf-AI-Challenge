const express = require("express");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

// --- Setup ---
const app = express();
const PORT = 3000;

// Serve the client (static)
app.use(express.static(path.join(__dirname, "../client")));

// Ensure /audio exists
const audioDir = path.join(__dirname, "audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/index.html`);
});

const wss = new WebSocket.Server({ server, path: "/ws" });


function makeWriteStream() {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `recording-${ts}.webm`;
  const filePath = path.join(audioDir, filename);
  const stream = fs.createWriteStream(filePath);
  return { stream, filePath };
}

function heartbeat() {
  this.isAlive = true;
}

wss.on("connection", (ws) => {
  console.log("WebSocket: client connected");
  ws.isAlive = true;
  ws.on("pong", heartbeat);

  // create a fresh file for this client
  const { stream, filePath } = makeWriteStream();
  let bytesWritten = 0;

  ws.on("message", (message) => {
    // Could be text (control) or binary (audio)
    if (typeof message === "string") {
      const trimmed = message.trim();
      if (trimmed === "END") {
        console.log("WebSocket: received END signal");
        stream.end(() => {
          console.log(`Saved audio: ${filePath} (${bytesWritten} bytes)`);
        });
        ws.send(JSON.stringify({ type: "saved", filePath }));
        ws.close();
      } else {
        // echo text for debugging
        ws.send(`Echo: ${trimmed}`);
      }
      return;
    }

    // Binary → write to file
    stream.write(message);
    bytesWritten += message.length || message.byteLength || 0;
  });

  ws.on("close", () => {
    console.log("WebSocket: client disconnected");
    // Make sure the file is closed
    if (!stream.closed) {
      stream.end(() => {
        console.log(`Closed file: ${filePath} (${bytesWritten} bytes)`);
      });
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

// Ping clients to keep connection alive
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => clearInterval(interval));
