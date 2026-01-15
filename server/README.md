# D3AS Server

Backend server for the Data Download Duplication Alert System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/d3as
SESSION_SECRET=your-secret-key-here
```

3. Make sure MongoDB is running

4. Start the server:
```bash
npm start
# or
npm run dev  # with nodemon for auto-reload
```

## API Routes

- `/api/health` - Health check
- `/api/admin/*` - Admin routes (CRUD for objects)
- `/api/client/*` - Client routes (browse, search, download status)
- `/api/download/*` - Download routes (init, stream)
- `/api/admin/monitor/*` - Monitoring routes (active downloads, users)

## Socket.io Events

- `join-admin` - Join admin monitoring room
- `join-user` - Join user progress room
- `download-progress` - Real-time download progress updates
