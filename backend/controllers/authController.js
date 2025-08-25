const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');

// Helper function to get device info
const getDeviceInfo = (req) => {
  return {
    userAgent: req.get('User-Agent') || 'Unknown',
    ip: req.ip || req.connection.remoteAddress || 'Unknown',
    deviceType: req.get('User-Agent')?.includes('Mobile') ? 'Mobile' : 'Desktop'
  };
};

// Register user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate tokens
    const token = generateToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Calculate expiration dates
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store tokens in database
    await user.addToken({
      token,
      refreshToken,
      deviceInfo: getDeviceInfo(req),
      expiresAt: tokenExpiresAt,
      refreshExpiresAt: refreshExpiresAt
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
        expiresAt: tokenExpiresAt,
        refreshExpiresAt: refreshExpiresAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Clean expired tokens
    await user.cleanExpiredTokens();

    // Generate new tokens
    const token = generateToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Calculate expiration dates
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store tokens in database
    await user.addToken({
      token,
      refreshToken,
      deviceInfo: getDeviceInfo(req),
      expiresAt: tokenExpiresAt,
      refreshExpiresAt: refreshExpiresAt
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
        expiresAt: tokenExpiresAt,
        refreshExpiresAt: refreshExpiresAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Refresh token endpoint
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in database
    const tokenDoc = user.findToken(refreshToken);
    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found or expired'
      });
    }

    // Check if refresh token is expired
    if (tokenDoc.refreshExpiresAt < new Date()) {
      await user.removeToken(refreshToken);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    // Remove old token
    await user.removeToken(refreshToken);

    // Generate new tokens
    const newToken = generateToken({ id: user._id });
    const newRefreshToken = generateRefreshToken({ id: user._id });

    // Calculate expiration dates
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store new tokens
    await user.addToken({
      token: newToken,
      refreshToken: newRefreshToken,
      deviceInfo: getDeviceInfo(req),
      expiresAt: tokenExpiresAt,
      refreshExpiresAt: refreshExpiresAt
    });

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: tokenExpiresAt,
        refreshExpiresAt: refreshExpiresAt
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    // Update token activity
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      await req.user.updateTokenActivity(token);
    }

    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Logout user (invalidate current token)
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      await req.user.removeToken(token);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Logout from all devices
const logoutAll = async (req, res) => {
  try {
    await req.user.removeAllTokens();

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active sessions
const getActiveSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('tokens');
    
    const activeSessions = user.tokens
      .filter(token => token.isActive && token.expiresAt > new Date())
      .map(token => ({
        id: token._id,
        deviceInfo: token.deviceInfo,
        createdAt: token.createdAt,
        lastUsed: token.lastUsed || token.createdAt,
        expiresAt: token.expiresAt
      }));

    res.json({
      success: true,
      data: {
        sessions: activeSessions,
        total: activeSessions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Revoke specific session
const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = await User.findById(req.user._id);
    
    user.tokens = user.tokens.filter(token => token._id.toString() !== sessionId);
    await user.save();

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  logoutAll,
  getActiveSessions,
  revokeSession
};