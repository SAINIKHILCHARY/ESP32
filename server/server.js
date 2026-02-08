const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store current command for the device
let currentCommand = "IDLE";
let deviceStatus = {
    light: "OFF",
    fan: "OFF"
};
const knownDevices = new Set();

// --- API FOR FRONTEND ---

// Receive voice command from frontend
app.post('/api/command', (req, res) => {
    const { command } = req.body;
    if (command) {
        console.log(`[Frontend] Received command: ${command}`);
        currentCommand = command;
        res.json({ status: 'success', message: 'Command queued' });
    } else {
        res.status(400).json({ status: 'error', message: 'No command provided' });
    }
});

// Get current device status
app.get('/api/status', (req, res) => {
    res.json(deviceStatus);
});

// --- API FOR ESP32 ---

// ESP32 polls this to get the latest command
app.get('/device/command', (req, res) => {
    // Only send command if it matches the specific device ID (optional security)
    const deviceId = req.query.device_id;

    if (deviceId && !knownDevices.has(deviceId)) {
        knownDevices.add(deviceId);
        console.log(`\n🎉 NEW DEVICE CONNECTED: ${deviceId}\n`);
    }

    // console.log(`[Device] Poll from ${deviceId}, Sending: ${currentCommand}`);
    res.send(currentCommand);

    // Reset command after sending to avoid repeated execution (optional, depends on logic)
    // currentCommand = "IDLE"; 
});

// ESP32 sends status updates here
app.post('/device/status', (req, res) => {
    const { device_id, light, fan } = req.body;
    console.log(`[Device] Status Update: Light=${light}, Fan=${fan}`);

    if (light) deviceStatus.light = light;
    if (fan) deviceStatus.fan = fan;

    res.json({ status: 'success' });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
