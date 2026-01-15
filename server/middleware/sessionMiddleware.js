const session = require('express-session');

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'd3as-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

module.exports = session(sessionConfig);
