/**
 * Cleanup script to remove stale/abandoned download sessions
 * Run this to fix any existing duplicate key errors or stale sessions
 * 
 * Usage: node scripts/cleanup-stale-downloads.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DownloadSession = require('../models/DownloadSession');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/d3as', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const cleanupStaleDownloads = async () => {
  try {
    await connectDB();

    // Find all busy downloads older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const staleDownloads = await DownloadSession.find({
      state: 'busy',
      $or: [
        { startedAt: { $lt: fiveMinutesAgo } },
        { updatedAt: { $lt: fiveMinutesAgo } }
      ]
    });

    console.log(`Found ${staleDownloads.length} stale download(s)`);

    if (staleDownloads.length > 0) {
      // Mark them as free
      const result = await DownloadSession.updateMany(
        {
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

      console.log(`Cleaned up ${result.modifiedCount} stale download(s)`);
    }

    // Also find and remove duplicate sessionIds (keep only the most recent busy one)
    const duplicates = await DownloadSession.aggregate([
      { $match: { state: 'busy' } },
      {
        $group: {
          _id: '$sessionId',
          count: { $sum: 1 },
          docs: { $push: '$$ROOT' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate sessionId(s) with busy state`);
      
      for (const dup of duplicates) {
        // Sort by startedAt, keep the most recent, mark others as free
        const sorted = dup.docs.sort((a, b) => 
          new Date(b.startedAt) - new Date(a.startedAt)
        );
        
        const toClean = sorted.slice(1); // All except the first (most recent)
        
        for (const doc of toClean) {
          await DownloadSession.findByIdAndUpdate(doc._id, {
            state: 'free',
            completedAt: Date.now()
          });
        }
        
        console.log(`Cleaned up ${toClean.length} duplicate(s) for sessionId: ${dup._id}`);
      }
    }

    console.log('Cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupStaleDownloads();
