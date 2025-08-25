const { verifyToken, verifyRefreshToken } = require('../config/jwt');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    // Find user and check if token exists in database
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // Check if token exists in user's token array (important for revocation)
    const tokenDoc = user.findToken(token);
    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked or expired'
      });
    }

    // Check if token is expired (double check with database)
    if (tokenDoc.expiresAt < new Date()) {
      // Clean up expired token
      await user.removeToken(token);
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    // Clean expired tokens periodically (optional optimization)
    if (Math.random() < 0.1) { // 10% chance to clean expired tokens
      user.cleanExpiredTokens().catch(err => console.error('Token cleanup error:', err));
    }

    req.user = user;
    req.currentToken = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Optional middleware for refresh token validation
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token or user not found'
      });
    }

    // Check if refresh token exists in database
    const tokenDoc = user.findToken(refreshToken);
    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found or has been revoked'
      });
    }

    // Check if refresh token is expired
    if (tokenDoc.refreshExpiresAt < new Date()) {
      // Clean up expired token
      await user.removeToken(refreshToken);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Refresh token validation error'
    });
  }
};

// Middleware to check if user is not locked
const checkAccountLock = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+loginAttempts +lockUntil');
    
    if (user && user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking account status'
    });
  }
};

module.exports = {
  authenticateToken,
  validateRefreshToken,
  checkAccountLock
};

// For backward compatibility
module.exports.default = authenticateToken;