import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ObjectsManagement from './components/ObjectsManagement';
import UserMonitoring from './components/UserMonitoring';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="admin-nav">
          <div className="nav-container">
            <h1>D3AS Admin Panel</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">Objects Management</Link>
              <Link to="/monitoring" className="nav-link">User Monitoring</Link>
            </div>
          </div>
        </nav>

        <main className="admin-main">
          <Routes>
            <Route path="/" element={<ObjectsManagement />} />
            <Route path="/monitoring" element={<UserMonitoring />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
