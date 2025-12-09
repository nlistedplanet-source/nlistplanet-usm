import mongoose from 'mongoose';

const shareTrackingSchema = new mongoose.Schema({
  shareId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
    index: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  uniqueVisitors: [{
    ip: String,
    userAgent: String,
    timestamp: Date
  }],
  conversions: [{
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    platformFee: Number,
    referralReward: Number,  // 1% of platform fee
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shareDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
shareTrackingSchema.index({ userId: 1, createdAt: -1 });
shareTrackingSchema.index({ shareId: 1 });

export default mongoose.model('ShareTracking', shareTrackingSchema);
