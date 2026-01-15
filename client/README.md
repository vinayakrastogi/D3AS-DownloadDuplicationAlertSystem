# D3AS Client

React client application for downloading files.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Features

- Browse recent files
- Search for files
- Download files with progress tracking
- Real-time progress updates via WebSockets
- Error handling for concurrent download attempts

## Environment Variables

Create `.env` file if needed:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```
