const { startDb, stopDb, clearDb, createUser } = require('./helpers');
const { describe, test, before, after, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const ai = require('../src/services/aiClient');
const { HttpError } = require('../src/middleware/errors');
const { createApp } = require('../src/app');

// Routes call ai.detect / ai.health through the module object, so replacing them stubs the AI service
const detect = mock.fn();
ai.detect = detect;
ai.health = async () => true;

const broadcast = mock.fn();
const app = createApp({ realtime: { broadcast, disconnectDrone() {} } });

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const image = (req) => req.attach('image', JPEG, { filename: 'f.jpg', contentType: 'image/jpeg' });
const aiResult = (detections) => ({ detections, image: { width: 640, height: 480 }, inference_ms: 42 });

before(startDb);
after(stopDb);
beforeEach(async () => {
  await clearDb();
  detect.mock.resetCalls();
  broadcast.mock.resetCalls();
});

describe('auth', () => {
  test('login returns a working JWT', async () => {
    await createUser('operator', 'pilot');
    const res = await request(app).post('/api/auth/login').send({ username: 'Pilot', password: 'correct-horse-battery' });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.username, 'pilot');
    assert.equal(res.body.user.role, 'operator');
    assert.equal(res.body.user.passwordHash, undefined);

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${res.body.token}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.user.username, 'pilot');
  });

  test('wrong password is rejected', async () => {
    await createUser('operator', 'pilot');
    const res = await request(app).post('/api/auth/login').send({ username: 'pilot', password: 'nope' });
    assert.equal(res.status, 401);
  });

  test('protected routes need a valid token', async () => {
    assert.equal((await request(app).get('/api/drones')).status, 401);
    assert.equal((await request(app).get('/api/drones').set('Authorization', 'Bearer forged')).status, 401);
  });

  test('a deleted user token stops working', async () => {
    const { user, auth } = await createUser('viewer');
    await user.deleteOne();
    assert.equal((await request(app).get('/api/drones').set(auth)).status, 401);
  });
});

describe('roles', () => {
  test('viewer can read but not write drones', async () => {
    const { auth } = await createUser('viewer');
    assert.equal((await request(app).get('/api/drones').set(auth)).status, 200);
    assert.equal((await request(app).post('/api/drones').set(auth).send({ name: 'X' })).status, 403);
  });

  test('only admins manage users', async () => {
    const op = await createUser('operator');
    assert.equal((await request(app).get('/api/users').set(op.auth)).status, 403);

    const admin = await createUser('admin');
    const created = await request(app).post('/api/users').set(admin.auth)
      .send({ username: 'newbie', password: 'a-long-password', role: 'viewer' });
    assert.equal(created.status, 201);
    const weak = await request(app).post('/api/users').set(admin.auth).send({ username: 'weak', password: 'short' });
    assert.equal(weak.status, 400);
  });

  test('admin cannot delete or demote themselves', async () => {
    const { user, auth } = await createUser('admin');
    assert.equal((await request(app).delete(`/api/users/${user.id}`).set(auth)).status, 400);
    assert.equal((await request(app).patch(`/api/users/${user.id}`).set(auth).send({ role: 'viewer' })).status, 400);
  });
});

describe('drones', () => {
  test('CRUD lifecycle', async () => {
    const { auth } = await createUser('admin');
    const created = await request(app).post('/api/drones').set(auth).send({ name: 'Pinaka 1', model: 'Quad X' });
    assert.equal(created.status, 201);
    assert.equal(created.body.drone.name, 'Pinaka 1');
    assert.equal(created.body.drone.status, 'offline');
    assert.equal(broadcast.mock.calls[0].arguments[0], 'drone');
    const id = created.body.drone.id;

    assert.equal((await request(app).post('/api/drones').set(auth).send({ name: 'Pinaka 1' })).status, 409);

    const patched = await request(app).patch(`/api/drones/${id}`).set(auth).send({ status: 'maintenance' });
    assert.equal(patched.body.drone.status, 'maintenance');
    assert.equal((await request(app).patch(`/api/drones/${id}`).set(auth).send({ status: 'flying' })).status, 400);

    assert.equal((await request(app).delete(`/api/drones/${id}`).set(auth)).status, 204);
    assert.equal((await request(app).get(`/api/drones/${id}`).set(auth)).status, 404);
    assert.equal((await request(app).get('/api/drones/not-an-id').set(auth)).status, 400);
  });

  test('unknown fields cannot be mass-assigned', async () => {
    const { auth } = await createUser('admin');
    const res = await request(app).post('/api/drones').set(auth).send({ name: 'D', tokenVersion: 99, status: 'active' });
    assert.equal(res.body.drone.status, 'offline');
    assert.equal(res.body.drone.tokenVersion, undefined);
  });

  test('device token is issued by admins only', async () => {
    const admin = await createUser('admin');
    const op = await createUser('operator');
    const { body } = await request(app).post('/api/drones').set(admin.auth).send({ name: 'D' });
    assert.equal((await request(app).post(`/api/drones/${body.drone.id}/token`).set(op.auth)).status, 403);
    const res = await request(app).post(`/api/drones/${body.drone.id}/token`).set(admin.auth);
    assert.equal(res.status, 200);
    assert.equal(typeof res.body.token, 'string');
  });
});

describe('detections and alerts', () => {
  test('stores detection and raises an alert for people', async () => {
    const { auth } = await createUser('operator');
    detect.mock.mockImplementation(async () => aiResult([
      { class_name: 'person', confidence: 0.9, bbox: [1, 2, 3, 4] },
      { class_name: 'dog', confidence: 0.95, bbox: [5, 6, 7, 8] },
    ]));

    const res = await image(request(app).post('/api/detections').set(auth).field('lat', '28.6').field('lng', '77.2'));
    assert.equal(res.status, 201);
    assert.equal(res.body.detection.objects.length, 2);
    assert.deepEqual(res.body.detection.location, { lat: 28.6, lng: 77.2 });
    assert.equal(res.body.alert.severity, 'high');
    assert.equal(res.body.alert.status, 'open');
    assert.equal(res.body.alert.message, 'Detected 1 person');
    assert.ok(broadcast.mock.calls.some((c) => c.arguments[0] === 'alert'));

    const list = await request(app).get('/api/detections').set(auth);
    assert.equal(list.body.detections.length, 1);

    const alerts = await request(app).get('/api/alerts?status=open').set(auth);
    assert.equal(alerts.body.alerts.length, 1);
    const alertId = alerts.body.alerts[0].id;
    const ack = await request(app).post(`/api/alerts/${alertId}/ack`).set(auth);
    assert.equal(ack.body.alert.status, 'acknowledged');
    assert.equal((await request(app).post(`/api/alerts/${alertId}/ack`).set(auth)).status, 409);
  });

  test('repeated sightings within the cooldown do not create duplicate alerts', async () => {
    const { auth } = await createUser('operator');
    detect.mock.mockImplementation(async () => aiResult([{ class_name: 'car', confidence: 0.6, bbox: [0, 0, 1, 1] }]));
    const first = await image(request(app).post('/api/detections').set(auth));
    const second = await image(request(app).post('/api/detections').set(auth));
    assert.ok(first.body.alert);
    assert.equal(second.body.alert, null);
    assert.equal((await request(app).get('/api/detections').set(auth)).body.detections.length, 2);
  });

  test('no alert when nothing of interest is detected', async () => {
    const { auth } = await createUser('operator');
    detect.mock.mockImplementation(async () => aiResult([{ class_name: 'cup', confidence: 0.99, bbox: [0, 0, 1, 1] }]));
    const res = await image(request(app).post('/api/detections').set(auth));
    assert.equal(res.status, 201);
    assert.equal(res.body.alert, null);
  });

  test('validates input before calling the AI service', async () => {
    const { auth } = await createUser('operator');
    assert.equal((await request(app).post('/api/detections').set(auth)).status, 400);
    const txt = await request(app).post('/api/detections').set(auth)
      .attach('image', Buffer.from('hi'), { filename: 'x.txt', contentType: 'text/plain' });
    assert.equal(txt.status, 415);
    const badDrone = await image(request(app).post('/api/detections').set(auth).field('droneId', '507f1f77bcf86cd799439011'));
    assert.equal(badDrone.status, 404);
    assert.equal(detect.mock.callCount(), 0);
  });

  test('viewers cannot run detections', async () => {
    const { auth } = await createUser('viewer');
    assert.equal((await image(request(app).post('/api/detections').set(auth))).status, 403);
  });

  test('AI outage maps to 503', async () => {
    const { auth } = await createUser('operator');
    detect.mock.mockImplementation(async () => { throw new HttpError(503, 'AI service unavailable'); });
    assert.equal((await image(request(app).post('/api/detections').set(auth))).status, 503);
  });
});

test('health reports mongo and ai status', async () => {
  const res = await request(app).get('/api/health');
  assert.deepEqual(res.body, { status: 'ok', mongo: true, ai: true });
});
