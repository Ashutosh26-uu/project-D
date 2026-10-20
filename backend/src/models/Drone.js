const mongoose = require('mongoose');

const STATUSES = ['offline', 'idle', 'active', 'returning', 'maintenance'];

const droneSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 64 },
  model: { type: String, trim: true, maxlength: 64, default: '' },
  status: { type: String, enum: STATUSES, default: 'offline' },
  telemetry: {
    battery: Number,
    altitude: Number,
    speed: Number,
    heading: Number,
    signal: Number,
    lat: Number,
    lng: Number,
    updatedAt: Date,
  },
  lastSeenAt: Date,
  // Bumped to revoke all device tokens issued for this drone
  tokenVersion: { type: Number, default: 0, select: false },
}, { timestamps: true });

droneSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.tokenVersion;
    return ret;
  },
});

module.exports = mongoose.model('Drone', droneSchema);
module.exports.STATUSES = STATUSES;
