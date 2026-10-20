const { startDb, stopDb, clearDb, createUser } = require('./helpers');
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const WebSocket = require('ws');
const Drone = require('../src/models/Drone');
const { createApp } = require('../src/app');
const { createRealtime } = require('../src/realtime');
const { signDroneToken } = require('../src/middleware/auth');

let server;
let realtime;
let url;

before(async () => {
  await startDb();
  const app = createApp();
  server = http.createServer(app);
  realtime = createRealtime(server);
  app.locals.realtime = realtime;
  await new Promise((resolve) => server.listen(0, resolve));
  url = `ws://127.0.0.1:${server.address().port}/ws`;
});

after(async () => {
  await realtime.close();
  await new Promise((resolve) => server.close(resolve));
  await stopDb();
});

beforeEach(clearDb);

// Connects, authenticates and collects every message the socket receives
function connect(token) {
  const ws = new WebSocket(url);
  ws.messages = [];
  ws.on('message', (m) => ws.messages.push(JSON.parse(m)));
  ws.ready = new Promise((resolve, reject) => {
    ws.on('open', () => ws.send(JSON.stringify({ type: 'auth', token })));
    ws.on('message', (m) => { if (JSON.parse(m).type === 'ready') resolve(); });
    ws.on('close', (code) => reject(new Error(`closed ${code}`)));
  });
  ws.ready.catch(() => {});
  return ws;
}

async function waitFor(fn, timeout = 4000) {
  const start = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() - start > timeout) throw new Error('timed out');
    await new Promise((r) => setTimeout(r, 50));
  }
}

test('drone telemetry reaches viewers and is persisted', async () => {
  const { token } = await createUser('viewer');
  const drone = await Drone.create({ name: 'D1' });
  const viewer = connect(token);
  await viewer.ready;

  const device = connect(signDroneToken(drone, 0));
  await device.ready;
  device.send(JSON.stringify({ type: 'telemetry', data: { battery: 80, lat: 28.6, lng: 77.2 } }));
  device.send(JSON.stringify({ type: 'telemetry', data: { battery: 79 } }));

  // Both samples are coalesced into a single broadcast
  const msg = await waitFor(() => viewer.messages.find((m) => m.type === 'telemetry'));
  assert.equal(msg.payload.length, 1);
  assert.equal(msg.payload[0].droneId, drone.id);
  assert.equal(msg.payload[0].battery, 79);
  assert.equal(msg.payload[0].lat, 28.6);

  const stored = await Drone.findById(drone.id);
  assert.equal(stored.telemetry.battery, 79);
  assert.equal(stored.status, 'idle');

  device.close();
  await waitFor(async () => (await Drone.findById(drone.id)).status === 'offline');
  assert.ok(viewer.messages.some((m) => m.type === 'drone' && m.payload.status === 'offline'));
  viewer.close();
});

test('invalid telemetry is rejected without closing the socket', async () => {
  const drone = await Drone.create({ name: 'D2' });
  const device = connect(signDroneToken(drone, 0));
  await device.ready;
  device.send(JSON.stringify({ type: 'telemetry', data: { battery: 500 } }));
  await waitFor(() => device.messages.find((m) => m.type === 'error'));
  assert.equal(device.readyState, WebSocket.OPEN);
  device.close();
});

test('revoked drone tokens and bad tokens are refused', async () => {
  const drone = await Drone.create({ name: 'D3', tokenVersion: 2 });
  await assert.rejects(connect(signDroneToken(drone, 1)).ready, /closed 4003/);
  await assert.rejects(connect('not-a-token').ready, /closed 4003/);
});

test('unauthenticated messages close the connection', async () => {
  const ws = new WebSocket(url);
  const closed = new Promise((resolve) => ws.on('close', resolve));
  ws.on('open', () => ws.send(JSON.stringify({ type: 'telemetry', data: {} })));
  assert.equal(await closed, 4001);
});
