import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  Logo: {
    type: String,
    default: ''
  },
  CompanyName: {
    type: String,
    required: true,
    trim: true
  },
  ScripName: {
    type: String,
    required: true,
    trim: true
  },
  ISIN: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  PAN: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  CIN: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  RegistrationDate: {
    type: String,
    required: true
  },
  Sector: {
    type: String,
    required: true,
    trim: true
  },
  // Legacy fields for backward compatibility (populate with CompanyName to avoid unique index issues)
  name: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  sector: {
    type: String
  },
  description: {
    type: String,
    maxlength: 1000
  },
  isin: {
    type: String
  },
  pan: {
    type: String
  },
  cin: {
    type: String
  },
  website: String,
  foundedYear: Number,
  totalListings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  autoIndex: false // Disable automatic index creation
});

// Index for faster searches
companySchema.index({ CompanyName: 'text', ScripName: 'text' });
companySchema.index({ Sector: 1, isActive: 1 });

export default mongoose.model('Company', companySchema);
