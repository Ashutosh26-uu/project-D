const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const { authenticateToken, csrfProtection, sanitizeInput } = require('./middleware/auth');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/drone_fleet';
console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();
const PORT = process.env.PORT || 5000;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8080;

console.log(`Starting Express server on port: ${PORT}`);
console.log(`Starting WebSocket server on port: ${WEBSOCKET_PORT}`);

// Service URLs from environment variables
const serviceUrls = {
  flightController: process.env.FLIGHT_CONTROLLER_URL || 'http://flight_controller_bridge:5100',
  missionPlanner: process.env.MISSION_PLANNER_URL || 'http://mission_planner:5200',
  sensorFusion: process.env.SENSOR_FUSION_URL || 'http://sensor_fusion:5300',
  swarmCommBroker: process.env.SWARM_COMM_BROKER_URL || 'http://swarm_comm_broker:5400',
  securityLayer: process.env.SECURITY_LAYER_URL || 'http://security_layer:5450',
  latencyPredictor: process.env.LATENCY_PREDICTOR_URL || 'http://latency_predictor:5500',
  videoEncryption: process.env.VIDEO_ENCRYPTION_URL || 'http://video_encryption:5600',
  swarmAI: process.env.SWARM_AI_URL || 'http://swarm_ai:5700',
  aiInference: process.env.AI_INFERENCE_URL || 'http://ai_inference:5800'
};

console.log('Service URLs configured:', serviceUrls);

// WebSocket server
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT });

// Map of droneId to WebSocket (for drones)
const droneSockets = new Map();
// Set of client sockets (for dashboards, etc.)
const clientSockets = new Set();

// Enhanced WebSocket handling for AI integration
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('WebSocket message received:', encodeURIComponent(data.type || 'unknown'));

      switch (data.type) {
        case 'service_registration':
          handleServiceRegistration(ws, data);
          break;
        case 'drone_registration':
          handleDroneRegistration(ws, data);
          break;
        case 'detection_request':
          await handleDetectionRequest(ws, data);
          break;
        case 'detection_results':
          await handleDetectionResults(ws, data);
          break;
        case 'telemetry_update':
          await handleTelemetryUpdate(ws, data);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    // Clean up drone and service registrations
    cleanupConnections(ws);
  });
});

// Service registration handler
function handleServiceRegistration(ws, data) {
  const { service, port } = data;
  console.log(`Service registered: ${encodeURIComponent(service)} on port ${port}`);

  // Store service connection
  if (!global.serviceConnections) {
    global.serviceConnections = new Map();
  }
  global.serviceConnections.set(service, { ws, port });

  ws.send(JSON.stringify({
    type: 'registration_confirmed',
    service,
    status: 'registered'
  }));
}

// Detection request handler
async function handleDetectionRequest(ws, data) {
  try {
    const { drone_id, image, timestamp } = data;

    // Forward to AI inference service
    const response = await axios.post(`${serviceUrls.aiInference}/detect`, {
      image,
      drone_id,
      timestamp
    });

    if (response.data.success) {
      // Broadcast results to all connected clients
      const resultMessage = {
        type: 'detection_results',
        drone_id,
        detections: response.data.detections,
        count: response.data.count,
        timestamp: response.data.timestamp
      };

      broadcastToClients(resultMessage);

      // Store detection results in database
      await storeDetectionResults(drone_id, response.data.detections);
    }
  } catch (error) {
    console.error('Detection request error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Detection request failed',
      error: error.message
    }));
  }
}

// Detection results handler
async function handleDetectionResults(ws, data) {
  try {
    const { drone_id, results, timestamp } = data;

    // Store results in database
    await storeDetectionResults(drone_id, results);

    // Broadcast to all connected clients
    broadcastToClients({
      type: 'detection_results',
      drone_id,
      results,
      timestamp
    });

    // Trigger threat analysis if high-threat objects detected
    const highThreatDetections = results.filter(r => r.threat_level === 'high');
    if (highThreatDetections.length > 0) {
      await triggerThreatResponse(drone_id, highThreatDetections);
    }

  } catch (error) {
    console.error('Detection results handling error:', error);
  }
}

// Store detection results in database
async function storeDetectionResults(droneId, detections) {
  try {
    const drone = await Drone.findOne({ name: droneId });
    if (drone) {
      // Update drone with latest detections
      drone.detections = detections;
      drone.lastDetectionTime = new Date();
      await drone.save();

      // Store individual detection records
      for (const detection of detections) {
        const detectionRecord = {
          droneId,
          detection,
          timestamp: new Date(),
          threatLevel: detection.threat_level
        };

        // You can create a Detection model and save here
        console.log('Detection stored:', detectionRecord);
      }
    }
  } catch (error) {
    console.error('Error storing detection results:', error);
  }
}

// Trigger threat response
async function triggerThreatResponse(droneId, threats) {
  try {
    console.log(`High threat detected by drone ${encodeURIComponent(droneId)}:`, JSON.stringify(threats));

    // Notify security layer
    await axios.post(`${serviceUrls.securityLayer}/threat-alert`, {
      drone_id: droneId,
      threats,
      timestamp: new Date().toISOString()
    });

    // Broadcast threat alert
    broadcastToClients({
      type: 'threat_alert',
      drone_id: droneId,
      threats,
      severity: 'high',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Threat response error:', error);
  }
}

// Broadcast message to all connected clients
function broadcastToClients(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Cleanup connections
function cleanupConnections(ws) {
  // Remove from service connections
  if (global.serviceConnections) {
    for (const [service, connection] of global.serviceConnections.entries()) {
      if (connection.ws === ws) {
        global.serviceConnections.delete(service);
        console.log(`Service ${service} disconnected`);
        break;
      }
    }
  }

  // Remove from drone connections
  for (const [droneId, connection] of droneSockets.entries()) {
    if (connection.ws === ws) {
      droneSockets.delete(droneId);
      console.log(`Drone ${droneId} disconnected`);
      break;
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(sanitizeInput); // Apply input sanitization globally
app.use('/uploads', express.static('uploads'));

// CSRF token generation endpoint
app.get('/api/csrf-token', (req, res) => {
  const token = require('crypto').randomBytes(32).toString('hex');
  req.session = req.session || {};
  req.session.csrfToken = token;
  res.json({ csrfToken: token });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- WebSocket Real-Time Per-Drone Logic ---
/**
 * WebSocket message structure:
 * - Telemetry (from drone):
 *   { type: 'telemetry', droneId: 'pinaka-1', telemetry: { battery, altitude, speed, signal, heading, orientation, mode, lat, lng }, location: { lat, lng } }
 * - Command (from frontend):
 *   { type: 'command', droneId: 'pinaka-1', command: 'takeoff'|'land'|'rth'|'arm'|'disarm'|'override'|'mission_upload'|'kamikaze'|'emergency_land'|'kill_switch', params: {...} }
 * - Video/thermal feed (placeholder):
 *   { type: 'video', droneId, streamUrl }
 * - Swarm command (placeholder):
 *   { type: 'swarm_command', command, drones: [droneId,...], params }
 * - Emergency (placeholder):
 *   { type: 'emergency', droneId, action: 'abort'|'kill'|'emergency_land' }
 * - IFF update (placeholder):
 *   { type: 'iff_update', droneId, iffCode, status }
 */

// Drone Mongoose model
const droneSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, default: 'Reconnaissance' },
  status: { type: String, default: 'Idle' },
  telemetry: {
    battery: { type: Number, default: 100 },
    altitude: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    signal: { type: Number, default: 100 },
    heading: { type: Number, default: 0 },
    orientation: { type: String, default: 'N' },
    mode: { type: String, default: 'Auto' },
  },
  role: { type: String, default: 'Scout' },
  isActive: { type: Boolean, default: false },
  isHeadDrone: { type: Boolean, default: false },
  jammingStatus: { type: String, default: 'STANDBY' },
  threatLevel: { type: String, default: 'LOW' },
  location: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
  },
  lastDetection: { type: Object, default: null }, // Added for per-drone detection
  lastDescription: { type: Object, default: null }, // Added for per-drone description
}, { timestamps: true });

const Drone = mongoose.model('Drone', droneSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Advanced Drone Surveillance API' });
});

// AI Detection endpoint (per-drone, via FastAPI)
app.post('/api/detect', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { droneId, lat, lng, timestamp } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }
    const imagePath = req.file.path;
    // Forward to FastAPI /detect (YOLOv8)
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', require('fs').createReadStream(imagePath));
    if (lat) formData.append('lat', lat);
    if (lng) formData.append('long', lng);
    if (timestamp) formData.append('timestamp', timestamp);
    const fastApiUrl = 'http://localhost:8001/detect';
    let response, detections;
    try {
      response = await axios.post(fastApiUrl, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      detections = response.data;
    } catch (err) {
      console.error('Error forwarding to FastAPI:', err.response ? err.response.data : err.message);
      return res.status(500).json({ error: 'Failed to connect to AI detection service', details: err.message });
    }
    // Optionally store detection in drone DB if droneId is provided
    if (droneId) {
      await Drone.findOneAndUpdate(
        { name: new RegExp(`^${droneId}$`, 'i') },
        { $set: { lastDetection: detections } },
        { new: true }
      );
    }
    // Broadcast detection via WebSocket
    clientSockets.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'detection',
          droneId: droneId || null,
          detections,
        }));
      }
    });
    res.json({ success: true, droneId: droneId || null, detections });
  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({ error: 'Detection failed', details: error.message });
  }
});

// AI Description endpoint (per-drone, via FastAPI)
app.post('/api/describe', upload.single('image'), async (req, res) => {
  try {
    const { droneId } = req.body;
    if (!req.file || !droneId) {
      return res.status(400).json({ error: 'Image and droneId required' });
    }
    const imagePath = req.file.path;
    // Forward to FastAPI /describe
    const formData = new FormData();
    formData.append('file', require('fs').createReadStream(imagePath));
    const fastApiUrl = process.env.FASTAPI_URL_DESCRIBE || 'http://localhost:8000/describe';
    const response = await axios.post(fastApiUrl, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    const description = response.data;
    // Store description in drone DB
    await Drone.findOneAndUpdate(
      { name: new RegExp(`^${droneId}$`, 'i') },
      { $set: { lastDescription: description } },
      { new: true }
    );
    // Broadcast description via WebSocket
    clientSockets.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'description',
          droneId,
          description,
        }));
      }
    });
    res.json({ success: true, droneId, description });
  } catch (error) {
    console.error('Description error:', error);
    res.status(500).json({ error: 'Description failed' });
  }
});

// Analytics endpoints
app.get('/api/analytics/performance', (req, res) => {
  const performance = {
    detectionAccuracy: 94.2,
    responseTime: 2.3,
    systemUptime: 99.8,
    falsePositives: 3.2,
    threatsNeutralized: 127,
    coverageArea: 85.7
  };
  res.json(performance);
});

app.get('/api/analytics/trends', (req, res) => {
  const trends = {
    dailyDetections: [45, 52, 38, 67, 89, 76, 94],
    threatLevels: [12, 18, 15, 22, 31, 28, 35],
    systemEfficiency: [92, 94, 91, 96, 93, 95, 97]
  };
  res.json(trends);
});

app.get('/api/analytics/historical', (req, res) => {
  const historical = {
    monthlyThreats: [156, 189, 234, 198, 267, 245, 289],
    monthlyNeutralizations: [142, 175, 218, 185, 251, 232, 274],
    monthlyAccuracy: [91.2, 92.6, 93.1, 93.8, 94.2, 94.7, 94.9]
  };
  res.json(historical);
});

// Defense Systems endpoints
app.get('/api/defense/status', authenticateToken, (req, res) => {
  const defenseStatus = {
    airDefense: {
      active: true,
      coverage: 85,
      targets: 3,
      missiles: 12,
      range: 50,
      accuracy: 92
    },
    radar: {
      active: true,
      range: 200,
      targets: 5,
      frequency: 'X-Band',
      power: 85,
      interference: 0
    },
    missile: {
      ready: 8,
      locked: 2,
      fired: 0,
      accuracy: 94,
      range: 150,
      speed: 2500
    },
    jamming: {
      active: false,
      power: 0,
      frequency: 'Multi-Band',
      range: 100,
      effectiveness: 0
    }
  };
  res.json(defenseStatus);
});

app.post('/api/defense/activate', authenticateToken, csrfProtection, (req, res) => {
  const { system } = req.body;
  console.log(`Activating ${system} system`);

  // Broadcast defense system activation
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'defense_activation',
        data: { system, active: true }
      }));
    }
  });

  res.json({ success: true, message: `${system} system activated` });
});

// Security endpoints
app.get('/api/security/health', (req, res) => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    system_status: 'healthy',
    security_events_last_hour: 5,
    active_sessions: 3,
    failed_login_attempts: 2,
    system_uptime: '99.8%',
    memory_usage: '67%',
    cpu_usage: '45%',
    disk_usage: '23%'
  };
  res.json(healthStatus);
});

app.post('/api/security/login', (req, res) => {
  const { username, password } = req.body;

  // Use environment variables for credentials
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'defaultPassword123!';
  
  if (username === adminUsername && password === adminPassword) {
    const token = 'mock-jwt-token-' + Date.now();
    res.json({
      success: true,
      token,
      user: { username, role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Threat Analysis endpoints
app.get('/api/threats/current', (req, res) => {
  const threats = [
    {
      id: 1,
      type: 'Aircraft',
      distance: 150,
      speed: 450,
      threat: 'HIGH',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'Drone',
      distance: 80,
      speed: 120,
      threat: 'MEDIUM',
      timestamp: new Date().toISOString()
    }
  ];
  res.json(threats);
});

app.post('/api/threats/analyze', (req, res) => {
  const { threatData } = req.body;

  // Simulate threat analysis
  const analysis = {
    threatLevel: 'HIGH',
    confidence: 0.92,
    recommendedAction: 'Intercept',
    estimatedTimeToCritical: 180,
    riskFactors: ['High speed', 'Unknown origin', 'Erratic movement']
  };

  res.json(analysis);
});

// System Status endpoints
app.get('/api/system/status', (req, res) => {
  const systemStatus = {
    weather: 'Clear',
    windSpeed: 15,
    visibility: 'Good',
    threatLevel: 'MEDIUM',
    jammingActive: false,
    headDroneStatus: 'Operational'
  };
  res.json(systemStatus);
});

// Get all detections
app.get('/api/detections', (req, res) => {
  // Mock detections data
  const detections = [
    {
      id: 1,
      type: 'person',
      confidence: 0.95,
      bounding_box: [100, 150, 200, 300],
      threat_level: 'LOW',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'vehicle',
      confidence: 0.87,
      bounding_box: [300, 200, 450, 350],
      threat_level: 'MEDIUM',
      timestamp: new Date().toISOString()
    }
  ];
  res.json(detections);
});

// --- Drone API Endpoints ---

// Seed demo fleet if DB is empty
async function seedDemoFleet() {
  const count = await Drone.countDocuments();
  if (count === 0) {
    const demoDrones = [
      { name: 'Pinaka 1', type: 'Reconnaissance', isActive: true, isHeadDrone: true, location: { lat: 28.6139, lng: 77.2090 } },
      { name: 'Pinaka 2', type: 'Combat', isActive: true, isHeadDrone: false, location: { lat: 28.7041, lng: 77.1025 } },
      { name: 'Pinaka 3', type: 'Surveillance', isActive: false, isHeadDrone: false, location: { lat: 28.5355, lng: 77.3910 } },
    ];
    await Drone.insertMany(demoDrones);
    console.log('Demo drone fleet seeded');
  }
}
seedDemoFleet();

// List all drones
app.get('/api/drones', async (req, res) => {
  const drones = await Drone.find();
  res.json(drones);
});

// Register a new drone
app.post('/api/drones', async (req, res) => {
  try {
    const drone = new Drone(req.body);
    await drone.save();
    res.status(201).json(drone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a drone
app.put('/api/drones/:id', async (req, res) => {
  try {
    const drone = await Drone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!drone) return res.status(404).json({ error: 'Drone not found' });
    res.json(drone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a drone
app.delete('/api/drones/:id', async (req, res) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone) return res.status(404).json({ error: 'Drone not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- MISSING FEATURE ENDPOINTS (STUBS) ---

// Swarm Coordination: Assign roles, set behavior, get swarm status
app.post('/api/swarm/assign-role', (req, res) => {
  // Mock: assign role to drone
  res.json({ success: true, ...req.body });
});
app.post('/api/swarm/set-behavior', (req, res) => {
  // Mock: set swarm behavior
  res.json({ success: true, ...req.body });
});
app.get('/api/swarm/status', (req, res) => {
  // Mock: return swarm status
  res.json({
    drones: [
      { name: 'pinaka-1', role: 'Leader', behavior: 'Aggressive' },
      { name: 'pinaka-2', role: 'Support', behavior: 'Passive' },
    ],
  });
});

// IFF System: Friend-or-Foe tagging
app.post('/api/iff/tag', (req, res) => {
  // Mock: tag drone as friend/foe
  res.json({ success: true, ...req.body });
});
app.get('/api/iff/list', (req, res) => {
  // Mock: return IFF status for all drones
  res.json({
    drones: [
      { name: 'pinaka-1', iff: 'friend' },
      { name: 'pinaka-2', iff: 'foe' },
    ],
  });
});

// OTA/Model Management: List, upload, trigger update, rollback
app.get('/api/ota/list', (req, res) => {
  // Mock: list models/firmware
  res.json({
    drones: [
      { name: 'pinaka-1', firmware: 'v1.2', model: 'yolov5s.pt' },
      { name: 'pinaka-2', firmware: 'v1.1', model: 'yolov5s.pt' },
    ],
  });
});
app.post('/api/ota/upload', upload.single('file'), (req, res) => {
  // Mock: upload model/firmware
  res.json({ success: true, file: req.file });
});
app.post('/api/ota/update', (req, res) => {
  // Mock: trigger OTA update
  res.json({ success: true, ...req.body });
});
app.post('/api/ota/rollback', (req, res) => {
  // Mock: rollback firmware/model
  res.json({ success: true, ...req.body });
});

// Mission Logs/History: List, replay, export
app.get('/api/missions/list', (req, res) => {
  // Mock: list missions
  res.json({
    missions: [
      { id: 1, name: 'Recon Alpha', date: '2024-06-01', drones: ['pinaka-1'] },
      { id: 2, name: 'Patrol Beta', date: '2024-06-02', drones: ['pinaka-2'] },
    ],
  });
});
app.get('/api/missions/:id/replay', (req, res) => {
  // Mock: replay mission
  res.json({ success: true, missionId: req.params.id });
});
app.get('/api/missions/:id/export', (req, res) => {
  // Mock: export mission data
  res.json({ success: true, missionId: req.params.id, format: req.query.format || 'json' });
});

// Security/Access: Login, roles, access log
app.post('/api/auth/login', (req, res) => {
  // Mock: login with environment variables
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'defaultPassword123!';
  
  if (username === adminUsername && password === adminPassword) {
    res.json({ success: true, token: 'mock-jwt-token', role: 'Commander' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});
app.get('/api/auth/access-log', (req, res) => {
  // Mock: access log
  res.json({
    logs: [
      { user: 'admin', action: 'login', time: '2024-06-01T10:00:00Z' },
      { user: 'operator', action: 'view', time: '2024-06-01T10:05:00Z' },
    ],
  });
});

// Simulation Mode: Toggle, list virtual drones, mock detections
app.post('/api/sim/toggle', (req, res) => {
  // Mock: toggle simulation mode
  res.json({ success: true, mode: req.body.mode });
});
app.get('/api/sim/virtual-drones', (req, res) => {
  // Mock: list virtual drones
  res.json({
    drones: [
      { name: 'sim-1', status: 'Active' },
      { name: 'sim-2', status: 'Idle' },
    ],
  });
});
app.get('/api/sim/mock-detections', (req, res) => {
  // Mock: return mock AI detections
  res.json({
    detections: [
      { drone: 'sim-1', type: 'person', confidence: 0.92 },
      { drone: 'sim-2', type: 'vehicle', confidence: 0.88 },
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Enhanced API endpoints for AI integration

// AI service health check
app.get('/api/ai/health', async (req, res) => {
  try {
    const response = await axios.get(`${serviceUrls.aiInference}/health`);
    res.json({
      success: true,
      aiService: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'AI service unavailable',
      message: error.message
    });
  }
});

// Get AI model information
app.get('/api/ai/model-info', async (req, res) => {
  try {
    const response = await axios.get(`${serviceUrls.aiInference}/model/info`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get model info',
      message: error.message
    });
  }
});

// Manual detection endpoint
app.post('/api/ai/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert image to base64
    const imageBuffer = req.file.buffer || require('fs').readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // Send to AI service
    const response = await axios.post(`${serviceUrls.aiInference}/detect`, {
      image: base64Image
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Detection failed',
      message: error.message
    });
  }
});

// Batch analysis endpoint
app.post('/api/ai/analyze-batch', async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array required' });
    }

    const response = await axios.post(`${serviceUrls.aiInference}/analyze/batch`, {
      images
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Batch analysis failed',
      message: error.message
    });
  }
});

// Service status endpoint
app.get('/api/services/status', async (req, res) => {
  const serviceStatus = {};

  for (const [serviceName, url] of Object.entries(serviceUrls)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 5000 });
      serviceStatus[serviceName] = {
        status: 'healthy',
        url,
        response: response.data
      };
    } catch (error) {
      serviceStatus[serviceName] = {
        status: 'unhealthy',
        url,
        error: error.message
      };
    }
  }

  res.json({
    services: serviceStatus,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running on port 8080`);
});