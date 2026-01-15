import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './UserMonitoring.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

function UserMonitoring() {
  const [activeDownloads, setActiveDownloads] = useState([]);
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Admin connected to server');
      // Join admin room for monitoring
      newSocket.emit('join-admin');
    });

    newSocket.on('download-progress', (data) => {
      // Update active downloads in real-time
      loadActiveDownloads();
    });

    setSocket(newSocket);

    // Load initial data
    loadActiveDownloads();
    loadUsers();

    // Refresh data every 2 seconds
    const interval = setInterval(() => {
      loadActiveDownloads();
      loadUsers();
    }, 2000);

    return () => {
      clearInterval(interval);
      newSocket.close();
    };
  }, []);

  const loadActiveDownloads = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/monitor/downloads/active`);
      setActiveDownloads(response.data);
    } catch (error) {
      console.error('Error loading active downloads:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/monitor/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="user-monitoring">
      <h2>User Monitoring</h2>

      <div className="monitoring-sections">
        <div className="section">
          <h3>Active Downloads</h3>
          {activeDownloads.length === 0 ? (
            <div className="empty-state">
              <p>No active downloads</p>
            </div>
          ) : (
            <div className="downloads-list">
              {activeDownloads.map((download) => (
                <div key={download.id} className="download-card">
                  <div className="download-header">
                    <div>
                      <strong>{download.objectName}</strong>
                      <p className="user-info">User: {download.userId}</p>
                    </div>
                    <div className="progress-info">
                      <span>{download.progress}%</span>
                    </div>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${download.progress}%` }}
                    ></div>
                  </div>
                  <div className="download-details">
                    <p>Chunks: {download.currentChunk} / {download.totalChunks}</p>
                    <p>Elapsed: {formatTime(download.elapsedTime)}</p>
                    <p>Started: {new Date(download.startedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <h3>All Users</h3>
          {users.length === 0 ? (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          ) : (
            <div className="users-list">
              {users.map((user, index) => (
                <div key={index} className="user-card">
                  <div className="user-header">
                    <strong>User ID: {user.userId}</strong>
                    <span className={`status-badge ${user.currentState === 'busy' ? 'busy' : 'free'}`}>
                      {user.currentState === 'busy' ? 'Busy' : 'Free'}
                    </span>
                  </div>
                  {user.currentDownload && (
                    <div className="current-download">
                      <p><strong>Downloading:</strong> {user.currentDownload.objectName}</p>
                      <div className="progress-bar-container small">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${user.currentDownload.progress}%` }}
                        ></div>
                      </div>
                      <p>{user.currentDownload.progress}% - Started: {new Date(user.currentDownload.startedAt).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="download-history">
                    <p><strong>Total Downloads:</strong> {user.downloadHistory.length}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserMonitoring;
