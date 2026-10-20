const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { HttpError } = require('./errors');

function signUserToken(user) {
  return jwt.sign({ kind: 'user', role: user.role }, config.jwtSecret, {
    subject: user.id,
    expiresIn: config.jwtExpiresIn,
  });
}

// Long-lived credential a drone uses to stream telemetry; revoked via tokenVersion
function signDroneToken(drone, tokenVersion) {
  return jwt.sign({ kind: 'drone', ver: tokenVersion }, config.jwtSecret, { subject: drone.id, expiresIn: '365d' });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

// Resolves a user token to the current user record, so role changes and deletions apply immediately
async function userFromToken(token) {
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return null;
  }
  if (payload.kind !== 'user') return null;
  return User.findById(payload.sub);
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Authentication required');
  const user = await userFromToken(token);
  if (!user) throw new HttpError(401, 'Invalid or expired token');
  req.user = user;
  next();
}

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw new HttpError(403, 'Insufficient permissions');
  next();
};

module.exports = { signUserToken, signDroneToken, verifyToken, userFromToken, requireAuth, requireRole };
