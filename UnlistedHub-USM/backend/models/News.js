import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    maxlength: 500  // Inshorts style 60-80 words
  },
  content: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['IPO', 'Market', 'Company', 'Unlisted', 'Pre-IPO', 'General', 'Analysis', 'Startup', 'Regulatory'],
    default: 'General'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  sourceUrl: {
    type: String,
    required: true
  },
  sourceName: {
    type: String,
    default: 'NlistPlanet'
  },
  author: {
    type: String,
    default: 'NlistPlanet Team'
  },
  tags: [{
    type: String,
    trim: true
  }],
  companyMentioned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number,  // in minutes
    default: 1
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ isPublished: 1, publishedAt: -1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ sourceUrl: 1 }, { unique: true }); // Prevent duplicates

// Auto-calculate read time based on content
newsSchema.pre('save', function(next) {
  if (this.content || this.summary) {
    const wordCount = (this.content || this.summary).split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200); // 200 words per minute
    if (this.readTime < 1) this.readTime = 1;
  }
  next();
});

export default mongoose.model('News', newsSchema);
