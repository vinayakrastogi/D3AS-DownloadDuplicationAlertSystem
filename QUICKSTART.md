# Quick Start Guide

## Prerequisites
- Node.js installed
- MongoDB running (local or remote)

## Step-by-Step Setup

### 1. Start MongoDB
Make sure MongoDB is running on your system.

### 2. Setup and Start Server
```bash
cd server
npm install
# Create .env file with:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/d3as
# SESSION_SECRET=your-secret-key
npm start
```

### 3. Setup and Start Client (in a new terminal)
```bash
cd client
npm install
npm start
```
Opens at http://localhost:3000

### 4. Setup and Start Admin Panel (in a new terminal)
```bash
cd admin
npm install
npm start
```
Opens at http://localhost:3001

## Testing the System

1. **As Admin:**
   - Go to http://localhost:3001
   - Create some objects with names and sizes (in MB)
   - Upload logos if desired
   - Switch to "User Monitoring" to see active downloads

2. **As Client:**
   - Go to http://localhost:3000
   - Browse or search for files
   - Click "Download" on a file
   - Watch the progress bar
   - Try to download another file while one is in progress - you'll see the error message

## How Downloads Work

- When you click "Download", the server sends numbers from 0 to (size * 1024)
- Each number is sent at 500ms intervals
- This simulates a real download without using actual bandwidth
- Progress is tracked in real-time via WebSockets

## Troubleshooting

- **MongoDB connection error**: Make sure MongoDB is running
- **Port already in use**: Change the PORT in server/.env
- **CORS errors**: Check that client and admin URLs match in server configuration
