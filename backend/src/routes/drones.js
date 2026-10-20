const express = require('express');
const { z } = require('zod');
const Drone = require('../models/Drone');
const { requireRole, signDroneToken } = require('../middleware/auth');
const { HttpError } = require('../middleware/errors');

const router = express.Router();

const createSchema = z.object({
  name: z.string().trim().min(1).max(64),
  model: z.string().trim().max(64).optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(64).optional(),
  model: z.string().trim().max(64).optional(),
  status: z.enum(Drone.STATUSES).optional(),
});

router.get('/', async (req, res) => {
  res.json({ drones: await Drone.find().sort({ name: 1 }) });
});

router.get('/:id', async (req, res) => {
  const drone = await Drone.findById(req.params.id);
  if (!drone) throw new HttpError(404, 'Drone not found');
  res.json({ drone });
});

router.post('/', requireRole('admin', 'operator'), async (req, res) => {
  const drone = await Drone.create(createSchema.parse(req.body));
  req.app.locals.realtime.broadcast('drone', drone);
  res.status(201).json({ drone });
});

router.patch('/:id', requireRole('admin', 'operator'), async (req, res) => {
  const drone = await Drone.findByIdAndUpdate(req.params.id, updateSchema.parse(req.body), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!drone) throw new HttpError(404, 'Drone not found');
  req.app.locals.realtime.broadcast('drone', drone);
  res.json({ drone });
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  const drone = await Drone.findByIdAndDelete(req.params.id);
  if (!drone) throw new HttpError(404, 'Drone not found');
  req.app.locals.realtime.disconnectDrone(drone.id);
  req.app.locals.realtime.broadcast('drone_removed', { id: drone.id });
  res.status(204).end();
});

// Issue a new device token; all previously issued tokens for this drone stop working
router.post('/:id/token', requireRole('admin'), async (req, res) => {
  const drone = await Drone.findByIdAndUpdate(req.params.id, { $inc: { tokenVersion: 1 } }, { returnDocument: 'after' })
    .select('+tokenVersion');
  if (!drone) throw new HttpError(404, 'Drone not found');
  req.app.locals.realtime.disconnectDrone(drone.id);
  res.json({ token: signDroneToken(drone, drone.tokenVersion) });
});

module.exports = router;
