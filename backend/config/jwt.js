const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload, expiresIn = '7d') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'your-app-name', // Optional: add your app name
    audience: 'your-app-users' // Optional: specify audience
  });
};

// Verify JWT token
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate refresh token (optional - for better security)
const generateRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d', // Longer expiration for refresh token
    issuer: 'your-app-name',
    audience: 'your-app-users'
  });
};

// Verify refresh token (optional)
const verifyRefreshToken = (token) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }
  
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken
};