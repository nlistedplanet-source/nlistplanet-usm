import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'new_bid',
      'new_offer',
      'bid_accepted',
      'offer_accepted',
      'bid_rejected',
      'offer_rejected',
      'bid_countered',
      'counter_offer',
      'deal_accepted',
      'deal_confirmed',
      'confirmation_required',
      'listing_expired',
      'boost_activated',
      'referral_earning',
      'app_update',
      'admin_alert',
      'success',
      'warning',
      'test'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    listingId: mongoose.Schema.Types.ObjectId,
    bidId: mongoose.Schema.Types.ObjectId,
    fromUser: String,
    amount: Number,
    quantity: Number,
    companyName: String,
    companyId: mongoose.Schema.Types.ObjectId,
    addedBy: mongoose.Schema.Types.ObjectId,
    action: String,
    verificationStatus: String,
    version: String,
    actionUrl: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: String
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
