// Vercel serverless function for the main API
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-app.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Analytics endpoints
app.get('/api/analytics/performance', (req, res) => {
  res.json({
    detectionAccuracy: 94.2,
    responseTime: 2.3,
    systemUptime: 99.8,
    falsePositiveRate: 3.2,
    encryptionSpeed: 50,
    encryptionSuccessRate: 100,
    securityCompliance: 100
  });
});

app.get('/api/analytics/trends', (req, res) => {
  const trends = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    detections: Math.floor(Math.random() * 100) + 50,
    threats: Math.floor(Math.random() * 10),
    accuracy: 90 + Math.random() * 10
  }));
  res.json(trends);
});

app.get('/api/analytics/historical', (req, res) => {
  res.json({
    totalMissions: 1247,
    successfulDetections: 11734,
    threatsNeutralized: 89,
    systemUptime: 99.8,
    averageResponseTime: 2.3
  });
});

// Defense system endpoints
app.get('/api/defense/status', (req, res) => {
  res.json({
    airDefense: { status: 'active', level: 'high' },
    radar: { status: 'scanning', range: '50km' },
    missiles: { status: 'armed', count: 12 },
    jamming: { status: 'standby', power: '75%' }
  });
});

app.post('/api/defense/activate', (req, res) => {
  const { system, action } = req.body;
  res.json({
    success: true,
    system,
    action,
    timestamp: new Date().toISOString()
  });
});

// Threat endpoints
app.get('/api/threats/current', (req, res) => {
  res.json([
    {
      id: 'T001',
      type: 'aircraft',
      threat_level: 'medium',
      position: { lat: 40.7128, lng: -74.0060 },
      detected_at: new Date().toISOString()
    }
  ]);
});

app.post('/api/threats/analyze', (req, res) => {
  const { image_data } = req.body;
  res.json({
    threats_detected: 1,
    analysis: 'Potential hostile aircraft detected',
    confidence: 0.87,
    recommended_action: 'Monitor and prepare countermeasures'
  });
});

// Security endpoints
app.get('/api/security/health', (req, res) => {
  res.json({
    encryption_status: 'active',
    authentication: 'enabled',
    firewall: 'active',
    intrusion_detection: 'monitoring',
    last_security_scan: new Date().toISOString()
  });
});

// Mission endpoints
app.get('/api/missions/current', (req, res) => {
  res.json({
    id: 'M001',
    name: 'Perimeter Patrol',
    status: 'active',
    progress: 65,
    estimated_completion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  });
});

app.get('/api/missions/history', (req, res) => {
  const missions = Array.from({ length: 10 }, (_, i) => ({
    id: `M${String(i + 1).padStart(3, '0')}`,
    name: `Mission ${i + 1}`,
    status: 'completed',
    completion_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    success_rate: 90 + Math.random() * 10
  }));
  res.json(missions);
});

// Microservice status endpoints
app.get('/api/flight-controller/status', (req, res) => {
  res.json({ status: 'operational', drones_connected: 4 });
});

app.get('/api/mission-planner/routes', (req, res) => {
  res.json({ active_routes: 2, planned_routes: 5 });
});

app.get('/api/sensor-fusion/data', (req, res) => {
  res.json({ sensors_active: 12, data_quality: 'excellent' });
});

app.get('/api/swarm-ai/coordination', (req, res) => {
  res.json({ swarm_size: 4, coordination_efficiency: 98.5 });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;
