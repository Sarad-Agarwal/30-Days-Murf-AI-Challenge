// Text to Speech
document.getElementById("submitBtn").addEventListener("click", async () => {
    const text = document.getElementById("textInput").value;
    const status = document.getElementById("status");
    const audioPlayer = document.getElementById("audioPlayer");

    if (!text) {
        status.textContent = "Please enter some text.";
        return;
    }

    status.textContent = "Generating audio...";

    try {
        const response = await fetch("/generate-tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error("Failed to generate audio");

        const data = await response.json();
        audioPlayer.src = data.audioFile;
        audioPlayer.play();
        status.textContent = "Audio ready!";
    } catch (error) {
        console.error(error);
        status.textContent = "Error generating audio.";
    }
});

// Echo Bot with Upload
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
            echoStatus.textContent = "Playing your echo! Uploading audio...";

            // Upload audio to the server
            const formData = new FormData();
            formData.append("file", audioBlob, "echo.wav");

            try {
                const response = await fetch("/upload-audio", {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) throw new Error("Upload failed");
                const result = await response.json();

                echoStatus.textContent = `Uploaded: ${result.file_name} (${result.size} bytes)`;
            } catch (error) {
                console.error(error);
                echoStatus.textContent = "Error uploading audio.";
            }
        };

        mediaRecorder.start();
        echoStatus.textContent = "Recording...";
        startRecordBtn.disabled = true;
        stopRecordBtn.disabled = false;
    } catch (error) {
        echoStatus.textContent = "Microphone access denied or unavailable.";
    }
});

stopRecordBtn.addEventListener("click", () => {
    mediaRecorder.stop();
    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;
    echoStatus.textContent = "Processing your echo...";
});
