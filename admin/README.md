# D3AS Admin Panel

React admin panel for managing objects and monitoring users.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The admin panel will open at `http://localhost:3001` (or next available port)

## Features

### Objects Management
- Create new objects (name, size, logo)
- Edit existing objects
- Delete objects
- View all objects in a table

### User Monitoring
- View all active downloads in real-time
- Monitor user states (free/busy)
- See download progress and statistics
- View user download history

## Environment Variables

Create `.env` file if needed:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```
