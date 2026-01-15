import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

// Configure axios to include credentials for session cookies
axios.defaults.withCredentials = true;

function App() {
  const [objects, setObjects] = useState([]);
  const [recentObjects, setRecentObjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentDownload, setCurrentDownload] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      withCredentials: true
    });

    newSocket.on('connect', async () => {
      console.log('Connected to server');
      // Get session ID and join user room
      try {
        const response = await axios.get(`${API_BASE_URL}/client/session`, {
          withCredentials: true
        });
        newSocket.emit('join-user', response.data.sessionId);
      } catch (error) {
        console.error('Error getting session ID:', error);
        // Fallback to socket ID
        newSocket.emit('join-user', newSocket.id);
      }
    });

    newSocket.on('download-progress', (data) => {
      setDownloadProgress(data.progress);
    });

    setSocket(newSocket);

    // Load recent objects
    loadRecentObjects();
    // Check current download status
    checkDownloadStatus();

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchObjects();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadRecentObjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/client/objects/recent`);
      setRecentObjects(response.data);
    } catch (error) {
      console.error('Error loading recent objects:', error);
    }
  };

  const searchObjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/client/objects/search`, {
        params: { q: searchQuery }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching objects:', error);
    }
  };

  const checkDownloadStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/client/download/status`, {
        withCredentials: true
      });
      if (response.data.state === 'busy') {
        setCurrentDownload(response.data.download);
        setDownloadProgress(response.data.download.progress);
      }
    } catch (error) {
      console.error('Error checking download status:', error);
    }
  };

  const handleDownload = async (objectId, objectName) => {
    try {
      setError(null);
      
      // Initialize download
      const initResponse = await axios.post(
        `${API_BASE_URL}/download/init`,
        { objectId },
        { withCredentials: true }
      );

      const { downloadId, totalChunks } = initResponse.data;
      
      setCurrentDownload({
        id: downloadId,
        objectId,
        objectName,
        totalChunks
      });
      setDownloadProgress(0);

      // Start streaming download
      const response = await fetch(`${API_BASE_URL}/download/stream/${downloadId}`, {
        credentials: 'include'
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const readStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              setDownloadProgress(data.progress);
              
              if (data.complete) {
                setCurrentDownload(null);
                setDownloadProgress(0);
                loadRecentObjects();
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      };

      readStream().catch(error => {
        console.error('Download error:', error);
        setError('Download failed. Please try again.');
        setCurrentDownload(null);
        setDownloadProgress(0);
      });

    } catch (error) {
      if (error.response?.status === 409) {
        setError('Another download already in progress. Complete it or cancel it to download something else.');
      } else {
        setError(error.response?.data?.error || 'Failed to start download');
      }
    }
  };

  const handleCancelDownload = async () => {
    try {
      await axios.post(`${API_BASE_URL}/client/download/cancel`, {}, {
        withCredentials: true
      });
      setCurrentDownload(null);
      setDownloadProgress(0);
      setError(null);
    } catch (error) {
      console.error('Error cancelling download:', error);
    }
  };

  const formatSize = (size) => {
    if (size >= 1024) {
      return `${(size / 1024).toFixed(2)} GB`;
    }
    return `${size.toFixed(2)} MB`;
  };

  const displayObjects = searchQuery.trim() ? searchResults : recentObjects;

  return (
    <div className="App">
      <header className="App-header">
        <h1>D3AS - Data Download System</h1>
        <p>Download files with duplicate prevention</p>
      </header>

      <main className="App-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {currentDownload && (
          <div className="download-status">
            <h3>Download in Progress</h3>
            <p><strong>{currentDownload.objectName}</strong></p>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
            <p>{downloadProgress}% complete</p>
            <button onClick={handleCancelDownload} className="cancel-btn">
              Cancel Download
            </button>
          </div>
        )}

        <div className="search-section">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="objects-section">
          <h2>{searchQuery.trim() ? 'Search Results' : 'Recent Files'}</h2>
          {displayObjects.length === 0 ? (
            <p className="no-results">No files found</p>
          ) : (
            <div className="objects-grid">
              {displayObjects.map((obj) => (
                <div key={obj._id} className="object-card">
                  {obj.logo && (
                    <div className="object-logo">
                      <img 
                        src={obj.logo.startsWith('data:') ? obj.logo : `data:image/png;base64,${obj.logo}`} 
                        alt={obj.name}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="object-info">
                    <h3>{obj.name}</h3>
                    <p className="object-size">Size: {formatSize(obj.size)}</p>
                    <button
                      onClick={() => handleDownload(obj._id, obj.name)}
                      className="download-btn"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
