const { WebSocketServer, WebSocket } = require('ws');
const { z } = require('zod');
const config = require('./config');
const Drone = require('./models/Drone');
const { verifyToken, userFromToken } = require('./middleware/auth');

const AUTH_TIMEOUT_MS = 5000;
const HEARTBEAT_MS = 30000;
const FLUSH_MS = 1000;
const SWEEP_MS = 5000;

const telemetrySchema = z.object({
  battery: z.number().min(0).max(100).optional(),
  altitude: z.number().min(-500).max(20000).optional(),
  speed: z.number().min(0).max(500).optional(),
  heading: z.number().min(0).max(360).optional(),
  signal: z.number().min(0).max(100).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
}).strict();

const droneMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('telemetry'), data: telemetrySchema }),
  z.object({ type: z.literal('status'), status: z.enum(['idle', 'active', 'returning', 'maintenance']) }),
]);

/**
 * WebSocket gateway on /ws (same port as the HTTP API).
 *
 * Every connection must send {type:"auth", token} within 5s.
 *  - User tokens subscribe to broadcasts (drone, telemetry, detection, alert, ...).
 *  - Drone device tokens may send telemetry/status messages.
 *
 * Telemetry is coalesced: the latest sample per drone is written to MongoDB and
 * broadcast once per second, so a fast-reporting drone doesn't hammer the DB or clients.
 */
function createRealtime(server) {
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 64 * 1024 });
  const viewers = new Set();
  const droneSockets = new Map(); // droneId -> ws
  const pending = new Map(); // droneId -> latest telemetry update

  function send(ws, type, payload) {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type, payload }));
  }

  function broadcast(type, payload) {
    const message = JSON.stringify({ type, payload });
    for (const ws of viewers) {
      if (ws.readyState === WebSocket.OPEN) ws.send(message);
    }
  }

  async function authenticate(ws, token) {
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return false;
    }

    if (payload.kind === 'user') {
      const user = await userFromToken(token);
      if (!user) return false;
      ws.role = 'viewer';
      viewers.add(ws);
      send(ws, 'ready', { as: 'user' });
      return true;
    }

    if (payload.kind === 'drone') {
      const drone = await Drone.findById(payload.sub).select('+tokenVersion');
      if (!drone || drone.tokenVersion !== payload.ver) return false;
      ws.role = 'drone';
      ws.droneId = drone.id;
      droneSockets.get(drone.id)?.close(4000, 'Replaced by a new connection');
      droneSockets.set(drone.id, ws);
      const updated = await Drone.findByIdAndUpdate(drone.id,
        { lastSeenAt: new Date(), ...(drone.status === 'offline' ? { status: 'idle' } : {}) }, { returnDocument: 'after' });
      broadcast('drone', updated);
      send(ws, 'ready', { as: 'drone', droneId: drone.id });
      return true;
    }
    return false;
  }

  async function handleDroneMessage(ws, msg) {
    const parsed = droneMessageSchema.safeParse(msg);
    if (!parsed.success) {
      send(ws, 'error', { message: 'Invalid message', details: parsed.error.issues.map((i) => i.message) });
      return;
    }
    if (parsed.data.type === 'telemetry') {
      const prev = pending.get(ws.droneId) || {};
      pending.set(ws.droneId, { ...prev, ...parsed.data.data });
    } else {
      const drone = await Drone.findByIdAndUpdate(ws.droneId,
        { status: parsed.data.status, lastSeenAt: new Date() }, { returnDocument: 'after' });
      if (drone) broadcast('drone', drone);
    }
  }

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    const authTimer = setTimeout(() => ws.close(4001, 'Authentication timeout'), AUTH_TIMEOUT_MS);

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        send(ws, 'error', { message: 'Messages must be JSON' });
        return;
      }

      try {
        if (!ws.role) {
          // A client may send its first messages before the auth lookup finishes
          if (ws.authPromise) {
            await ws.authPromise;
            if (!ws.role) return;
          } else {
            if (msg.type !== 'auth' || typeof msg.token !== 'string') {
              ws.close(4001, 'Authenticate first');
              return;
            }
            clearTimeout(authTimer);
            ws.authPromise = authenticate(ws, msg.token);
            if (!(await ws.authPromise)) ws.close(4003, 'Invalid token');
            return;
          }
        }
        if (ws.role === 'drone') await handleDroneMessage(ws, msg);
        // Viewers are receive-only; anything they send is ignored
      } catch (err) {
        console.error('WebSocket handler error:', err);
        send(ws, 'error', { message: 'Internal error' });
      }
    });

    ws.on('close', async () => {
      clearTimeout(authTimer);
      viewers.delete(ws);
      if (ws.role === 'drone' && droneSockets.get(ws.droneId) === ws) {
        droneSockets.delete(ws.droneId);
        try {
          const drone = await Drone.findByIdAndUpdate(ws.droneId, { status: 'offline' }, { returnDocument: 'after' });
          if (drone) broadcast('drone', drone);
        } catch (err) {
          console.error('Failed to mark drone offline:', err.message);
        }
      }
    });
  });

  // Write the latest telemetry for every drone that reported since the last flush
  async function flushTelemetry() {
    if (pending.size === 0) return;
    const batch = [...pending.entries()];
    pending.clear();
    const now = new Date();
    const ops = batch.map(([id, data]) => {
      const set = { lastSeenAt: now, 'telemetry.updatedAt': now };
      for (const [k, v] of Object.entries(data)) set[`telemetry.${k}`] = v;
      return { updateOne: { filter: { _id: id }, update: { $set: set } } };
    });
    await Drone.bulkWrite(ops, { ordered: false });
    broadcast('telemetry', batch.map(([id, data]) => ({ droneId: id, ...data, updatedAt: now })));
  }

  // Mark drones that went quiet without closing their socket as offline
  async function sweepOffline() {
    const cutoff = new Date(Date.now() - config.droneOfflineMs);
    const stale = await Drone.find({ status: { $ne: 'offline' }, lastSeenAt: { $lt: cutoff } });
    for (const drone of stale) {
      drone.status = 'offline';
      await drone.save();
      broadcast('drone', drone);
    }
  }

  const timers = [
    setInterval(() => flushTelemetry().catch((e) => console.error('Telemetry flush failed:', e.message)), FLUSH_MS),
    setInterval(() => sweepOffline().catch((e) => console.error('Offline sweep failed:', e.message)), SWEEP_MS),
    setInterval(() => {
      for (const ws of wss.clients) {
        if (!ws.isAlive) { ws.terminate(); continue; }
        ws.isAlive = false;
        ws.ping();
      }
    }, HEARTBEAT_MS),
  ];

  function disconnectDrone(droneId) {
    droneSockets.get(droneId)?.close(4003, 'Token revoked');
  }

  async function close() {
    timers.forEach(clearInterval);
    await flushTelemetry().catch(() => {});
    for (const ws of wss.clients) ws.terminate();
    await new Promise((resolve) => wss.close(resolve));
  }

  return { broadcast, disconnectDrone, flushTelemetry, close };
}

module.exports = { createRealtime };
