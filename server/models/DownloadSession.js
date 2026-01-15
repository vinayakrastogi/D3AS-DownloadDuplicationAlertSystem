const mongoose = require('mongoose');

const downloadSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String, // IP address or session identifier
    required: true
  },
  objectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Object',
    required: true
  },
  objectName: {
    type: String,
    required: true
  },
  state: {
    type: String,
    enum: ['free', 'busy'],
    default: 'free'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalChunks: {
    type: Number,
    required: true
  },
  currentChunk: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Compound index for efficient queries: sessionId + state
downloadSessionSchema.index({ sessionId: 1, state: 1 });

module.exports = mongoose.model('DownloadSession', downloadSessionSchema);
