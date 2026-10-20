const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const config = require('../config');
const Detection = require('../models/Detection');
const Drone = require('../models/Drone');
const Alert = require('../models/Alert');
const ai = require('../services/aiClient');
const alertRules = require('../services/alertRules');
const { requireRole } = require('../middleware/auth');
const { HttpError } = require('../middleware/errors');

const router = express.Router();

// Images stay in memory: they are forwarded to the AI service and never written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxImageBytes, files: 1 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|bmp)$/.test(file.mimetype)) cb(null, true);
    else cb(new HttpError(415, 'Only JPEG, PNG, WebP or BMP images are accepted'));
  },
});

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

const createSchema = z.object({
  droneId: objectId.optional(),
  source: z.enum(['upload', 'video', 'drone']).default('upload'),
  confidence: z.coerce.number().min(0.05).max(0.95).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

const listSchema = z.object({
  droneId: objectId.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  before: z.coerce.date().optional(), // cursor: createdAt of the last item on the previous page
});

router.post('/', requireRole('admin', 'operator'), upload.single('image'), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'An image file is required (field "image")');
  const input = createSchema.parse(req.body);

  let drone = null;
  if (input.droneId) {
    drone = await Drone.findById(input.droneId);
    if (!drone) throw new HttpError(404, 'Drone not found');
  }

  const result = await ai.detect(req.file, { confidence: input.confidence });

  const location = input.lat !== undefined && input.lng !== undefined
    ? { lat: input.lat, lng: input.lng }
    : drone?.telemetry?.lat !== undefined ? { lat: drone.telemetry.lat, lng: drone.telemetry.lng } : undefined;

  const detection = await Detection.create({
    drone: drone?._id ?? null,
    objects: result.detections.map((d) => ({ className: d.class_name, confidence: d.confidence, bbox: d.bbox })),
    imageSize: result.image,
    inferenceMs: result.inference_ms,
    location,
    source: input.source,
    createdBy: req.user._id,
  });

  const realtime = req.app.locals.realtime;
  realtime.broadcast('detection', detection);

  let alert = null;
  const rule = alertRules.evaluate(detection.objects);
  // Video mode sends a frame every second; don't raise the same alert for every frame
  const duplicate = rule && await Alert.exists({
    drone: detection.drone,
    status: 'open',
    classes: { $all: rule.classes, $size: rule.classes.length },
    createdAt: { $gte: new Date(Date.now() - config.alerts.cooldownMs) },
  });
  if (rule && !duplicate) {
    alert = await Alert.create({ ...rule, drone: detection.drone, detection: detection._id });
    realtime.broadcast('alert', alert);
  }

  res.status(201).json({ detection, alert });
});

router.get('/', async (req, res) => {
  const { droneId, limit, before } = listSchema.parse(req.query);
  const filter = {};
  if (droneId) filter.drone = droneId;
  if (before) filter.createdAt = { $lt: before };
  const detections = await Detection.find(filter).sort({ createdAt: -1 }).limit(limit);
  res.json({ detections });
});

module.exports = router;
