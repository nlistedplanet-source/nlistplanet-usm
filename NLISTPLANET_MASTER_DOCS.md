# 📚 NListPlanet - Master Documentation

**Version:** 2.0.0  
**Last Updated:** December 14, 2025  
**Project:** P2P Unlisted Shares Trading Platform  
**Architecture:** Unified Backend + Dual Frontend (Desktop + Mobile PWA)

---

## 📖 Table of Contents

1. [Quick Start & Overview](#1-quick-start--overview)
2. [Architecture (Unified Backend Model)](#2-architecture-unified-backend-model)
3. [Security & Authentication](#3-security--authentication)
4. [Platform Fee Model & Business Logic](#4-platform-fee-model--business-logic)
5. [Development Workflows](#5-development-workflows)
6. [Feature Implementation Guides](#6-feature-implementation-guides)
7. [API Reference](#7-api-reference)
8. [Database Models & Schemas](#8-database-models--schemas)
9. [Deployment Guide](#9-deployment-guide)
10. [Testing & Validation](#10-testing--validation)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Quick Start & Overview

### 🎯 Core Concept
Anonymous, admin-mediated P2P marketplace for trading unlisted company shares. Platform connects buyers and sellers without revealing identities, with manual transaction completion by admin.

### ✨ Key Features
- ✅ Anonymous trading (system-generated usernames like `@trader_xxx`)
- ✅ Bid/Counter/Accept/Reject mechanism (max 4 counter rounds)
- ✅ Admin-mediated manual transactions
- ✅ Hidden 2% platform fee (users only see their adjusted prices)
- ✅ KYC verification system
- ✅ Referral program
- ✅ Portfolio tracking
- ✅ Bank-level security (Argon2id, rate limiting, CSP headers)

### 🚀 Quick Commands

#### Backend Development
```bash
cd UnlistedHub-USM/backend
npm install
cp .env.example .env  # Edit with real values
npm run dev           # Development with nodemon
npm start             # Production
```

#### Desktop Frontend
```bash
cd UnlistedHub-USM/frontend
npm install
npm start             # Runs on localhost:3000
npm run build
```

#### Mobile Frontend (PWA)
```bash
cd nlistplanet-mobile/frontend
npm install
npm start
npm run build
```

### 🔧 Environment Variables

**Backend `.env` (Required):**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-32-char-or-longer-secret-key
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,https://nlistplanet.com
EMAIL_USER=your-smtp-email@example.com
EMAIL_PASSWORD=your-smtp-password
NODE_ENV=production
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=https://nlistplanet-usm-v8dc.onrender.com/api
# Defaults to production API if not set
```

---

## 2. Architecture (Unified Backend Model)

### 🏗️ Critical Concept: One Brain, Two Bodies

**ONE BACKEND** serves **BOTH** desktop and mobile frontends:
- Backend changes affect BOTH applications immediately
- Frontend changes are isolated per project
- API responses must be compatible with both UIs

```
UnlistedHub-USM/
├── backend/              # ← SHARED "Brain" (serves both apps)
│   ├── server.js         # Express entry: security, CORS, routes
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints (/api/auth, /api/listings, etc.)
│   ├── middleware/       # auth.js, validation.js, securityLogger.js
│   └── utils/            # emailService, smsService, newsScheduler
└── frontend/             # Desktop UI only

nlistplanet-mobile/
└── frontend/             # Mobile PWA UI only
```

### 📱 Tech Stack

| Layer | Desktop | Mobile |
|-------|---------|--------|
| **Frontend** | React 18 + Vite | React 19 + Vite |
| **Backend** | Node.js + Express.js (shared) | Same backend |
| **Database** | MongoDB + Mongoose | Same DB |
| **Auth** | JWT tokens | JWT tokens |
| **Styling** | Tailwind CSS 3.4 | Tailwind CSS 3.4 |
| **Hosting** | Vercel (frontend) + Render (backend) | Same |

### 🔄 How to Request Changes

| Scenario | Type | Command | Files Affected |
|----------|------|---------|----------------|
| Change button color on Mobile | Frontend only | "Mobile frontend me button color change kar do" | `nlistplanet-mobile/frontend` |
| Change text on Desktop home | Frontend only | "Desktop frontend me home page text update kar do" | `UnlistedHub-USM/frontend` |
| Change platform fee logic | Backend (shared) | "Backend me platform fee logic change kar do" | `UnlistedHub-USM/backend` → affects BOTH apps |
| Add mobile-only feature | Backend + Mobile | Add API support + Mobile UI | Both `backend` + `nlistplanet-mobile/frontend` |

### ⚠️ Important Warning
Since the backend is shared, **be careful when changing API responses**. Changes to API structure must be compatible with both Desktop and Mobile frontends.

---

## 3. Security & Authentication

### 🔐 Bank-Level Security Features

#### Password Policy (Alphanumeric Only)
- **Length:** 12-128 characters
- **Requirements:**
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
- **Forbidden:** Special characters (`!@#$%^&*`) — prevents XSS warnings
- **Hashing:** Argon2id (GPU-resistant, 64MB memory cost, 3 iterations, 4 threads)
- **Examples:**
  - ✅ Valid: `SecurePass123`, `MyPassword2024`, `TradingApp99`
  - ❌ Invalid: `SecurePass!23`, `securepass123` (no upper), `SecurePass` (no numbers)

#### Middleware Stack (Order Matters!)
```javascript
// backend/server.js
1. Helmet.js              // Security headers (CSP, XSS, no-sniff)
2. CORS                   // Strict origin checking (CORS_ORIGINS env)
3. Rate Limiting:
   - Global: 300 req/15min per IP
   - Auth: 20 req/15min per IP (brute-force prevention)
4. express-mongo-sanitize // NoSQL injection prevention
5. xss-clean             // XSS attack prevention
6. Compression           // gzip responses
```

#### Authentication Middleware
**File:** `backend/middleware/auth.js`

| Middleware | Purpose | Usage |
|------------|---------|-------|
| `protect` | Requires valid JWT token | `router.get('/profile', protect, getProfile)` |
| `authorize(...roles)` | Role-based access | `router.delete('/users/:id', protect, authorize('admin'), deleteUser)` |
| `optionalAuth` | Allows guests (public views) | `router.get('/listings', optionalAuth, getListings)` |

**Frontend Setup:**
- AuthContext sets `Authorization: Bearer <token>` header
- 30-min inactivity logout enforced
- Token stored in localStorage

#### Security Headers (Helmet.js)
```javascript
// Active protections:
- CSP: Content-Security-Policy (strict 'self' only)
- HSTS: 2 years max-age + includeSubDomains
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY (clickjacking protection)
- X-XSS-Protection: Enabled
- Referrer-Policy: no-referrer
- Permissions-Policy: Deny all (camera, mic, geolocation)
```

#### Audit Logging
**Logged Events:** (No PII in logs)
- `register_success` — User registration
- `login_success` — Authentication success
- `login_failed` — Failed attempts with reason
- `validation_error` — Invalid inputs

**Log Format:** JSON with timestamp, event type, sanitized username, IP, User-Agent

---

## 4. Platform Fee Model & Business Logic

### 💰 Core Business Rule: Hidden 2% Fee

**The platform charges 2% on ALL transactions. This fee is NEVER shown to users.**

| User Type | Always Sees |
|-----------|-------------|
| **SELLER** | What they will **RECEIVE** (after 2% deduction) |
| **BUYER** | What they will **PAY** (after 2% addition) |

Both users see their OWN perspective - never the other person's actual amount.

### 📊 Price Calculation Examples

#### Scenario 1: SELL Listing (₹238/share)

**Seller Creates Listing:**
```
Seller enters: ₹238/share

System calculates:
• Seller will get:  ₹238 (their entered price)
• Buyer will pay:   ₹242.76 (₹238 × 1.02)
• Platform fee:     ₹4.76
```

**Marketplace View:**
- Seller: Does NOT see own listing (hidden)
- Buyer: Sees **₹242.76/share** (what they will PAY)

**Seller's Dashboard (My Posts):**
```
Your Selling Price: ₹238/share
```

**Buyer Places Bid at ₹230:**
```
Buyer enters: ₹230 (what they want to pay)

System calculates:
• Buyer pays:   ₹230
• Seller gets:  ₹225.49 (₹230 × 0.98)
• Platform:     ₹4.51
```

**Buyer's View:** "Your Bid: ₹230/share"  
**Seller's View:** "You will receive: ₹225.49/share"

#### Scenario 2: BUY Listing (₹500/share)

**Buyer Creates Listing:**
```
Buyer enters: ₹500/share (their max budget)

System calculates:
• Buyer will pay:   ₹500
• Seller will get:  ₹490 (₹500 × 0.98)
• Platform fee:     ₹10
```

**Marketplace View:**
- Buyer: Does NOT see own listing
- Seller: Sees **₹490/share** (what they will RECEIVE)

### 🛠️ Helper Functions

**Frontend:** `frontend/src/utils/helpers.js`
```javascript
// Calculate what buyer pays (for SELL listings / seller counters)
export const calculateBuyerPays = (price) => {
  return price * 1.02;
};

// Calculate what seller receives (for bids / BUY listings)
export const calculateSellerGets = (price) => {
  return price * 0.98;
};

// Display price based on context
export const getPriceDisplay = (price, listingType, isOwner) => {
  if (listingType === 'SELL') {
    return isOwner ? price : calculateBuyerPays(price);
  } else {
    return isOwner ? price : calculateSellerGets(price);
  }
};
```

**Backend:** `backend/models/Listing.js`
```javascript
// Bid schema stores:
buyerOfferedPrice: Number,      // What buyer pays (price × 1.02)
sellerReceivesPrice: Number,    // What seller gets (price × 0.98)
platformFee: Number,            // The 2% (price × 0.02)
platformFeePercentage: 2,       // Fixed 2%
```

### 📏 Price Display Rules

| Listing Type | Owner Sees | Others See |
|--------------|------------|------------|
| SELL (₹100) | ₹100 (Your Price) | ₹102 (Buyer Pays) |
| BUY (₹100) | ₹100 (Your Price) | ₹98 (Seller Gets) |

**What is Hidden:**
- ❌ "Platform Fee 2%" text anywhere
- ❌ Other person's actual price/amount
- ❌ Fee calculation breakdown
- ❌ "You receive" / "After fee" labels

**Admin View Only:**
```
Settlement Breakdown (Admin Dashboard):
• Buyer Payment:    ₹2,42,76,000
• Platform Fee:     ₹4,76,000 (2%)
• Seller Payout:    ₹2,38,00,000
```

---

## 5. Development Workflows

### 🔧 Backend Development

**Start Development Server:**
```bash
cd UnlistedHub-USM/backend
npm run dev          # nodemon hot-reload
```

**Production:**
```bash
npm start            # node server.js
```

**Health Check:**
```bash
curl http://localhost:5000/api/health
# Response: { "status": "OK", "timestamp": "2025-12-14T..." }
```

### 🎨 Frontend Development

**Desktop:**
```bash
cd UnlistedHub-USM/frontend
npm start            # React dev server on :3000
npm run build        # Production build
```

**Mobile:**
```bash
cd nlistplanet-mobile/frontend
npm start            # React dev server
npm run build
```

### 🗃️ Database Scripts

**From backend directory:**
```bash
node scripts/seedCompanies.js    # Seed company data
node scripts/fetchNews.js        # Fetch RSS news (cron simulation)
```

### 🧪 Testing

**No Automated Tests** — Manual validation required:
1. Use Postman/Insomnia for API testing
2. Manual UI testing in browser
3. Use `test-*.js` files in `backend/` for ad-hoc tests

**Ad-hoc Test Files:**
- `test-admin-api.js` — Admin endpoint tests
- `test-openai.js` — OpenAI integration tests
- `test-sms.js` — SMS service tests
- `test-update.js` — Update operations

### 📂 Key Files Reference

| File | Purpose |
|------|---------|
| [backend/server.js](UnlistedHub-USM/backend/server.js) | Security setup, CORS, route registration |
| [backend/middleware/auth.js](UnlistedHub-USM/backend/middleware/auth.js) | JWT protect/authorize/optionalAuth patterns |
| [backend/models/Listing.js](UnlistedHub-USM/backend/models/Listing.js) | Listing schema with fee fields, bid schema |
| [backend/models/Company.js](UnlistedHub-USM/backend/models/Company.js) | Company schema (uses `name` not `CompanyName`) |
| [frontend/src/utils/helpers.js](UnlistedHub-USM/frontend/src/utils/helpers.js) | Fee calculations, price display, date formatting |
| [frontend/src/utils/api.js](UnlistedHub-USM/frontend/src/utils/api.js) | Axios wrapper for all API calls |

---

## 6. Feature Implementation Guides

### 🎯 Bid Lifecycle (State Machine)

```text
Buyer places Bid
  ↓ status: 'pending_seller_response'
  
Seller Action:
  ├─ Accept → 'accepted_by_seller' → Buyer must confirm
  ├─ Reject → 'rejected_by_seller' → Closed
  └─ Counter → 'counter_by_seller' → Buyer responds
  
Counter Flow (max 4 rounds):
  Buyer counter → 'counter_by_buyer' → Seller responds
  Either accepts counter → 'counter_accepted_by_*' → Other confirms
  
Both Accept:
  status: 'both_accepted'
  listing.status: 'pending_admin_closure'
  Transaction created → Admin Queue
  
Admin Closure:
  Admin verifies offline → Marks 'closed_success'
  Orders → Previous
  Portfolio Updated
```

### 🎨 UI Flow (Landing → Dashboard)

#### Landing Page
- Hero: "Buy & Sell Unlisted Shares at Your Price"
- CTA: [Login] → Modal with Login/Sign Up tabs
- Sample posts (public, non-interactive)
- Stats counter (users, volume, companies)
- Footer: "How It Works"

**Actions:**
- Login → Redirect `/dashboard`
- No signup on header (handled in modal)

#### Dashboard Tabs

| Tab | Purpose | Default |
|-----|---------|---------|
| Market | Public listings (default view) | ✅ |
| Buy | Manage buy posts, offers received | |
| Sell | Manage sell posts, bids received | |
| Orders | Active/Previous deals | |
| Portfolio | Holdings & add shares | |
| FAQ | Read-only Q&A | |
| Support | Contact admin | |
| Profile | Account settings | |

**Default Route:** `/dashboard/market`

### 🏷️ Sell Section Structure

1. **Sell List** — User's own sell posts (SellPostCard)
   - Actions: Edit / Remove / View
2. **Bid Received** — Buyer bids (BidReceivedCard)
   - Actions: Accept / Reject / Counter
3. **Counter Offer Status** — Negotiation tracking
   - Shows ask/counter prices, bidder, status
4. **Transaction Complete** — Finalized deals (read-only)

### 💹 Buy Section Structure

1. **Buy List** — User's own buy posts
2. **Offer Received** — Seller offers
   - Actions: Accept / Reject / Counter
3. **Counter Offer Status** — Negotiation chain
   - Tracks counter rounds (max 4)
4. **Transaction Complete** — Settlement info

### 📦 Portfolio Management

- User holdings of unlisted shares
- **Add Existing Share Form:**
  - Company Name, Sector, Purchase Date
  - Quantity, Price, Notes
- **Actions:**
  - Place Sell Order (prefills company)
  - Buy More
  - Edit Record

### 👥 Admin Dashboard

| Tab | Function |
|-----|----------|
| All Listings | View/remove all buy/sell posts |
| Bids/Offers | View all bids & counters |
| Deal Closure Queue | Manual verification & closure |
| Users/KYC | Approve KYC documents |
| Portfolio Update | Adjust holdings post-deal |
| Requests | View support messages |

---

## 7. API Reference

### 🔗 Route Registration Pattern

**File:** `backend/server.js`
```javascript
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';

// Register routes:
app.use('/api/auth', authRoutes);
app.use('/api/listings', protect, listingRoutes);
```

### 📡 Available Routes

All endpoints prefixed with `/api`:

| Route | Middleware | Purpose |
|-------|------------|---------|
| `/api/auth` | Public (rate-limited) | Login, register, password reset |
| `/api/listings` | `protect` | Create, view, bid on listings |
| `/api/notifications` | `protect` | User notifications |
| `/api/companies` | `optionalAuth` | Company data (public + protected) |
| `/api/transactions` | `protect` | Transaction history |
| `/api/referrals` | `protect` | Referral system |
| `/api/portfolio` | `protect` | User portfolio management |
| `/api/admin` | `protect` + `authorize('admin')` | Admin operations |
| `/api/adminCompanies` | `protect` + `authorize('admin')` | Company management |
| `/api/ads` | `protect` + `authorize('admin')` | Ad management |
| `/api/news` | Public | Public news feed |
| `/api/adminNews` | `protect` + `authorize('admin')` | News management |
| `/api/share` | `protect` | Share referral links |
| `/api/kyc` | `protect` | KYC document upload |

### 🛠️ Frontend API Wrapper

**File:** `frontend/src/utils/api.js`

```javascript
// Example usage:
import { listingsAPI, companiesAPI, adminAPI } from './utils/api';

// Listings
const listings = await listingsAPI.getAll({ type: 'sell' });
await listingsAPI.create({ price, quantity, companyId });
await listingsAPI.placeBid(listingId, { price, quantity });

// Companies
const companies = await companiesAPI.getAll();
const results = await companiesAPI.search('Tesla');

// Admin
const stats = await adminAPI.getStats();
await adminAPI.banUser(userId);
```

### 🔄 Adding New API Endpoint

1. **Create route file** in `backend/routes/myFeature.js`
2. **Import and register** in `backend/server.js`:
   ```javascript
   import myFeatureRoutes from './routes/myFeature.js';
   app.use('/api/myfeature', protect, myFeatureRoutes);
   ```
3. **Add to frontend wrapper** in `frontend/src/utils/api.js`:
   ```javascript
   export const myFeatureAPI = {
     getData: () => api.get('/api/myfeature'),
     create: (data) => api.post('/api/myfeature', data)
   };
   ```

---

## 8. Database Models & Schemas

### 📊 User Model

**File:** `backend/models/User.js`

```javascript
{
  username: String,              // System-generated (@trader_xxx)
  email: String,                 // Unique, verified
  password: String,              // Argon2id hashed
  fullName: String,              // Admin-only visibility
  phone: String,                 // Admin-only visibility
  role: 'user' | 'admin',        // Default: 'user'
  isVerified: Boolean,           // Email verification status
  kycStatus: 'pending' | 'approved' | 'rejected',
  
  // Referral system
  referredBy: String,            // Referrer's code
  referralCode: String,          // User's unique code
  
  // Privacy
  showContactInfo: Boolean,      // Public profile toggle
  
  createdAt: Date,
  updatedAt: Date
}
```

### 🏢 Company Model

**File:** `backend/models/Company.js`

```javascript
{
  name: String,                  // Company name (NOT CompanyName!)
  scriptName: String,            // Trading symbol
  logo: String,                  // Logo URL/path
  sector: String,                // Industry sector
  isin: String,                  // ISIN code (unique)
  pan: String,                   // PAN number
  cin: String,                   // CIN number
  description: String,
  createdAt: Date
}
```

**⚠️ Legacy Note:** Old data may have `CompanyName` field. Always use `company.name` in new code.

### 📝 Listing Model

**File:** `backend/models/Listing.js`

```javascript
{
  userId: ObjectId,              // Creator reference
  username: String,              // System-generated (@trader_xxx)
  type: 'sell' | 'buy',          // Post type
  
  // Company info
  companyId: ObjectId,           // Company reference
  companyName: String,           // Denormalized for performance
  
  // Price fields
  price: Number,                 // Base price entered by user
  sellerDesiredPrice: Number,    // SELL: seller wants this
  buyerMaxPrice: Number,         // BUY: buyer offers this
  displayPrice: Number,          // Calculated with 2% fee
  platformFeePercentage: 2,      // Fixed 2%
  platformFee: Number,           // Auto-calculated
  
  // Quantity
  quantity: Number,              // Shares available
  minLot: Number,                // Minimum lot size
  
  // Status
  status: 'active' | 'sold' | 'expired' | 'cancelled' | 'pending_admin_closure' | 'closed_success',
  
  // Nested arrays
  bids: [Bid],                   // Buyer offers (on SELL listings)
  offers: [Bid],                 // Seller offers (on BUY listings)
  
  // Boost feature
  isBoosted: Boolean,            // Paid promotion
  boostExpiresAt: Date,
  
  // Metadata
  views: Number,
  expiresAt: Date,               // Auto-expires in 30 days
  createdAt: Date,
  updatedAt: Date
}
```

### 💰 Bid Schema (Nested in Listing)

```javascript
{
  userId: ObjectId,              // Bidder reference
  username: String,              // System-generated
  
  // Price (user-entered)
  price: Number,                 // Original bid amount
  
  // Platform fee breakdown (auto-calculated)
  buyerOfferedPrice: Number,     // Total buyer pays (price × 1.02)
  sellerReceivesPrice: Number,   // Net seller gets (price × 0.98)
  platformFee: Number,           // Platform keeps (2%)
  platformFeePercentage: 2,      // Fixed
  
  quantity: Number,              // Shares requested
  message: String,               // Optional message
  
  // Status tracking
  status: 'pending_seller_response' | 'accepted_by_seller' | 
          'rejected_by_seller' | 'counter_by_seller' | 
          'counter_by_buyer' | 'counter_accepted_by_buyer' |
          'counter_accepted_by_seller' | 'both_accepted' | 'expired',
  
  // Counter offer history (max 4 rounds)
  counterHistory: [
    {
      round: Number,             // 1-4
      by: 'buyer' | 'seller',
      price: Number,
      quantity: Number,
      message: String,
      timestamp: Date
    }
  ],
  
  createdAt: Date
}
```

### 💼 Transaction Model

**File:** `backend/models/Transaction.js`

```javascript
{
  listingId: ObjectId,
  bidId: ObjectId,
  buyerId: ObjectId,
  sellerId: ObjectId,
  companyId: ObjectId,
  
  // Final agreed terms
  agreedPrice: Number,           // Per share
  quantity: Number,
  
  // Financial breakdown
  buyerPaysAmount: Number,       // Total buyer pays
  sellerReceivesAmount: Number,  // Net seller gets
  platformFeeAmount: Number,     // Platform keeps
  platformFeePercentage: 2,
  
  // Status tracking
  status: 'pending' | 'processing' | 'completed' | 'cancelled',
  
  // Admin workflow
  adminNotes: String,            // Admin comments
  buyerPaid: Boolean,            // Payment received
  sellerTransferred: Boolean,    // Shares transferred
  adminVerified: Boolean,        // Final approval
  
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 🔔 Notification Model

```javascript
{
  userId: ObjectId,
  type: 'bid' | 'offer' | 'counter' | 'accepted' | 'rejected' | 'admin',
  title: String,
  message: String,
  relatedId: ObjectId,           // Listing/Bid/Transaction ID
  isRead: Boolean,
  createdAt: Date
}
```

---

## 9. Deployment Guide

### 🚀 Backend Deployment (Render.com)

**Service:** nlistplanet-usm-api  
**Region:** Oregon (Free tier)  
**Repository:** `UnlistedHub-USM/backend`

#### Configuration
```yaml
# render.yaml
services:
  - type: web
    name: nlistplanet-usm-api
    env: node
    region: oregon
    plan: free
    buildCommand: npm ci --only=production --ignore-scripts
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false  # Add in dashboard
      - key: JWT_SECRET
        sync: false
```

#### Auto-Deploy Setup
1. Go to: https://dashboard.render.com
2. Select service: **nlistplanet-usm-api**
3. Settings → **Build & Deploy**
4. Set **Auto-Deploy** to **Yes**
5. Set **Branch** to **main**

#### Manual Deploy (Fallback)
```bash
# Option 1: Render Dashboard
1. Dashboard → Select service
2. Click "Manual Deploy"
3. Select "Deploy latest commit"

# Option 2: Deploy Hook (webhook)
curl -X POST https://api.render.com/deploy/srv-XXXXX
```

#### Health Check
```bash
curl https://nlistplanet-usm-v8dc.onrender.com/api/health
```

**Reference:** [backend/RENDER_AUTODEPLOY.md](UnlistedHub-USM/backend/RENDER_AUTODEPLOY.md)

### 🌐 Frontend Deployment (Vercel)

#### Desktop Frontend

**Repository:** `UnlistedHub-USM/frontend`  
**Domain:** https://nlistplanet.com

**Vercel Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": "create-react-app"
}
```

**Environment Variables:**
```env
REACT_APP_API_URL=https://nlistplanet-usm-v8dc.onrender.com/api
CI=false                    # Ignore build warnings
GENERATE_SOURCEMAP=false    # No source maps in production
```

#### Mobile Frontend

**Repository:** `nlistplanet-mobile/frontend`  
**Domain:** https://mobile.nlistplanet.com

**Same Vercel config as desktop**

#### Auto-Deploy
- Vercel automatically deploys on push to `main` branch
- Preview URLs for pull requests: `*.vercel.app`
- CORS is configured to allow `*.vercel.app` in backend

### 🔧 CORS Configuration

**Backend:** `backend/server.js`
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGINS.split(','), // From .env
  credentials: true
};

// Whitelist includes:
// - http://localhost:3000 (dev)
// - https://nlistplanet.com (desktop prod)
// - https://mobile.nlistplanet.com (mobile prod)
// - *.vercel.app (preview deploys)
```

---

## 10. Testing & Validation

### 🧪 No Automated Tests

This project uses **manual testing only**:
1. Postman/Insomnia for API endpoints
2. Manual browser testing for UI
3. Ad-hoc test scripts for backend

### 📝 Backend Test Scripts

**From `backend/` directory:**

```bash
# Test admin API endpoints
node test-admin-api.js

# Test OpenAI integration
node test-openai.js

# Test SMS service
node test-sms.js

# Test database updates
node test-update.js
```

### 🔍 Testing Checklist

#### Authentication
- [ ] Register with valid alphanumeric password (12+ chars)
- [ ] Login with correct credentials
- [ ] Verify rate limiting (20 req/15min on auth endpoints)
- [ ] Check JWT token in localStorage
- [ ] Verify 30-min inactivity logout

#### Listings
- [ ] Create SELL listing → verify price display
- [ ] Create BUY listing → verify price display
- [ ] Verify own listings are hidden from marketplace
- [ ] Check boost feature (premium placement)

#### Bidding
- [ ] Place bid on SELL listing → verify seller sees `bid × 0.98`
- [ ] Place offer on BUY listing → verify buyer sees `offer × 1.02`
- [ ] Test counter offer flow (max 4 rounds)
- [ ] Verify both accept → moves to admin queue

#### Admin
- [ ] Login as admin (role: 'admin')
- [ ] View deal closure queue
- [ ] Approve KYC documents
- [ ] Manual transaction closure
- [ ] Portfolio update post-deal

#### Security
- [ ] Verify Helmet headers in response (CSP, HSTS, X-Frame-Options)
- [ ] Test rate limiting (trigger 300 req/15min global limit)
- [ ] Attempt NoSQL injection (should be sanitized)
- [ ] Check audit logs for auth events

### 🐛 Debugging Tips

**Backend Logs:**
```bash
# Check Render logs
https://dashboard.render.com → Select service → Logs

# Look for:
[AUTH_AUDIT] login_success
[AUTH_AUDIT] login_failed
[ERROR] ...
```

**Frontend Debugging:**
```javascript
// Check AuthContext state
import { useAuth } from './context/AuthContext';
const { user, isAuthenticated } = useAuth();
console.log('User:', user);

// Check API calls
import axios from 'axios';
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);
```

---

## 11. Troubleshooting

### ⚠️ Common Issues

#### Issue: "Platform fee showing to users"
**Cause:** Using manual calculation instead of helper functions  
**Fix:** Always use `calculateBuyerPays()` / `calculateSellerGets()` from helpers

#### Issue: "CORS error on API calls"
**Cause:** Frontend domain not whitelisted  
**Fix:** Add domain to `CORS_ORIGINS` in backend `.env`:
```env
CORS_ORIGINS=http://localhost:3000,https://new-domain.vercel.app
```
Redeploy backend.

#### Issue: "JWT token expired"
**Cause:** 30-min inactivity timeout  
**Fix:** This is expected behavior. User must re-login.

#### Issue: "Rate limit exceeded"
**Cause:** Too many requests from same IP  
**Fix:** Wait 15 minutes or change IP. For development, increase limits in `server.js`:
```javascript
// Development only:
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000  // Increased from 300
});
```

#### Issue: "Password validation failed"
**Cause:** Using special characters  
**Fix:** Use only alphanumeric (A-Z, a-z, 0-9). Min 12 chars, must have upper+lower+number.

#### Issue: "Company field showing as undefined"
**Cause:** Using legacy `CompanyName` field  
**Fix:** Always use `company.name` (not `company.CompanyName`)

#### Issue: "Backend changes not affecting mobile"
**Cause:** Mobile frontend using old API URL  
**Fix:** Check `nlistplanet-mobile/frontend/.env`:
```env
REACT_APP_API_URL=https://nlistplanet-usm-v8dc.onrender.com/api
```

### 🔧 Development Mode Debugging

**Enable detailed errors:**
```javascript
// backend/server.js
// Change:
const NODE_ENV = 'development';

// Will show stack traces in error responses
```

**Check MongoDB connection:**
```javascript
// backend/server.js
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});
```

### 📞 Support & Documentation

**Additional References:**
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — AI agent guide
- [backend/SECURITY_FEATURES.md](UnlistedHub-USM/backend/SECURITY_FEATURES.md) — Security details
- [backend/USERNAME_HISTORY_GUIDE.md](UnlistedHub-USM/backend/USERNAME_HISTORY_GUIDE.md) — Username changes

---

## 🎓 Developer Quick Reference

### 🔑 Key Principles

1. **Hidden Platform Fee** — Never expose 2% fee in UI
2. **Unified Backend** — Backend changes affect BOTH apps
3. **Alphanumeric Passwords** — No special chars (12+ length)
4. **Anonymous Trading** — Use `@trader_xxx` usernames
5. **Admin-Mediated** — Manual transaction closure
6. **Security First** — Rate limiting, Argon2id, CSP headers
7. **ES Modules Only** — No `require()`, use `import/export`

### 📐 Code Patterns

**API Route:**
```javascript
// backend/routes/myFeature.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/data', protect, async (req, res) => {
  try {
    const data = await MyModel.find({ userId: req.user._id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
```

**Frontend API Call:**
```javascript
// frontend/src/utils/api.js
export const myFeatureAPI = {
  getData: async () => {
    const response = await api.get('/api/myfeature/data');
    return response.data;
  }
};
```

**Price Display:**
```javascript
// frontend/src/components/ListingCard.jsx
import { calculateBuyerPays, calculateSellerGets } from '../utils/helpers';

const ListingCard = ({ listing, isOwner }) => {
  const displayPrice = listing.type === 'sell'
    ? (isOwner ? listing.price : calculateBuyerPays(listing.price))
    : (isOwner ? listing.price : calculateSellerGets(listing.price));
    
  return <div>₹{displayPrice.toFixed(2)}/share</div>;
};
```

### 🚫 Critical Don'ts

1. ❌ **Never expose platform fee** in UI text
2. ❌ **Never use `require()`** — Backend is ES modules only
3. ❌ **Never weaken password hashing** — Argon2id is mandatory
4. ❌ **Never bypass rate limiting** — Security critical
5. ❌ **Never assume `CompanyName`** — Use `company.name`
6. ❌ **Never commit `.env`** — Secrets stay local
7. ❌ **Never ignore CORS** — Backend changes affect both frontends

### 🎯 Mobile-Specific Helpers

**File:** `nlistplanet-mobile/frontend/src/utils/helpers.js`

```javascript
// Haptic feedback (mobile only)
export const haptic = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(20),
  heavy: () => navigator.vibrate?.(50),
  success: () => navigator.vibrate?.([10, 50, 10]),
  error: () => navigator.vibrate?.([50, 100, 50])
};

// Trigger with type
export const triggerHaptic = (type = 'light') => {
  if (haptic[type]) haptic[type]();
};

// Format large numbers
export const formatShortNumber = (num) => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} L`;
  return num.toLocaleString('en-IN');
};
```

---

**End of Master Documentation**

*For questions or updates, contact the development team.*

**Last Updated:** December 14, 2025  
**Document Version:** 2.0.0
