const micBtn = document.getElementById('mic-btn');
const transcriptEl = document.getElementById('transcript');
const lightStatusEl = document.getElementById('light-status');
const fanStatusEl = document.getElementById('fan-status');

// Helper to update UI
function updateStatus(device, state) {
    const el = device === 'light' ? lightStatusEl : fanStatusEl;
    el.textContent = state;
    el.className = `status ${state.toLowerCase()}`;
}

// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.classList.add('listening');
        transcriptEl.textContent = "Listening...";
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        transcriptEl.textContent = `You said: "${transcript}"`;
        micBtn.classList.remove('listening');
        processCommand(transcript);
    };

    recognition.onerror = (event) => {
        transcriptEl.textContent = "Error occurred in recognition: " + event.error;
        micBtn.classList.remove('listening');
    };

    recognition.onend = () => {
        micBtn.classList.remove('listening');
    };

} else {
    transcriptEl.textContent = "Browser does not support Speech Recognition.";
}

function processCommand(text) {
    let command = null;

    if (text.includes("turn on light") || text.includes("light on")) {
        command = "LIGHT_ON";
        updateStatus('light', 'ON');
    } else if (text.includes("turn off light") || text.includes("light off")) {
        command = "LIGHT_OFF";
        updateStatus('light', 'OFF');
    } else if (text.includes("turn on fan") || text.includes("fan on")) {
        command = "FAN_ON";
        updateStatus('fan', 'ON');
    } else if (text.includes("turn off fan") || text.includes("fan off")) {
        command = "FAN_OFF";
        updateStatus('fan', 'OFF');
    }

    if (command) {
        sendCommandToServer(command);
    } else {
        transcriptEl.textContent = "Command not recognized.";
    }
}

async function sendCommandToServer(command) {
    try {
        const response = await fetch('/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: command })
        });
        const data = await response.json();
        console.log("Server response:", data);
    } catch (error) {
        console.error("Error sending command:", error);
    }
}
