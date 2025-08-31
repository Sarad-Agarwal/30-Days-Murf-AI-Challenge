// 🎙️ Text to Speech Handler
document.getElementById("submitBtn").addEventListener("click", async () => {
    const text = document.getElementById("textInput").value.trim();
    const status = document.getElementById("status");
    const audioPlayer = document.getElementById("audioPlayer");

    if (!text) {
        status.textContent = "⚠️ Please enter some text.";
        return;
    }

    status.textContent = "⏳ Generating audio...";

    try {
        const response = await fetch("http://127.0.0.1:5000/generate-tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error("Failed to generate audio");

        const data = await response.json();
        audioPlayer.src = data.audioFile;
        audioPlayer.play();
        status.textContent = "✅ Audio ready!";
    } catch (error) {
        console.error("TTS Error:", error);
        status.textContent = "❌ Error generating audio.";
    }
});

// 🎧 Echo Bot Recording
let mediaRecorder;
let audioChunks = [];

const startRecordBtn = document.getElementById("startRecord");
const stopRecordBtn = document.getElementById("stopRecord");
const echoPlayer = document.getElementById("echoPlayer");
const echoStatus = document.getElementById("echoStatus");

startRecordBtn.addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        audioChunks = [];
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            echoPlayer.src = audioUrl;
            echoPlayer.play();
            echoStatus.textContent = "🔁 Playing your echo! Uploading...";

            const formData = new FormData();
            formData.append("file", audioBlob, "echo.wav");

            try {
                const response = await fetch("http://127.0.0.1:5000/upload-audio", {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) throw new Error("Upload failed");
                const result = await response.json();

                echoStatus.textContent = `✅ Uploaded: ${result.file_name} (${result.size} bytes)`;
            } catch (error) {
                console.error("Upload Error:", error);
                echoStatus.textContent = "❌ Error uploading audio.";
            }
        };

        mediaRecorder.start();
        echoStatus.textContent = "🎙️ Recording...";
        startRecordBtn.disabled = true;
        stopRecordBtn.disabled = false;
    } catch (error) {
        console.error("Microphone Error:", error);
        echoStatus.textContent = "🚫 Microphone access denied.";
    }
});

stopRecordBtn.addEventListener("click", () => {
    mediaRecorder.stop();
    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;
    echoStatus.textContent = "⏳ Processing your echo...";
});

// 📝 Transcription Recording
const recordTranscriptionBtn = document.getElementById("recordTranscriptionBtn");
const transcriptionStatus = document.getElementById("transcriptionStatus");
const transcriptionResult = document.getElementById("transcription-result");

let transcriptionRecorder;
let transcriptionChunks = [];

recordTranscriptionBtn.addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        transcriptionRecorder = new MediaRecorder(stream);

        transcriptionChunks = [];
        transcriptionRecorder.ondataavailable = event => {
            if (event.data.size > 0) transcriptionChunks.push(event.data);
        };

        transcriptionRecorder.onstop = async () => {
            const audioBlob = new Blob(transcriptionChunks, { type: "audio/wav" });
            const formData = new FormData();
            formData.append("file", audioBlob, "transcribe.wav");

            transcriptionStatus.textContent = "⏳ Transcribing with AssemblyAI...";

            try {
                const response = await fetch("http://127.0.0.1:5000/transcribe/file", {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) throw new Error("Transcription failed");
                const result = await response.json();

                transcriptionResult.textContent = result.text || "📝 No transcription found.";
                transcriptionStatus.textContent = "✅ Transcription completed!";
            } catch (error) {
                console.error("Transcription Error:", error);
                transcriptionStatus.textContent = "❌ Transcription failed.";
            }
        };

        transcriptionRecorder.start();
        transcriptionStatus.textContent = "🎙️ Recording... (Auto stops after 5 sec)";
        recordTranscriptionBtn.disabled = true;

        setTimeout(() => {
            transcriptionRecorder.stop();
            recordTranscriptionBtn.disabled = false;
        }, 5000); // Record for 5 seconds
    } catch (error) {
        console.error("Microphone Error:", error);
        transcriptionStatus.textContent = "🚫 Microphone access denied.";
    }
});
