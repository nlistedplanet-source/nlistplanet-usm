import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Import routes
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import notificationRoutes from './routes/notifications.js';
import companyRoutes from './routes/companies.js';
import transactionRoutes from './routes/transactions.js';
import referralRoutes from './routes/referrals.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware only
app.use(compression());

// CORS configuration
const cors = require('cors');
const allowedOrigins = [
  'https://nlistplanet-usm-app.vercel.app',
  'http://localhost:3000'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, restrict later
    }
  },
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  try {
    console.log('[GET /] Received request');
    res.json({
      success: true,
      message: 'UnlistedHub USM API',
      version: '1.0.0'
    });
  } catch (err) {
    console.error('[GET /] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Routes
try {
  app.use('/api/auth', authRoutes);
  console.log('[Routes] Auth routes loaded');
} catch (err) {
  console.error('[Routes Error] Auth:', err);
}

try {
  app.use('/api/listings', listingRoutes);
  console.log('[Routes] Listing routes loaded');
} catch (err) {
  console.error('[Routes Error] Listings:', err);
}

try {
  app.use('/api/notifications', notificationRoutes);
  console.log('[Routes] Notification routes loaded');
} catch (err) {
  console.error('[Routes Error] Notifications:', err);
}

try {
  app.use('/api/companies', companyRoutes);
  console.log('[Routes] Company routes loaded');
} catch (err) {
  console.error('[Routes Error] Companies:', err);
}

try {
  app.use('/api/transactions', transactionRoutes);
  console.log('[Routes] Transaction routes loaded');
} catch (err) {
  console.error('[Routes Error] Transactions:', err);
}

try {
  app.use('/api/referrals', referralRoutes);
  console.log('[Routes] Referral routes loaded');
} catch (err) {
  console.error('[Routes Error] Referrals:', err);
}

try {
  app.use('/api/admin', adminRoutes);
  console.log('[Routes] Admin routes loaded');
} catch (err) {
  console.error('[Routes Error] Admin:', err);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'UnlistedHub USM API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  // Avoid leaking internals in production
  const message = isProd && status === 500 ? 'Internal server error' : (err.message || 'Error');
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  res.status(status).json({ success: false, message });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
console.log('[Server] About to listen on port', PORT);

app.listen(PORT, () => {
  console.log(`[Server] ✅ Listening on port ${PORT}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});

console.log('[Server] Listener created');

export default app;
