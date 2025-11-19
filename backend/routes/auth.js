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
  const randomNum = Math.floor(Math.random() * 1000);
  
  return `${randomPrefix}_${randomSuffix}_${randomNum}`;
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per window
  message: 'Too many attempts, please try later',
  standardHeaders: true,
  legacyHeaders: false
});

// Simple validators
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  return /^[0-9]{10}$/.test(phone);
};

const isValidPassword = (password) => {
  // At least 6 characters
  if (password.length < 6 || password.length > 128) return false;
  return true;
};

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, fullName, phone, referredBy } = req.body;

    // Validation
    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be 10 digits'
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (fullName.length < 3 || fullName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be between 3 and 100 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    // Generate username
    let username = generateFunnyUsername();
    let usernameExists = await User.findOne({ username });
    
    // Keep generating until unique
    while (usernameExists) {
      username = generateFunnyUsername();
      usernameExists = await User.findOne({ username });
    }

    // Create new user
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password,
      fullName,
      phone,
      referralCode: `${username.toUpperCase()}_${Date.now()}`
    });

    // Handle referral
    if (referredBy) {
      const referrer = await User.findOne({
        $or: [{ username: referredBy }, { referralCode: referredBy }]
      });

      if (referrer) {
        newUser.referredBy = referrer.username;
        referrer.totalReferrals += 1;
        await referrer.save();
      }
    }

    // Save user
    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password'
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: username.toLowerCase() }, { username: username.toLowerCase() }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
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
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
// Simple auth health check
router.get('/health', (req,res) => {
  res.json({ ok: true, service: 'auth', ts: Date.now() });
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        totalReferrals: user.totalReferrals,
        totalEarnings: user.totalEarnings,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
});

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (fullName && fullName.length >= 3 && fullName.length <= 100) {
      user.fullName = fullName;
    }

    if (phone && isValidPhone(phone)) {
      user.phone = phone;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
});

export default router;
