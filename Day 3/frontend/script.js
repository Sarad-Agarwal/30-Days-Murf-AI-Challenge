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

        if (!response.ok) {
            throw new Error("Failed to generate audio");
        }

        const data = await response.json();
        audioPlayer.src = data.audioFile;
        audioPlayer.play();
        status.textContent = "Audio ready!";
    } catch (error) {
        console.error(error);
        status.textContent = "Error generating audio.";
    }
});
