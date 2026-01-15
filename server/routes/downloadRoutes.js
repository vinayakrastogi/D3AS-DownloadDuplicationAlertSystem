const express = require('express');
const router = express.Router();
const Object = require('../models/Object');
const DownloadSession = require('../models/DownloadSession');

// Initialize download - check if user can download
router.post('/download/init', async (req, res) => {
  try {
    const { objectId } = req.body;
    const sessionId = req.sessionID;
    const userId = req.ip || req.sessionID;

    if (!objectId) {
      return res.status(400).json({ error: 'Object ID is required' });
    }

    // Clean up any stale/abandoned downloads for this session
    // (downloads that are marked busy but haven't been updated in 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await DownloadSession.updateMany(
      {
        sessionId,
        state: 'busy',
        $or: [
          { startedAt: { $lt: fiveMinutesAgo } },
          { updatedAt: { $lt: fiveMinutesAgo } }
        ]
      },
      {
        state: 'free',
        completedAt: Date.now()
      }
    );

    // Check if user already has an active download
    const activeDownload = await DownloadSession.findOne({
      sessionId,
      state: 'busy'
    });

    if (activeDownload) {
      return res.status(409).json({
        error: 'Another download already in progress',
        currentDownload: {
          objectName: activeDownload.objectName,
          progress: activeDownload.progress
        }
      });
    }

    // Get object details
    const object = await Object.findById(objectId);
    if (!object) {
      return res.status(404).json({ error: 'Object not found' });
    }

    // Calculate total chunks (size * 1024)
    const totalChunks = Math.floor(object.size * 1024);

    // Create download session
    const downloadSession = new DownloadSession({
      sessionId,
      userId,
      objectId: object._id,
      objectName: object.name,
      state: 'busy',
      totalChunks,
      currentChunk: 0,
      progress: 0
    });

    await downloadSession.save();

    res.json({
      message: 'Download started',
      downloadId: downloadSession._id,
      objectName: object.name,
      totalChunks
    });
  } catch (error) {
    // Handle duplicate key error (shouldn't happen now, but just in case)
    if (error.code === 11000) {
      // Clean up any stale sessions and retry once
      await DownloadSession.updateMany(
        { sessionId, state: 'busy' },
        { state: 'free', completedAt: Date.now() }
      );
      
      // Get object details again for retry
      const object = await Object.findById(req.body.objectId);
      if (!object) {
        return res.status(404).json({ error: 'Object not found' });
      }
      
      const totalChunks = Math.floor(object.size * 1024);
      
      // Try creating again
      try {
        const downloadSession = new DownloadSession({
          sessionId,
          userId,
          objectId: object._id,
          objectName: object.name,
          state: 'busy',
          totalChunks,
          currentChunk: 0,
          progress: 0
        });
        await downloadSession.save();
        
        return res.json({
          message: 'Download started',
          downloadId: downloadSession._id,
          objectName: object.name,
          totalChunks
        });
      } catch (retryError) {
        return res.status(500).json({ error: 'Failed to start download. Please try again.' });
      }
    }
    res.status(500).json({ error: error.message });
  }
});

// Stream download data
router.get('/download/stream/:downloadId', async (req, res) => {
  try {
    const { downloadId } = req.params;
    const sessionId = req.sessionID;

    const downloadSession = await DownloadSession.findById(downloadId);
    
    if (!downloadSession) {
      return res.status(404).json({ error: 'Download session not found' });
    }

    if (downloadSession.sessionId !== sessionId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    if (downloadSession.state !== 'busy') {
      return res.status(400).json({ error: 'Download session is not active' });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const totalChunks = downloadSession.totalChunks;
    let currentChunk = downloadSession.currentChunk;

    // Send chunks at 500ms intervals
    const interval = setInterval(async () => {
      if (currentChunk >= totalChunks) {
        clearInterval(interval);
        
        // Mark download as complete
        await DownloadSession.findByIdAndUpdate(downloadId, {
          state: 'free',
          progress: 100,
          currentChunk: totalChunks,
          completedAt: Date.now()
        });

        res.write(JSON.stringify({ 
          chunk: currentChunk, 
          total: totalChunks, 
          progress: 100,
          complete: true 
        }) + '\n');
        res.end();
        return;
      }

      const progress = Math.floor((currentChunk / totalChunks) * 100);
      
      // Update progress in database
      const updatedSession = await DownloadSession.findByIdAndUpdate(downloadId, {
        currentChunk,
        progress
      }, { new: true });

      // Broadcast progress via Socket.io
      const io = req.app.get('io');
      const broadcastProgress = req.app.get('broadcastProgress');
      if (io && broadcastProgress && updatedSession) {
        broadcastProgress(updatedSession);
      }

      res.write(JSON.stringify({ 
        chunk: currentChunk, 
        total: totalChunks, 
        progress 
      }) + '\n');

      currentChunk++;
    }, 500);

    // Handle client disconnect
    req.on('close', async () => {
      clearInterval(interval);
      await DownloadSession.findByIdAndUpdate(downloadId, {
        state: 'free',
        completedAt: Date.now()
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
