const express = require('express');
const router = express.Router();
const DownloadSession = require('../models/DownloadSession');

// Get all active downloads (for admin monitoring)
router.get('/downloads/active', async (req, res) => {
  try {
    const activeDownloads = await DownloadSession.find({ state: 'busy' })
      .populate('objectId')
      .sort({ startedAt: -1 });

    const formattedDownloads = activeDownloads.map(download => ({
      id: download._id,
      userId: download.userId,
      sessionId: download.sessionId,
      objectName: download.objectName,
      objectId: download.objectId._id,
      progress: download.progress,
      currentChunk: download.currentChunk,
      totalChunks: download.totalChunks,
      startedAt: download.startedAt,
      elapsedTime: Date.now() - download.startedAt.getTime()
    }));

    res.json(formattedDownloads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users and their download history
router.get('/users', async (req, res) => {
  try {
    const allSessions = await DownloadSession.find()
      .populate('objectId')
      .sort({ startedAt: -1 });

    // Group by userId
    const userMap = new Map();

    allSessions.forEach(session => {
      if (!userMap.has(session.userId)) {
        userMap.set(session.userId, {
          userId: session.userId,
          currentState: session.state,
          currentDownload: session.state === 'busy' ? {
            objectName: session.objectName,
            progress: session.progress,
            startedAt: session.startedAt
          } : null,
          downloadHistory: []
        });
      }

      const user = userMap.get(session.userId);
      user.downloadHistory.push({
        objectName: session.objectName,
        state: session.state,
        progress: session.progress,
        startedAt: session.startedAt,
        completedAt: session.completedAt
      });
    });

    const users = Array.from(userMap.values());
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
