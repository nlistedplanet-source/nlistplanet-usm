import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  referredBy: {
    type: String, // Username of referrer
    default: null
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  totalReferrals: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Hash password with bcryptjs (simple and stable)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    console.log('[Password Hash] Starting password hash for user:', this.email);
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    console.log('[Password Hash] Completed for user:', this.email);
  } catch (err) {
    console.error('[Password Hash Error]', err);
    return next(err);
  }
  next();
});

// Generate referral code from username
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = this.username.toUpperCase();
  }
  next();
});

// Compare password with bcryptjs verification
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcryptjs.compare(candidatePassword, this.password);
  } catch (err) {
    console.error('Password comparison error:', err);
    return false;
  }
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    fullName: this.fullName,
    avatar: this.avatar,
    totalReferrals: this.totalReferrals,
    createdAt: this.createdAt
  };
};

export default mongoose.model('User', userSchema);
