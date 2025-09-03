const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { sanitizeInput } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5100;
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:5000';

// Middleware
app.use(cors());
app.use(express.json());
app.use(sanitizeInput);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        service: 'flight_controller_bridge',
        status: 'healthy',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Flight controller endpoints
app.post('/flight/takeoff', sanitizeInput, async (req, res) => {
    try {
        const { drone_id, altitude } = req.body;

        // Simulate flight controller communication
        const flightCommand = {
            command: 'takeoff',
            drone_id,
            altitude: altitude || 10,
            timestamp: new Date().toISOString()
        };

        // Log command
        console.log('Takeoff command:', flightCommand);

        // Notify backend
        await axios.post(`${BACKEND_URL}/api/flight/command`, flightCommand);

        res.json({
            success: true,
            command: flightCommand,
            status: 'executed'
        });
    } catch (error) {
        console.error('Takeoff error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/flight/land', sanitizeInput, async (req, res) => {
    try {
        const { drone_id } = req.body;

        const flightCommand = {
            command: 'land',
            drone_id,
            timestamp: new Date().toISOString()
        };

        console.log('Land command:', flightCommand);

        await axios.post(`${BACKEND_URL}/api/flight/command`, flightCommand);

        res.json({
            success: true,
            command: flightCommand,
            status: 'executed'
        });
    } catch (error) {
        console.error('Land error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/flight/navigate', sanitizeInput, async (req, res) => {
    try {
        const { drone_id, coordinates, altitude } = req.body;

        const flightCommand = {
            command: 'navigate',
            drone_id,
            coordinates,
            altitude,
            timestamp: new Date().toISOString()
        };

        console.log('Navigate command:', flightCommand);

        await axios.post(`${BACKEND_URL}/api/flight/command`, flightCommand);

        res.json({
            success: true,
            command: flightCommand,
            status: 'executed'
        });
    } catch (error) {
        console.error('Navigate error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/flight/status/:drone_id', (req, res) => {
    const { drone_id } = req.params;

    // Simulate flight status
    const status = {
        drone_id,
        flight_mode: 'AUTO',
        armed: true,
        altitude: 15.5,
        battery: 85,
        gps_fix: true,
        timestamp: new Date().toISOString()
    };

    res.json(status);
});

app.listen(PORT, () => {
    console.log(`Flight Controller Bridge running on port ${PORT}`);
});
