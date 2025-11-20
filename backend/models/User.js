import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    uppercase: true
  },
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
  },
  // KYC Information
  dob: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', null],
    default: null
  },
  address: {
    line1: { type: String, default: null },
    line2: { type: String, default: null },
    line3: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    pincode: { type: String, default: null },
    country: { type: String, default: 'India' }
  },
  workIncome: {
    incomeRange: { 
      type: String, 
      enum: ['< 1 Lac', '1-5 Lacs', '5-10 Lacs', '> 10 Lacs', null],
      default: null 
    },
    sourceOfWealth: { 
      type: String,
      enum: ['Salary', 'Business Income', 'Investment Returns', 'Inheritance', 'Other', null],
      default: null
    }
  },
  bankAccount: {
    accountType: { 
      type: String,
      enum: ['Saving', 'Current', null],
      default: null
    },
    accountNumber: { type: String, default: null },
    ifsc: { type: String, default: null },
    bankName: { type: String, default: null },
    branch: { type: String, default: null }
  },
  nominee: {
    name: { type: String, default: null },
    relationship: { 
      type: String,
      enum: ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other', null],
      default: null
    },
    dob: { type: Date, default: null },
    mobile: { type: String, default: null },
    sharePercentage: { type: Number, default: 100 },
    copyAddress: { type: Boolean, default: false }
  },
  dematAccount: {
    dpId: { type: String, default: null },
    clientId: { type: String, default: null }
  },
  kycStatus: {
    type: String,
    enum: ['not_started', 'pending', 'approved', 'rejected'],
    default: 'not_started'
  },
  kycDocuments: {
    pan: {
      url: { type: String, default: null },
      status: { 
        type: String, 
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      rejectionReason: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null }
    },
    aadhaar: {
      url: { type: String, default: null },
      status: { 
        type: String, 
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      rejectionReason: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null }
    },
    bankProof: {
      url: { type: String, default: null },
      status: { 
        type: String, 
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      rejectionReason: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null }
    },
    cdslStatement: {
      url: { type: String, default: null },
      status: { 
        type: String, 
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      rejectionReason: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null }
    }
  },
  kycSubmittedAt: { type: Date, default: null },
  kycVerifiedAt: { type: Date, default: null },
  kycRejectionReason: { type: String, default: null }
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

// Generate unique userId before saving
userSchema.pre('save', function(next) {
  if (!this.userId) {
    // Generate 8-character alphanumeric ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let userId = 'USR';
    for (let i = 0; i < 5; i++) {
      userId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.userId = userId;
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
