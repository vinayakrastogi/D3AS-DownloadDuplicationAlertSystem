require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const sessionMiddleware = require('./middleware/sessionMiddleware');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const adminMonitorRoutes = require('./routes/adminMonitorRoutes');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  process.env.ADMIN_URL || "http://localhost:3001"
];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api', downloadRoutes);
app.use('/api/admin/monitor', adminMonitorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join admin room for monitoring
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin joined monitoring room');
  });

  // Join user room for progress updates
  socket.on('join-user', (sessionId) => {
    socket.join(`user-${sessionId}`);
    console.log(`User ${sessionId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Broadcast download progress updates
const broadcastDownloadProgress = (downloadSession) => {
  io.to('admin-room').emit('download-progress', {
    userId: downloadSession.userId,
    sessionId: downloadSession.sessionId,
    objectName: downloadSession.objectName,
    progress: downloadSession.progress,
    currentChunk: downloadSession.currentChunk,
    totalChunks: downloadSession.totalChunks
  });

  io.to(`user-${downloadSession.sessionId}`).emit('download-progress', {
    progress: downloadSession.progress,
    currentChunk: downloadSession.currentChunk,
    totalChunks: downloadSession.totalChunks
  });
};

app.set('broadcastProgress', broadcastDownloadProgress);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
