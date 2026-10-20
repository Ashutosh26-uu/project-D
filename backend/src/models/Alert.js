const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  drone: { type: mongoose.Schema.Types.ObjectId, ref: 'Drone', default: null },
  detection: { type: mongoose.Schema.Types.ObjectId, ref: 'Detection', required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  message: { type: String, required: true },
  classes: [String],
  status: { type: String, enum: ['open', 'acknowledged'], default: 'open', index: true },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  acknowledgedAt: Date,
}, { timestamps: true });

alertSchema.index({ createdAt: -1 });

alertSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Alert', alertSchema);
