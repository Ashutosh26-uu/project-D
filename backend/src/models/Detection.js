const mongoose = require('mongoose');

const objectSchema = new mongoose.Schema({
  className: String,
  confidence: Number,
  bbox: [Number], // [x1, y1, x2, y2] in source-image pixels
}, { _id: false });

const detectionSchema = new mongoose.Schema({
  drone: { type: mongoose.Schema.Types.ObjectId, ref: 'Drone', default: null, index: true },
  objects: [objectSchema],
  imageSize: { width: Number, height: Number },
  inferenceMs: Number,
  location: { lat: Number, lng: Number },
  source: { type: String, enum: ['upload', 'video', 'drone'], default: 'upload' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });

detectionSchema.index({ createdAt: -1 });

detectionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Detection', detectionSchema);
