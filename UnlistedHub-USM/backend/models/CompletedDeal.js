import mongoose from 'mongoose';

// Generate 6-digit alphanumeric code
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like O,0,1,I,L
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const completedDealSchema = new mongoose.Schema({
  // Reference to the listing
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  
  // Reference to the accepted bid
  bidId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Deal type
  dealType: {
    type: String,
    enum: ['sell', 'buy'],
    required: true
  },
  
  // Company info
  companyName: {
    type: String,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  
  // Seller info
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerUsername: String,
  sellerVerificationCode: {
    type: String,
    default: generateCode
  },
  
  // Buyer info
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerUsername: String,
  buyerVerificationCode: {
    type: String,
    default: generateCode
  },
  
  // RM verification code (shown to admin, RM will tell this to users)
  rmVerificationCode: {
    type: String,
    default: generateCode
  },
  
  // Deal details
  agreedPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    default: 0
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending_rm_contact', 'rm_contacted', 'documents_pending', 'payment_pending', 'completed', 'cancelled'],
    default: 'pending_rm_contact'
  },
  
  // RM assignment
  assignedRM: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rmName: String,
  rmContactedAt: Date,
  
  // Notes
  adminNotes: String,
  buyerNotes: String,
  sellerNotes: String,
  
  // Timestamps
  dealAcceptedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  cancelledAt: Date,
  cancelReason: String
  
}, {
  timestamps: true
});

// Indexes
completedDealSchema.index({ sellerId: 1, status: 1 });
completedDealSchema.index({ buyerId: 1, status: 1 });
completedDealSchema.index({ status: 1, createdAt: -1 });
completedDealSchema.index({ listingId: 1, bidId: 1 }, { unique: true });

// Virtual for deal age
completedDealSchema.virtual('dealAge').get(function() {
  return Math.floor((Date.now() - this.dealAcceptedAt) / (1000 * 60 * 60 * 24));
});

export default mongoose.model('CompletedDeal', completedDealSchema);
