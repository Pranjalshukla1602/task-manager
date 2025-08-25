const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    deviceType: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  refreshExpiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tokens: [tokenSchema],
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add token to user
userSchema.methods.addToken = function(tokenData) {
  // Remove expired tokens first
  this.tokens = this.tokens.filter(token => 
    token.isActive && token.expiresAt > new Date()
  );
  
  // Limit concurrent sessions (optional)
  const maxSessions = parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 5;
  if (this.tokens.length >= maxSessions) {
    // Remove oldest token
    this.tokens.sort((a, b) => a.createdAt - b.createdAt);
    this.tokens.shift();
  }
  
  this.tokens.push(tokenData);
  return this.save();
};

// Remove token (for logout)
userSchema.methods.removeToken = function(tokenToRemove) {
  this.tokens = this.tokens.filter(token => 
    token.token !== tokenToRemove && token.refreshToken !== tokenToRemove
  );
  return this.save();
};

// Remove all tokens (for logout from all devices)
userSchema.methods.removeAllTokens = function() {
  this.tokens = [];
  return this.save();
};

// Find token
userSchema.methods.findToken = function(tokenToFind) {
  return this.tokens.find(token => 
    token.isActive && 
    (token.token === tokenToFind || token.refreshToken === tokenToFind) &&
    token.expiresAt > new Date()
  );
};

// Update token activity
userSchema.methods.updateTokenActivity = function(tokenToUpdate) {
  const tokenDoc = this.findToken(tokenToUpdate);
  if (tokenDoc) {
    tokenDoc.lastUsed = new Date();
    return this.save();
  }
  return Promise.resolve();
};

// Clean expired tokens
userSchema.methods.cleanExpiredTokens = function() {
  const now = new Date();
  this.tokens = this.tokens.filter(token => 
    token.isActive && token.expiresAt > now
  );
  return this.save();
};

// Handle login attempts
userSchema.methods.incLoginAttempts = function() {
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.LOCK_TIME) || 2 * 60 * 60 * 1000; // 2 hours
  
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { lockUntil: 1, loginAttempts: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens; // Don't expose tokens in API responses
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

// Index for token cleanup
userSchema.index({ "tokens.expiresAt": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('User', userSchema);