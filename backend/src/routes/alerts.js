const express = require('express');
const { z } = require('zod');
const Alert = require('../models/Alert');
const { requireRole } = require('../middleware/auth');
const { HttpError } = require('../middleware/errors');

const router = express.Router();

const listSchema = z.object({
  status: z.enum(['open', 'acknowledged']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.coerce.date().optional(),
});

router.get('/', async (req, res) => {
  const { status, limit, before } = listSchema.parse(req.query);
  const filter = {};
  if (status) filter.status = status;
  if (before) filter.createdAt = { $lt: before };
  const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(limit);
  res.json({ alerts });
});

router.post('/:id/ack', requireRole('admin', 'operator'), async (req, res) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: req.params.id, status: 'open' },
    { status: 'acknowledged', acknowledgedBy: req.user._id, acknowledgedAt: new Date() },
    { returnDocument: 'after' },
  );
  if (!alert) {
    if (await Alert.exists({ _id: req.params.id })) throw new HttpError(409, 'Alert already acknowledged');
    throw new HttpError(404, 'Alert not found');
  }
  req.app.locals.realtime.broadcast('alert', alert);
  res.json({ alert });
});

module.exports = router;
