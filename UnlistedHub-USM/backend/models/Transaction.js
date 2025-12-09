import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['platform_fee', 'boost_fee', 'affiliate_commission', 'referral_reward'],
    required: true
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralShareId: {
    type: String,
    default: null
  },
  referralRewardPaid: {
    type: Boolean,
    default: false
  },
  referralRewardAmount: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    required: true
  },
  tradeAmount: Number, // Original trade amount
  companyName: String,
  description: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Index for analytics
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ affiliateId: 1, type: 1 });

export default mongoose.model('Transaction', transactionSchema);
