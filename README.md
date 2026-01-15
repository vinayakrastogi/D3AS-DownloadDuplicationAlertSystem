# D3AS - Data Download Duplication Alert System

A system to prevent duplicate downloads per user, ensuring fair resource distribution and preventing DoS attacks.

## Features

- **Duplicate Download Prevention**: Users can only have one active download at a time
- **Real-time Progress Tracking**: Monitor download progress via WebSockets
- **Admin Panel**: Full CRUD operations for objects and user monitoring
- **Client Interface**: Search, browse, and download files with progress tracking
- **Session-based User Management**: Tracks users via express-session

## Project Structure

```
D3AS/
├── server/          # Node.js/Express backend
├── client/          # React client application
└── admin/           # React admin panel
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Setup Instructions

### 1. Server Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/d3as
SESSION_SECRET=your-secret-key-here
```

Start the server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:5000`

### 2. Client Setup

```bash
cd client
npm install
npm start
```

The client will run on `http://localhost:3000`

### 3. Admin Panel Setup

```bash
cd admin
npm install
npm start
```

The admin panel will run on `http://localhost:3001` (or next available port)

## How It Works

### Download Simulation

Instead of downloading actual files, the system simulates downloads by:
- Creating objects with a name and size (in MB)
- When a user initiates a download, the server sends numbers from 0 to (size * 1024)
- Each number is sent at 500ms intervals
- This demonstrates download behavior without using actual bandwidth or storage

### State Management

Each user has two states:
- **Free**: No download in progress
- **Busy**: Download in progress

When a user tries to download while another download is active, the server returns a 409 Conflict status with the message: "Another download already in progress"

### Session Management

- Users are tracked via `express-session` cookies
- Each session has a unique ID stored in the database
- Download sessions are linked to user sessions

## API Endpoints

### Client Endpoints

- `GET /api/client/objects` - Get all objects
- `GET /api/client/objects/recent` - Get recent 10 objects
- `GET /api/client/objects/search?q=query` - Search objects
- `GET /api/client/download/status` - Get current download status
- `POST /api/client/download/cancel` - Cancel current download

### Download Endpoints

- `POST /api/download/init` - Initialize a download
- `GET /api/download/stream/:downloadId` - Stream download data

### Admin Endpoints

- `GET /api/admin/objects` - Get all objects
- `GET /api/admin/objects/:id` - Get single object
- `POST /api/admin/objects` - Create object
- `PUT /api/admin/objects/:id` - Update object
- `DELETE /api/admin/objects/:id` - Delete object
- `GET /api/admin/monitor/downloads/active` - Get active downloads
- `GET /api/admin/monitor/users` - Get all users and their status

## Usage

### As a Client

1. Open the client application
2. Browse or search for files
3. Click "Download" on any file
4. Monitor progress in real-time
5. If you try to download another file while one is in progress, you'll see an error message

### As an Admin

1. Open the admin panel
2. **Objects Management**: Create, edit, or delete objects
   - Add name and size (in MB)
   - Upload a logo image
3. **User Monitoring**: View all active downloads and user statuses
   - See real-time progress updates
   - Monitor which users are downloading what

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Socket.io, express-session
- **Frontend**: React, Axios, Socket.io-client
- **Database**: MongoDB (Mongoose)

## Notes

- The system uses session-based authentication (no password required for admin)
- Logos are stored as base64 strings in the database
- Download progress is broadcast in real-time via WebSockets
- The system prevents DoS attacks by limiting one download per user session
