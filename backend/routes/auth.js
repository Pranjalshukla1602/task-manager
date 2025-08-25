const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  refreshToken, 
  logout, 
  logoutAll, 
  getActiveSessions, 
  revokeSession 
} = require('../controllers/authController');
const { 
  validateRegister, 
  validateLogin, 
  validateRefreshToken 
} = require('../utils/validators');
const { 
  authenticateToken, 
  validateRefreshToken: validateRefreshTokenMiddleware,
  checkAccountLock 
} = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, checkAccountLock, validateLogin, login);
router.post('/refresh', validateRefreshToken, validateRefreshTokenMiddleware, refreshToken);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.get('/sessions', authenticateToken, getActiveSessions);
router.delete('/sessions/:sessionId', authenticateToken, revokeSession);

module.exports = router;