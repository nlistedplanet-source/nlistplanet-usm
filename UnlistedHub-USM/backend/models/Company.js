import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  scriptName: {
    type: String,
    trim: true,
    default: null
  },
  logo: {
    type: String,
    default: null
  },
  sector: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  isin: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/, 'Invalid ISIN format']
  },
  pan: {
    type: String,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format']
  },
  cin: {
    type: String,
    match: [/^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{5,6}$/, 'Invalid CIN format']
  },
  website: String,
  foundedYear: Number,
  registrationDate: {
    type: Date,
    default: null
  },
  // Company highlights for share cards
  highlights: {
    type: [String],
    default: [],
    maxlength: 5
  },
  totalListings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Verification status - for companies added by users
  verificationStatus: {
    type: String,
    enum: ['verified', 'pending', 'rejected'],
    default: 'verified'
  },
  // Who added this company
  addedBy: {
    type: String,
    enum: ['admin', 'system', 'user'],
    default: 'admin'
  },
  // User who added this company (if addedBy is 'user')
  addedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Admin verification notes
  verificationNotes: {
    type: String,
    default: null
  },
  // Verified by admin
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save hook to normalize data
companySchema.pre('save', function(next) {
  // Normalize identifiers to UPPERCASE (PAN, ISIN, CIN should be uppercase as per standards)
  if (this.pan) {
    this.pan = this.pan.toUpperCase().trim();
  }
  if (this.isin) {
    this.isin = this.isin.toUpperCase().trim();
  }
  if (this.cin) {
    this.cin = this.cin.toUpperCase().trim();
  }
  
  // Normalize sector to Title Case (consistent formatting)
  if (this.sector) {
    this.sector = this.sector.trim().split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Normalize company name (trim and proper spacing)
  if (this.name) {
    this.name = this.name.trim().replace(/\s+/g, ' ');
  }
  
  // Normalize scriptName
  if (this.scriptName) {
    this.scriptName = this.scriptName.trim().replace(/\s+/g, ' ');
  }
  
  next();
});

// Index for search
companySchema.index({ name: 'text', sector: 'text' });
companySchema.index({ sector: 1, isActive: 1 });

export default mongoose.model('Company', companySchema);
