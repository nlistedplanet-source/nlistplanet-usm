import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Generate Funny Username
const generateFunnyUsername = () => {
  const prefixes = [
    'ironman', 'batman', 'superman', 'spiderman', 'thor', 'hulk', 'captainamerica', 'blackwidow',
    'rajnikant', 'salmankhan', 'shahrukhkhan', 'amitabhbachchan', 'akshaykumar', 'hrithikroshan',
    'deepikapadukone', 'priyankachopra', 'katrinakaif', 'aliabhatt',
    'sherlock', 'jonsnow', 'tyrionlannister', 'tonystark', 'brucewayne',
    'delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'goa',
    'wolf', 'tiger', 'lion', 'eagle', 'falcon', 'panther', 'cobra', 'dragon',
    'ninja', 'samurai', 'warrior', 'knight', 'viking', 'spartan',
    'einstein', 'newton', 'tesla', 'edison', 'darwin',
    'crypto', 'stock', 'trader', 'investor', 'whale', 'bull', 'bear',
    'rockstar', 'legend', 'champion', 'master', 'boss', 'king', 'queen',
    'pixel', 'byte', 'quantum', 'matrix', 'cyber', 'tech', 'digital'
  ];
  
  const suffixes = [
    'trader', 'investor', 'pro', 'master', 'king', 'queen', 'boss', 'legend',
    'warrior', 'hero', 'star', 'genius', 'wizard', 'ninja', 'samurai',
    'returns', 'gains', 'profits', 'wealth', 'rich', 'millionaire',
    'hustler', 'grinder', 'player', 'gamer', 'winner', 'champion',
    'alpha', 'sigma', 'omega', 'prime', 'elite', 'supreme',
    '001', '247', '360', '007', '420', '786', '999'
  ];
  
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${randomPrefix}_${randomSuffix}`;
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Auth specific rate limiter (mitigate brute force & abuse)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests. Please try later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Manual validation helpers - avoid middleware chains that crash
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
const validatePassword = (password) => {
  // Bank-level: min 12 chars, must have uppercase, lowercase, numbers (alphanumeric only)
  if (password.length < 12 || password.length > 128) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/^[a-zA-Z0-9]+$/.test(password)) return false;
  return true;
};

// Audit logging helper - bank-level audit trail for compliance
const logAuthEvent = (event, username, status, ip, userAgent) => {
  const timestamp = new Date().toISOString();
  const sanitizedUsername = (username?.substring(0, 50) || 'unknown').replace(/[\n\r]/g, '');
  const sanitizedIp = (ip?.substring(0, 45) || 'unknown').replace(/[\n\r]/g, '');
  const logEntry = {
    timestamp,
    event,
    username: sanitizedUsername,
    status,
    ip: sanitizedIp
  };
  console.log(`[AUTH_AUDIT] ${JSON.stringify(logEntry)}`);
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, fullName, phone, referredBy } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Simple validation (avoid middleware chains that crash)
    if (!email || !password || !fullName || !phone) {
      logAuthEvent('register_attempt', email || 'unknown', 'missing_fields', ip, userAgent);
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (!validateEmail(email)) {
      logAuthEvent('register_attempt', email, 'invalid_email', ip, userAgent);
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!validatePhone(phone)) {
      logAuthEvent('register_attempt', email, 'invalid_phone', ip, userAgent);
      return res.status(400).json({ success: false, message: 'Phone must be 10 digits' });
    }

    if (!validatePassword(password)) {
      logAuthEvent('register_attempt', email, 'invalid_password', ip, userAgent);
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be 12-128 chars with uppercase, lowercase, and numbers' 
      });
    }

    if (!fullName || fullName.length < 3 || fullName.length > 100) {
      logAuthEvent('register_attempt', email, 'invalid_name', ip, userAgent);
      return res.status(400).json({ success: false, message: 'Name must be 3-100 characters' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existingUser) {
      logAuthEvent('register_attempt', email, 'duplicate_user', ip, userAgent);
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // Create new user
    let username = generateFunnyUsername();
    const userCount = await User.countDocuments();
    const userId = `USM${String(userCount + 1001).slice(-6)}`;

    let referrerDoc = null;
    if (referredBy) {
      referrerDoc = await User.findOne({ $or: [{ username: referredBy }, { referralCode: referredBy }] });
      if (!referrerDoc) {
        logAuthEvent('register_attempt', email, 'invalid_referrer', ip, userAgent);
        return res.status(400).json({ success: false, message: 'Invalid referrer' });
      }
    }

    const userData = new User({
      username,
      email: email.toLowerCase(),
      password,
      fullName,
      phone,
      referralCode: `${userId}_${username.substring(0, 5).toUpperCase()}`,
      referredBy: referrerDoc?._id
    });

    await userData.save();

    if (referrerDoc) {
      referrerDoc.totalReferrals += 1;
      await referrerDoc.save();
    }

    const token = generateToken(userData._id);

    logAuthEvent('register', email, 'success', ip, userAgent);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: userData._id,
        userId,
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        role: userData.role,
        createdAt: userData.createdAt
      }
    });
  } catch (error) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logAuthEvent('register_error', req.body?.email || 'unknown', 'error', ip, req.headers['user-agent']);
    console.error('Register Error:', error.message);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Validate input
    if (!username || !password) {
      logAuthEvent('login_attempt', username || 'unknown', 'missing_fields', ip, userAgent);
      return res.status(400).json({ success: false, message: 'Username/email and password required' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: username.toLowerCase() }, { username: username }]
    });

    if (!user) {
      logAuthEvent('login_attempt', username, 'user_not_found', ip, userAgent);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logAuthEvent('login_attempt', username, 'invalid_password', ip, userAgent);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    logAuthEvent('login', username, 'success', ip, userAgent);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logAuthEvent('login_error', req.body?.username || 'unknown', 'error', ip, req.headers['user-agent']);
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be 12-128 chars with uppercase, lowercase, and numbers' 
      });
    }

    const user = await User.findById(req.user.id);
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      logAuthEvent('password_change', user.email, 'invalid_current_password', ip, req.headers['user-agent']);
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }

    user.password = newPassword;
    await user.save();

    logAuthEvent('password_changed', user.email, 'success', ip, req.headers['user-agent']);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error.message);
    res.status(500).json({ success: false, message: 'Password change failed', error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Profile update failed', error: error.message });
  }
});

export default router;
