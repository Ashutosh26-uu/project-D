const isTest = process.env.NODE_ENV === 'test';

function required(name, { minLength = 1 } = {}) {
  const value = process.env[name];
  if (!value || value.length < minLength) {
    throw new Error(`Environment variable ${name} is required${minLength > 1 ? ` (min ${minLength} chars)` : ''}`);
  }
  return value;
}

function list(value) {
  return (value || '').split(',').map((s) => s.trim()).filter(Boolean);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/drone_fleet',
  jwtSecret: isTest ? 'test-secret-test-secret-test-secret' : required('JWT_SECRET', { minLength: 32 }),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  corsOrigins: list(process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173'),
  ai: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    token: process.env.AI_SERVICE_TOKEN || '',
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 30000,
  },
  alerts: {
    classes: new Set(list(process.env.ALERT_CLASSES || 'person,car,truck,bus,motorcycle,airplane,boat')),
    minConfidence: Number(process.env.ALERT_MIN_CONFIDENCE) || 0.5,
    // An identical open alert (same drone, same classes) within this window is not raised again
    cooldownMs: Number(process.env.ALERT_COOLDOWN_MS) || 60000,
  },
  seedAdmin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '',
  },
  maxImageBytes: 10 * 1024 * 1024,
  // A drone that sends nothing for this long is marked offline
  droneOfflineMs: Number(process.env.DRONE_OFFLINE_MS) || 30000,
};

module.exports = config;
