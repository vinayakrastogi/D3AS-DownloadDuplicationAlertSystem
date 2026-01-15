const express = require('express');
const router = express.Router();
const Object = require('../models/Object');
const DownloadSession = require('../models/DownloadSession');

// Get all objects (for client browsing)
router.get('/objects', async (req, res) => {
  try {
    const objects = await Object.find().sort({ createdAt: -1 });
    res.json(objects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent 10 objects
router.get('/objects/recent', async (req, res) => {
  try {
    const objects = await Object.find().sort({ createdAt: -1 }).limit(10);
    res.json(objects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search objects
router.get('/objects/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const objects = await Object.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ createdAt: -1 });
    res.json(objects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session ID
router.get('/session', (req, res) => {
  res.json({ sessionId: req.sessionID });
});

// Get user's current download status
router.get('/download/status', async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const downloadSession = await DownloadSession.findOne({
      sessionId,
      state: 'busy'
    }).populate('objectId');

    if (!downloadSession) {
      return res.json({ state: 'free', download: null });
    }

    res.json({
      state: 'busy',
      download: {
        id: downloadSession._id,
        objectId: downloadSession.objectId._id,
        objectName: downloadSession.objectName,
        progress: downloadSession.progress,
        currentChunk: downloadSession.currentChunk,
        totalChunks: downloadSession.totalChunks
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel download
router.post('/download/cancel', async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const downloadSession = await DownloadSession.findOneAndUpdate(
      { sessionId, state: 'busy' },
      { state: 'free', completedAt: Date.now() },
      { new: true }
    );

    if (!downloadSession) {
      return res.status(404).json({ error: 'No active download found' });
    }

    res.json({ message: 'Download cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
