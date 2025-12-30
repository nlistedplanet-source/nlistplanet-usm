# 📚 NListPlanet - Master Documentation

**Version:** 2.1.0 (Consolidated - December 25, 2025)  
**Last Updated:** December 25, 2025  
**Project:** P2P Unlisted Shares Trading Platform  
**Architecture:** Unified Backend + Dual Frontend (Desktop + Mobile PWA)

---

## 📖 Table of Contents

1. [Quick Start & Overview](#1-quick-start--overview)
2. [Architecture (Unified Backend Model)](#2-architecture-unified-backend-model)
3. [Security & Authentication](#3-security--authentication)
4. [Platform Fee Model & Business Logic](#4-platform-fee-model--business-logic)
5. [Development Workflows](#5-development-workflows)
6. [Daily Developer Workflows & Scripts](#6-daily-developer-workflows--scripts)
7. [Feature Implementation Guides](#7-feature-implementation-guides)
8. [API Reference](#8-api-reference)
9. [Database Models & Schemas](#9-database-models--schemas)
10. [UI/UX Modernization & Components](#10-uiux-modernization--components)
11. [Cloudinary Setup (KYC & Images)](#11-cloudinary-setup-kyc--images)
12. [Testing & Validation](#12-testing--validation)
13. [Deployment Guide](#13-deployment-guide)
14. [Troubleshooting](#14-troubleshooting)
15. [New Tools & Dependencies](#15-new-tools--dependencies)

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

### 💰 Core Business Rule: 2% Brokerage Fee (Hidden from Users)

**Platform acts as a broker and charges exactly 2% brokerage on ALL transactions.**

> ⚠️ **CRITICAL: Platform fee is ALWAYS 2%, NEVER 4%!**
> - Only ONE side pays the fee depending on who created the listing
> - The fee is NEVER shown explicitly to users

---

### 🎯 Core Price Model (MEMORIZE THIS!)

| Listing Type | Who Created | Who Pays Fee | Formula |
|--------------|-------------|--------------|---------|
| **SELL** | Seller | **Buyer** pays extra 2% | Buyer = Price × 1.02, Seller = Price |
| **BUY** | Buyer | **Seller** gives up 2% | Buyer = Price, Seller = Price × 0.98 |

**Key Principle:** The person who ACCEPTS (not creates) the listing pays the platform fee indirectly.

---

### 📊 Price Calculation Examples

#### Scenario 1: SELL Listing - Seller wants ₹28/share

**Seller Creates SELL Listing:**
```
Seller enters: ₹28/share (what they want to receive)

System calculates:
┌─────────────────────────────────────────┐
│  agreedPrice         = ₹28.00           │
│  sellerReceivesPrice = ₹28.00  (100%)   │  ← Seller gets FULL asking price
│  buyerOfferedPrice   = ₹28.56  (102%)   │  ← Buyer pays 2% extra
│  platformFee         = ₹0.56   (2%)     │
└─────────────────────────────────────────┘
```

**What Users See:**
- Seller (in My Posts): "Your Selling Price: ₹28/share"
- Buyer (in Marketplace): "Price: ₹28.56/share" (what they'll pay)

**Money Flow:**
```
Buyer pays ₹28.56 → Platform takes ₹0.56 → Seller gets ₹28.00
```

---

#### Scenario 2: BUY Listing - Buyer's budget is ₹25/share

**Buyer Creates BUY Listing:**
```
Buyer enters: ₹25/share (their maximum budget)

System calculates:
┌─────────────────────────────────────────┐
│  agreedPrice         = ₹25.00           │
│  buyerOfferedPrice   = ₹25.00  (100%)   │  ← Buyer pays their budget
│  sellerReceivesPrice = ₹24.50  (98%)    │  ← Seller gets 2% less
│  platformFee         = ₹0.50   (2%)     │
└─────────────────────────────────────────┘
```

**What Users See:**
- Buyer (in My Posts): "Your Buying Price: ₹25/share"
- Seller (in Marketplace): "Price: ₹24.50/share" (what they'll receive)

**Money Flow:**
```
Buyer pays ₹25.00 → Platform takes ₹0.50 → Seller gets ₹24.50
```

---

### 🔢 Database Fields Explained

```javascript
// In Listing.bids[] and Listing.offers[]
{
  price: Number,              // Original entered price (agreedPrice)
  buyerOfferedPrice: Number,  // What buyer actually pays
  sellerReceivesPrice: Number,// What seller actually receives
  platformFee: Number,        // Platform's 2% cut
}
```

**Calculation Logic in Code:**
```javascript
// SELL Listing: Seller sets price, Buyer pays extra
if (listing.type === 'sell') {
  sellerReceivesPrice = price;        // Seller gets asking price
  buyerOfferedPrice = price * 1.02;   // Buyer pays +2%
  platformFee = price * 0.02;         // 2% of base price
}

// BUY Listing: Buyer sets budget, Seller gets less
if (listing.type === 'buy') {
  buyerOfferedPrice = price;          // Buyer pays their budget
  sellerReceivesPrice = price * 0.98; // Seller gets -2%
  platformFee = price * 0.02;         // 2% of base price
}
```

---

### 📏 Price Display Rules

| Listing Type | Owner Sees | Others See |
|--------------|------------|------------|
| SELL (₹100) | ₹100 (Your Price) | ₹102 (Buyer Pays) |
| BUY (₹100) | ₹100 (Your Budget) | ₹98 (Seller Gets) |

**What is NEVER Shown to Users:**
- ❌ "Platform Fee", "Brokerage", "Commission" text
- ❌ Fee calculation breakdown
- ❌ 2% percentage anywhere
- ❌ "After fee" or "Before fee" labels

**Admin Dashboard Shows Full Breakdown:**
```
Deal Details (Admin Only):
┌──────────────────────────────────────┐
│  Agreed Price:     ₹28.00 × 1000     │
│  Buyer Pays:       ₹28,560.00        │
│  Seller Receives:  ₹28,000.00        │
│  Platform Fee:     ₹560.00 (2%)      │
└──────────────────────────────────────┘
```

---

### 🛠️ Helper Functions

**Frontend:** `frontend/src/utils/helpers.js`
```javascript
// Calculate what buyer pays (for SELL listings)
export const calculateBuyerPays = (price) => {
  return price * 1.02;
};

// Calculate what seller receives (for BUY listings)
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

---

### ⚠️ Common Mistakes to Avoid

```javascript
// ❌ WRONG: Charging both sides = 4% fee
sellerReceivesPrice = price * 0.98;  // Seller loses 2%
buyerOfferedPrice = price * 1.02;    // Buyer pays 2% more
// This results in 4% platform fee!

// ✅ CORRECT: Only one side pays
// For SELL listing:
sellerReceivesPrice = price;         // Seller gets full price
buyerOfferedPrice = price * 1.02;    // Buyer pays 2% extra
platformFee = price * 0.02;          // 2% fee

// For BUY listing:
buyerOfferedPrice = price;           // Buyer pays their budget
sellerReceivesPrice = price * 0.98;  // Seller gets 2% less
platformFee = price * 0.02;          // 2% fee
```

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

### 📊 Counter History Table (My Posts - Seller View)

**Location:** `MyPostCard.jsx` - Counter History sub-table in bid expansion

**Critical Implementation Details:**

**Table Structure:**
| Round | Buyer Price | Your Price | Qty | Date |
|-------|-------------|------------|-----|------|

**Price Tracking Logic (IMPORTANT - DO NOT MODIFY):**
```javascript
// Initialize with original bid price (never changes)
let currentBuyerPrice = getVisibleToOwner(bid.price, oppositeParty);
let currentSellerPrice = null;

// Iterate through counterHistory
bid.counterHistory.forEach((counter, idx) => {
  // Capture prices for THIS SPECIFIC round BEFORE updating
  let roundBuyerPrice = currentBuyerPrice;
  let roundSellerPrice = currentSellerPrice;
  
  if (counter.by === oppositeParty) {
    // Buyer countered - update buyer price FOR THIS ROUND
    roundBuyerPrice = getVisibleToOwner(counter.price, oppositeParty);
    currentBuyerPrice = roundBuyerPrice; // Update for NEXT rounds
  } else {
    // Seller countered - update seller price FOR THIS ROUND
    roundSellerPrice = getVisibleToOwner(counter.price, counter.by);
    currentSellerPrice = roundSellerPrice; // Update for NEXT rounds
  }
  
  // Push with round-specific prices
  rounds.push({
    buyerPrice: roundBuyerPrice, // Fixed for this round
    sellerPrice: roundSellerPrice // Fixed for this round
  });
});
```

**Why This Matters:**
- ✅ Each round shows the EXACT prices that were valid at that moment
- ✅ Round 1 always shows original buyer bid (never changes)
- ✅ If buyer counters in Round 2, Round 1 still shows original bid
- ✅ Prevents price "leakage" between rounds
- ❌ WRONG: Updating shared variable and using it for all rounds
- ❌ WRONG: Using `buyerPrice` directly without round-specific capture

**Helper Function:**
```javascript
// Component-level helper (used by both table and counter info)
const getVisibleToOwner = (price, by) => {
  return getNetPriceForUser({ price }, listing.type, true, by);
};
```

**Color Coding:**
- Buyer Price: `text-blue-700` 
- Your Price: `text-purple-700`

**Last Updated:** December 30, 2025 (Fixed Round 1 price mutation bug)

---
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

## 12. Recent Fixes & Implementation Details

### 12.1 Marketplace Date Display Fix (Dec 17, 2025)

**Problem:** All marketplace cards showed hardcoded "21 Nov" instead of actual listing dates.

**Solution:**
- **File:** `UnlistedHub-USM/frontend/src/components/MarketplaceCard.jsx`
  - Added `createdAt` prop to component parameters
  - Replaced hardcoded date with dynamic formatting: `new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })`
  
- **File:** `UnlistedHub-USM/frontend/src/pages/DashboardPage.jsx`
  - Pass `listing.createdAt` to MarketplaceCard component

**Result:** Each listing now displays its actual creation date (e.g., "15 Dec", "1 Jan")

**Commits:** 
- `2b49e32` - Fixed hardcoded date
- `4ce44bd` - Added missing createdAt prop

---

### 12.2 Accepted Deals Display Fix (Dec 17, 2025)

**Problem:** Accepted PPFAS deal showing incorrect status, price, and missing from Recent Activity.

**Root Cause:** Mongoose schema missing `pending_confirmation` and `deal_pending` enum values.

**Solution:**
1. **Schema Fix** (`UnlistedHub-USM/backend/models/Listing.js`):
   ```javascript
   // Line 43: Bid status enum
   status: {
     type: String,
     enum: ['pending', 'pending_confirmation', 'accepted', 'rejected', 'countered'],
     default: 'pending'
   }
   
   // Line 148: Listing status enum
   status: {
     type: String,
     enum: ['active', 'inactive', 'completed', 'cancelled', 'deal_pending'],
     default: 'active'
   }
   ```

2. **Desktop UI** (`UnlistedHub-USM/frontend/src/components/dashboard/MyBidsOffersTab.jsx`):
   - Shows "✅ You Accepted" for `pending_confirmation` status
   - Green 4px left border for accepted deals
   - Green status badge
   - Uses `buyerOfferedPrice` for correct pricing

3. **Mobile UI** (`nlistplanet-mobile/frontend/src/pages/trading/BidsPage.jsx`):
   - Same updates as desktop for consistency

**Color Coding System:**
- 🟢 Green: Accepted (pending_confirmation)
- 🟢 Emerald: Confirmed (both parties accepted)
- 🔴 Red: Rejected
- 🟣 Purple: Counter Offers
- 🟡 Amber: Action Required
- ⚪ Gray: Expired

**Testing:** Manual DB update of one PPFAS bid (ID: `69421923d7b34f9e60c4e945`) to `pending_confirmation` proved fix works correctly.

**Commits:** `acb383f` - Schema enum fix

---

### 12.3 Two-Step Accept Flow (Unified)

**Current Status:** When buyer clicks "Accept" from marketplace:

1. **Step 1:** Bid created with status `pending_confirmation`, listing becomes hidden
2. **Step 2:** Seller accepts → status becomes `confirmed`, verification codes generated
3. **Step 3:** Admin manually closes transaction

**Key Files:**
- `UnlistedHub-USM/backend/routes/listings.js` - Accept endpoints
- `UnlistedHub-USM/backend/routes/portfolio.js` - Recent activity tracking
- Desktop: `UnlistedHub-USM/frontend/src/components/dashboard/MyBidsOffersTab.jsx`
- Mobile: `nlistplanet-mobile/frontend/src/pages/trading/BidsPage.jsx`

**Dashboard Display Rules:**
- **Buyer (who accepted):** "✅ You Accepted" + green border
- **Seller (waiting):** "Seller's Turn" + amber badge
- **Both accepted:** "✅ Confirmed" + emerald badge + verification codes

**Price Display Logic:**
- SELL listing owner: sees base price
- SELL listing viewers: see buyer-pays price (base × 1.02)
- BUY listing owner: sees base price
- BUY listing viewers: see seller-gets price (base × 0.98)

---

### 12.4 Complete Deal Acceptance Flow (Dec 29, 2025)

**Detailed Step-by-Step Flow:**

#### Phase 1: Buyer Accepts Deal

```
┌────────────────────────────────────────────────────────────────┐
│  BUYER CLICKS "ACCEPT"                                          │
├────────────────────────────────────────────────────────────────┤
│  1. Bid status → 'pending_confirmation' or 'accepted'          │
│  2. Listing status → 'deal_pending' (hidden from marketplace)  │
│  3. Seller receives push notification                          │
└────────────────────────────────────────────────────────────────┘

Buyer's Dashboard (My Bids Tab):
┌─────────────────────────────────────────────────────────────────┐
│  Action By: ✅ You Accepted                                     │
│  Status: "Accepted - Waiting for Seller's Acceptance"           │
│  Border: Green left border                                      │
│  Tab: STAYS in Active tab (NOT moved to History)               │
└─────────────────────────────────────────────────────────────────┘
```

#### Phase 2: Seller Gets Notification

```
Seller's View:
┌─────────────────────────────────────────────────────────────────┐
│  1. Push notification: "Buyer accepted your deal!"              │
│  2. Action Center shows pending action                         │
│  3. My Posts tab shows "Buyer Accepted - Your Confirmation      │
│     Needed" section with green pulsing border                   │
│  4. "ACTION REQUIRED" badge visible on card                    │
└─────────────────────────────────────────────────────────────────┘
```

#### Phase 3: Seller Accepts Deal

```
┌────────────────────────────────────────────────────────────────┐
│  SELLER CLICKS "CONFIRM"                                        │
├────────────────────────────────────────────────────────────────┤
│  1. Bid status → 'confirmed'                                   │
│  2. Deal record created with verification codes                │
│  3. Buyer receives push notification: "Deal Confirmed!"         │
│  4. Admin sees deal in Final Deals                             │
└────────────────────────────────────────────────────────────────┘

Both Dashboards Now Show:
┌─────────────────────────────────────────────────────────────────┐
│  Status: 🎉 "Deal Confirmed by Both Parties"                   │
│  Border: Emerald green                                         │
│  VIEW CODE button appears → Opens verification codes           │
│  Tab: STAYS in Active tab until admin action                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Phase 4: Admin Final Action

```
Admin marks deal as: completed / cancelled / on-hold
┌─────────────────────────────────────────────────────────────────┐
│  1. Bid status → 'completed' / 'cancelled'                     │
│  2. Listing status → 'completed' / 'cancelled'                 │
│  3. Deal moves to buyer/seller's History tab                   │
│  4. Both parties notified                                      │
└─────────────────────────────────────────────────────────────────┘
```

#### Status Tab Rules (IMPORTANT!)

| Status | Tab Location | Reason |
|--------|--------------|--------|
| `pending` | Active | Awaiting response |
| `countered` | Active | Negotiation ongoing |
| `pending_confirmation` | Active | Buyer accepted, seller pending |
| `accepted` | Active | Buyer accepted, seller pending |
| `confirmed` | **Active** | Both confirmed, admin pending |
| `completed` | History | Admin marked complete |
| `cancelled` | History | Admin/user cancelled |
| `rejected` | History | Offer declined |
| `expired` | History | Timeout |
| `sold` | History | Transaction complete |

#### Desktop Files Modified:
- `MyBidsOffersTab.jsx` - `activeStatuses` array includes `accepted`, `confirmed`
- `MyPostsTab.jsx` - Added Active/History toggle
- `MyPostCard.jsx` - Green pulse animation when action required

#### Mobile Files Modified:
- `BidsPage.jsx` - Same status flow as desktop
- `MyPostsPage.jsx` - Active/History toggle added

**Key Code Pattern:**
```javascript
// Statuses that stay in Active tab
const activeStatuses = [
  'pending', 
  'pending_confirmation', 
  'countered', 
  'pending_seller_confirmation', 
  'accepted',    // ← Buyer accepted, stays visible
  'confirmed'    // ← Both confirmed, stays until admin action
];

// Statuses that move to History tab
const expiredStatuses = [
  'rejected', 
  'expired', 
  'completed',   // ← Only after admin marks complete
  'cancelled', 
  'sold', 
  'rejected_by_seller'
];
```

---

### 12.4 Admin Accepted Deals Management

**Admin Dashboard Features:**
- View all accepted deals (status: `pending_confirmation`, `confirmed`)
- See both buyer and seller details (identity revealed to admin only)
- Generate verification codes for confirmed deals
- Close/complete transactions manually
- Track deal timeline and status changes

**Admin Routes:** `/api/admin/accepted-deals`

**Access Control:** 
- Requires `protect` + `authorize(['admin'])` middleware
- Admin username: `@nlistplanet_admin`

---

### 12.5 Marketplace Accept Flow (Complete)

**Buyer Flow (Accepting from Marketplace):**

1. Browse marketplace → Find PPFAS sell listing at ₹16,500
2. Click green "Accept" button
3. Backend creates bid with:
   - `status: 'pending_confirmation'`
   - `buyerOfferedPrice: 16830` (16500 × 1.02)
   - `sellerReceivesPrice: 16170` (16500 × 0.98)
   - `platformFee: 330`
   - `buyerAcceptedAt: Date.now()`
4. Listing hidden from marketplace (status changes to `deal_pending`)
5. Notification sent to seller: "New bid accepted on your PPFAS listing"
6. My Bids tab shows:
   - Green left border (4px)
   - "✅ You Accepted" in Action By
   - Price: ₹16,830 (buyer pays)
   - Status: "✅ Accepted"
7. Recent Activity: "You accepted a bid on PPFAS"

**Seller Flow (Receiving Acceptance):**

1. Dashboard notification: "Divyansh accepted your PPFAS listing"
2. My Listings shows:
   - Hidden from marketplace
   - Bid with "Seller's Turn" amber badge
   - Price: ₹16,500 (seller receives)
3. Click "Accept" → Bid status becomes `confirmed`
4. Verification codes generated (buyer + seller codes)
5. Both parties can see codes in their dashboards
6. Admin closes transaction manually after verification

**Files Modified:**
- Desktop: `UnlistedHub-USM/frontend/src/components/MarketplaceCard.jsx`
- Desktop: `UnlistedHub-USM/frontend/src/pages/DashboardPage.jsx`
- Backend: `UnlistedHub-USM/backend/routes/listings.js`
- Backend: `UnlistedHub-USM/backend/routes/portfolio.js`

---

### 12.6 ShareCard Generator Updates

**Purpose:** Generate investment highlight cards for social sharing.

**Components (Update BOTH):**
- Desktop: `UnlistedHub-USM/frontend/src/components/ShareCardGenerator.jsx`
- Mobile: `nlistplanet-mobile/frontend/src/components/ShareCardGenerator.jsx`

**Technology:** Uses `html2canvas` to render company logo + metrics into shareable image.

**When Making Changes:** Always update both desktop and mobile versions to maintain feature parity.

---

### 12.7 AI News Features (Inshorts-Style)

**Automated Pipeline:**
- Runs every 30 minutes via `UnlistedHub-USM/backend/utils/newsScheduler.js`
- Generates Hindi summaries (40-60 words) using GPT-4
- Creates DALL-E 3 images for news without thumbnails
- Stores in MongoDB `News` collection

**Manual Admin Controls:**
- Process AI summaries: `POST /api/admin/news-ai/process-ai`
- Batch process: `POST /api/admin/news-ai/batch-process-ai`
- Generate image: `POST /api/admin/news-ai/generate-image`
- Generate Hindi: `POST /api/admin/news-ai/generate-hindi`

**Environment Required:**
- `OPENAI_API_KEY` - For GPT-4 and DALL-E 3
- `CLOUDINARY_*` - Optional, for permanent image storage

**Files:**
- `UnlistedHub-USM/backend/utils/newsAI.js` - Core AI logic
- `UnlistedHub-USM/backend/routes/adminNewsAI.js` - Admin endpoints

---

### 12.8 Username History Tracking

**Purpose:** Track all username changes for users.

**Model:** `UnlistedHub-USM/backend/models/UsernameHistory.js`

**Schema:**
```javascript
{
  userId: ObjectId,
  oldUsername: String,
  newUsername: String,
  changedAt: Date,
  changedBy: 'user' | 'admin'
}
```

**Migration Script:** `node scripts/migrateUsernameHistory.js`

**Usage:** Admin can view user's complete username history for support/verification.

---

### 12.9 Marketplace Accept Endpoint Fix (Dec 17, 2025)

**Critical Bug Fixed:** Marketplace "Accept" button was creating normal bids instead of accepted bids.

**Root Cause:**
- Frontend `handleAccept` called `/listings/:id/bid` endpoint
- This created bids with status `pending` (normal bid flow)
- Users saw "You (Bid)" instead of "✅ You Accepted"
- Listing stayed visible in marketplace

**Solution - New Endpoint:** `POST /api/listings/:id/accept`

**Backend Implementation** (`routes/listings.js`):
```javascript
router.post('/:id/accept', protect, async (req, res, next) => {
  // Creates bid with:
  // - status: 'pending_confirmation' ← KEY DIFFERENCE
  // - buyerAcceptedAt: Date.now()
  // - Changes listing.status to 'deal_pending' (hides from marketplace)
  // - Sends 'deal_accepted' notification to seller
  // - Uses listing's price and quantity (no negotiation)
});
```

**Frontend Changes:**

1. **API Method** (`utils/api.js`):
   ```javascript
   acceptListing: (id) => axios.post(`/listings/${id}/accept`)
   ```

2. **UI Handler** (`pages/DashboardPage.jsx`):
   ```javascript
   const handleConfirmPurchase = async () => {
     await listingsAPI.acceptListing(listingToAccept._id);
     // Refreshes My Bids automatically
   };
   ```

**Result:**
- ✅ OYO Rooms accept now creates `pending_confirmation` bid
- ✅ Shows "✅ You Accepted" with green border immediately
- ✅ Listing hidden from marketplace
- ✅ Seller gets notification
- ✅ No manual database fixes needed

**Commit:** `2a882c6` - Complete marketplace accept flow fix

---

### 12.10 Known Issues & Pending Items

#### Fixed ✅
- ✅ Marketplace date showing hardcoded "21 Nov" (commits: 2b49e32, 4ce44bd)
- ✅ Accepted deals not showing "You Accepted" (commit: acb383f)
- ✅ Wrong price display (₹16,500 vs ₹16,830)
- ✅ Mongoose validation error for `pending_confirmation` (commit: acb383f)
- ✅ Company creation with logo URL failing
- ✅ **Marketplace Accept creating wrong bid status** (commit: 2a882c6)
- ✅ **500 error on accept/bid despite successful operation** (commit: 5af2782)
  - Root cause: Notification calls were awaited, throwing errors when FCM/Firebase fails
  - Fix: Made all `createAndSendNotification` calls non-blocking with `.catch()` handlers
  - Impact: Accept/bid now always returns success, notifications fail silently
- ✅ **Undefined function call after accept** (commit: 9c60b62)
  - Root cause: `handleConfirmPurchase` called `fetchMyBidsOffers()` which doesn't exist
  - Fix: Replaced with `setRefreshTrigger(prev => prev + 1)` to refresh dashboard
  - Impact: Accepted deals now properly appear in "My Bids" tab immediately
- ✅ **Buyer seeing seller's price instead of buyer's price** (commit: 161fb4a)
  - Root cause: Negotiation table showing `activity.originalPrice` (₹1900) instead of `buyerOfferedPrice` (₹1938)
  - Fix: Show `buyerOfferedPrice` for bids, `sellerReceivesPrice` for offers in Round 1 row
  - Impact: Buyers now see correct price with 2% platform fee included (₹1900 × 1.02 = ₹1938)

#### Pending 🔄
- 🔄 Render auto-deployment (schema fix + accept endpoint)
- 🔄 Mobile PWA: Add same accept endpoint
- 🔄 Test full flow with real seller accepting back

#### Notes
- Old bids (PPFAS, Hero Motors) created before fix will remain 'pending'
- New marketplace accepts will work correctly
- Mobile app needs same `/accept` endpoint implementation

---

**End of Master Documentation**

*For questions or updates, contact the development team.*

**Last Updated:** December 28, 2025  
**Document Version:** 2.3.0

---

## Appendix A: Push Notifications System

### Overview
Real-time push notification system using Firebase Cloud Messaging (FCM) for instant notifications on bid, counter offer, accept, and reject actions.

### Backend Implementation

**Core Module:** `backend/utils/pushNotifications.js`

**Key Functions:**
- `sendPushNotification(userId, payload)` - Sends FCM push to all user devices
- `createAndSendNotification(userId, data)` - Creates in-app + sends push (non-blocking)
- `NotificationTemplates` - Predefined templates for all notification types

**User Model FCM Support:**
```javascript
fcmTokens: [String],  // Multiple devices per user
notificationPreferences: {
  pushEnabled: Boolean,
  bidNotifications: Boolean,
  offerNotifications: Boolean,
  dealNotifications: Boolean
}
```

**Token Management:**
- `POST /api/notifications/register-token` - Register FCM token
- `DELETE /api/notifications/remove-token` - Remove token
- Automatic invalid token cleanup

**Testing:**
```bash
node test-push-notification.js <username>
node scripts/checkUserTokenDebug.js <username>
```

### Frontend Integration

**Firebase Config:** `src/config/firebase.js`
**Service Workers:**
- Desktop: `public/firebase-messaging-sw.js`
- Mobile: `public/firebase-messaging-sw.js`

**Token Registration Flow:**
1. Request notification permission
2. Get FCM token from Firebase
3. Send token to backend via `/api/notifications/register-token`
4. Backend stores in `user.fcmTokens[]`

---

## Appendix B: Referral & Share Tracking System

### Architecture

**Share Link Generation:**
```
https://nlistplanet.com/listing/{listingId}?ref={shareId}
```

**Tracking Metrics:**
- Views (unique by IP)
- Clicks
- Conversions (completed transactions)
- Earnings (1% of platform fee on conversions)

**Models:**
- `ShareTracking` - Track individual share links
- `ReferralTracking` - User referral statistics

**API Endpoints:**
```
POST   /api/share/create           - Create share link
GET    /api/share/track/:shareId   - Track click/view
GET    /api/share/my-shares        - User's shares
GET    /api/admin/referrals        - Admin analytics
```

**Referral Rewards:**
- Platform Fee: 2% of transaction
- Referral Reward: 50% of fee = 1% of transaction
- Example: ₹1,00,000 deal → ₹1,000 referral reward

---

## Appendix C: Deployment Guide

### Vercel (Frontends)

**Desktop:** `UnlistedHub-USM/frontend`
- Build: `npm run build`
- Output: `build/`
- Framework: Create React App (React 18)

**Mobile:** `nlistplanet-mobile/frontend`
- Build: `npm run build`
- Output: `build/`
- Framework: Create React App (React 19)

**Manual Deploy:**
```powershell
cd UnlistedHub-USM/frontend
npx vercel --prod

cd ../../nlistplanet-mobile/frontend  
npx vercel --prod
```

**Auto-Deploy Setup:**
1. Vercel Dashboard → Project → Settings → Git
2. Connect to repo: `nlistedplanet-source/nlistplanet-usm`
3. Root Directory: `UnlistedHub-USM/frontend` (or `nlistplanet-mobile/frontend`)
4. Production Branch: `main`
5. Build Command: Auto-detected
6. Install Command: `npm install --legacy-peer-deps`

### Render (Backend)

**Service:** `nlistplanet-usm-api`
- Start Command: `node server-fast.js`
- Build: `npm ci --omit=dev --ignore-scripts`
- Region: Oregon (Free Tier)
- Auto-Deploy: Push to `main` branch

**Health Check:** `https://nlistplanet-usm-v8dc.onrender.com/api/health`

**render.yaml Config:**
```yaml
services:
  - type: web
    name: nlistplanet-usm-api
    env: node
    startCommand: node server-fast.js
    buildCommand: npm ci --omit=dev --ignore-scripts
    healthCheckPath: /api/health
```

---

## 6. Daily Developer Workflows & Scripts

### 🚀 Starting Development

```powershell
# Backend Start (Terminal 1)
cd UnlistedHub-USM/backend
node scripts/validateEnv.js    # ⚠️ Always check environment first
npm run dev                     # Start backend with auto-reload

# Desktop Frontend (Terminal 2) 
cd UnlistedHub-USM/frontend
npm start                       # Opens at http://localhost:3000

# Mobile PWA (Terminal 3) - if needed
cd nlistplanet-mobile/frontend
$env:PORT='3001'; npm start     # Opens at http://localhost:3001
```

### 🧪 Testing Before Git Push

```powershell
# Backend Tests
cd UnlistedHub-USM/backend
node scripts/quickTest.js       # Quick API sanity check

# Frontend Build Test
cd UnlistedHub-USM/frontend
npm run build                   # Make sure build works

# Mobile Build Test
cd nlistplanet-mobile/frontend
npm run build
```

### 🔧 Essential Development Scripts

**User Management:**
- `node scripts/createAdmin.js` - Create admin user
- `node scripts/makeUserAdmin.js` - Promote user to admin
- `node scripts/checkAllUsers.js` - List all users

**Company Management:**
- `node scripts/seedCompanies.js` - Populate companies
- `node scripts/checkCompanyStatus.js` - Verify companies
- `node scripts/generateCompanyHighlights.js` - Generate AI highlights

**News Management:**
- `node scripts/fetchNews.js` - Fetch latest news manually
- `node test-openai.js` - Test OpenAI integration

**Testing & Debugging:**
- `node scripts/validateEnv.js` - Validate .env configuration
- `node scripts/quickTest.js` - Quick API tests
- `node scripts/checkDatabase.js` - Check DB schemas
- `node test-push-notification.js <username>` - Send test notification
- `node scripts/checkUserTokenDebug.js <username>` - Debug FCM tokens

### 🐛 Common Debug Commands

```powershell
# Check if ports are occupied
netstat -ano | findstr :5000   # Backend port
netstat -ano | findstr :3000   # Desktop frontend
netstat -ano | findstr :3001   # Mobile frontend

# Kill all Node processes
Stop-Process -Name "node" -Force

# Check MongoDB connection
cd UnlistedHub-USM/backend
node scripts/checkDatabase.js
```

---

## 7. Feature Implementation Guides

### KYC & Document Verification Flow

1. User starts KYC from profile settings
2. Frontend calls `/api/kyc/upload` endpoints for each document
3. Backend validates, uploads to Cloudinary, stores URL in `User.kycDocuments`
4. Admin reviews documents and sets `kycStatus` (pending → verified/rejected)
5. User gets notified of KYC status

### Portfolio & Share Tracking

1. User can view `Portfolio` showing all accepted deals
2. Share tracking calculates total shares owned per company
3. Monthly valuations based on peer transactions (auto-calculated)

### Referral System

1. Each user has unique referral code (auto-generated)
2. When new user registers with referral code, both users get points
3. Admin sets point-to-rupee conversion rate
4. Points can be redeemed for discounts

---

## 8. API Reference

(Existing content preserved from sections 7+)

---

## 9. Database Models & Schemas

(Existing content preserved from sections 8+)

---

## 10. UI/UX Modernization & Components

### 🎨 Desktop UI/UX Enhancements

**Modern Design System Added** in `src/modern-ui.css`:

#### Buttons
- `.btn-modern` - Base modern button
- `.btn-primary-modern` - Emerald gradient
- `.btn-secondary-modern` - Gray gradient
- `.btn-danger-modern` - Red gradient

#### Cards
- `.card-modern` - Glassmorphism effect, hover lift
- `.card-header-modern` - Gradient header
- `.card-body-modern` - Standard padding

#### Inputs
- `.input-modern` - Enhanced focus states
- `.input-error-modern` - Error state styling

#### Badges
- `.badge-modern` - Base badge
- `.badge-success-modern`, `.badge-warning-modern` - Status badges

#### Tables
- `.table-modern` - Modern table with hover effects
- `.table-header-modern` - Gradient headers

#### Modals
- `.modal-overlay-modern` - Backdrop blur
- `.modal-content-modern` - Slide-up animation

### ✨ Visual Effects

**Glassmorphism:**
- `.glass-effect` - Frosted glass backgrounds
- `.card-frosted` - Frosted card style

**Animations:**
- `.hover-lift` - Smooth lift on hover
- `.glow-emerald` - Emerald glow effect
- `.shimmer` - Loading shimmer effect

**Gradients:**
- `.gradient-emerald` - Green gradient
- `.gradient-blue` - Blue gradient
- `.text-gradient-emerald` - Text gradient

**Shadows:**
- `.shadow-soft` - Subtle shadow
- `.shadow-medium` - Medium shadow
- `.shadow-strong` - Strong shadow

**Transitions:**
- `.transition-smooth` - Cubic bezier smooth
- `.rounded-modern` - Modern border radius

### 📱 Mobile PWA UI

Mobile-optimized components in `src/modern-ui-mobile.css` with:
- Touch-friendly buttons (larger tap targets)
- Responsive typography
- Optimized for landscape/portrait
- Reduced animations for better performance

---

## 11. Cloudinary Setup (KYC & Images)

### 📸 Document Storage Architecture

**Storage Location:** Cloudinary (not MongoDB)
- KYC documents stored as HTTPS URLs
- Profile images stored as HTTPS URLs
- Only URLs stored in MongoDB `User` model

### Supported Document Types

**User KYC Documents:**
- PAN card image (JPG/PNG, max 10MB)
- Aadhar front image (JPG/PNG, max 10MB)
- Aadhar back image (JPG/PNG, max 10MB)
- Cancelled cheque (JPG/PNG/PDF, max 10MB)
- CML statement (JPG/PNG/PDF, max 10MB)
- Profile image (JPG/PNG, max 5MB)

### Upload Workflow

1. Frontend uploads file to `/api/uploads/profile-image` or `/api/uploads/document`
2. Backend validates:
   - File size ≤ 10MB
   - Format: JPG, PNG, or PDF only
3. Multer stores in memory
4. Cloudinary uploads to folder: `nlistplanet/kyc-documents/{userId}/`
5. Returns secure HTTPS URL
6. Frontend updates user profile with URL

### Environment Variables

```env
CLOUDINARY_CLOUD_NAME=nlistplanet
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 12. Testing & Validation

### 8-Phase Testing Plan

#### Phase 1: Environment Setup & Validation ✅
- Backend health: `node scripts/validateEnv.js`
- API health: `node scripts/quickTest.js`
- Database: `node scripts/checkDatabase.js`
- Build verification (all platforms)

#### Phase 2: Authentication & User Management 👤
- User registration (valid, duplicate, weak password, invalid email)
- Login (valid, invalid, non-existent, banned)
- Auto-logout on token expiration
- KYC workflow

#### Phase 3: Core Features Testing 🎯
- Create listing (SELL / BUY)
- View & search listings
- Place bid / counter offer
- Accept / reject offers
- Deal confirmation

#### Phase 4: Admin Panel Testing 🛡️
- User management (ban/unban)
- Company verification
- Deal completion & settlement
- Fee configuration

#### Phase 5: UI/UX & Responsiveness 📱
- Desktop responsiveness
- Mobile PWA (landscape/portrait)
- Accessibility (keyboard, screen readers)
- Loading states & animations

#### Phase 6: Security & Performance 🔒
- CORS validation
- Rate limiting (15 req/min per IP)
- XSS prevention
- SQL injection prevention
- API response time < 200ms
- Frontend build < 300KB (gzipped)

#### Phase 7: Edge Cases & Error Handling ⚠️
- Network failure handling
- Invalid input validation
- Concurrent bid handling
- Counter-offer limit (max 4 rounds)

#### Phase 8: Production Deployment Verification 🚀
- Vercel deployment (Frontend)
- Render deployment (Backend)
- SSL/TLS certificates
- Environment variables
- Production database

---

## 13. Deployment Guide

(Existing deployment content preserved from section 9)

---

## 14. Troubleshooting

(Existing troubleshooting content preserved from section 11)

### Common Issues from Daily Development

**Backend won't start:**
```powershell
# 1. Check environment
cd UnlistedHub-USM/backend
node scripts/validateEnv.js

# 2. Check if port is busy
netstat -ano | findstr :5000
Stop-Process -Id <PID> -Force
```

**Port already in use:**
```powershell
Stop-Process -Name "node" -Force
```

**MongoDB connection failed:**
- Verify MONGODB_URI is correct
- Check IP whitelist on MongoDB Atlas
- Ensure network connectivity

**Build fails:**
- Clear node_modules: `rm -r node_modules`
- Reinstall: `npm install`
- Check TypeScript errors: `npm run build -- --verbose`

---

## 15. New Tools & Dependencies

### Recent Additions

**Testing & Validation:**
- `express-validator` - Input validation middleware

**AI & Content:**
- `openai` (v6.10.0+) - News summarization, Hindi translations
- Auto news fetcher (every 30 minutes)
- AI-generated editor notes

**Image Processing:**
- `cloudinary` (v2.8.0+) - KYC document & image storage

**Notifications:**
- `firebase-admin` (v13.6.0+) - Push notifications (multi-device)
- `twilio` (v5.10.4+) - SMS notifications
- `nodemailer` (v7.0.10+) - Email notifications

**Security:**
- Argon2id password hashing (GPU-resistant)
- Rate limiting per IP
- Injection attack detection

### Feature Improvements

- ✅ News auto-scheduler (in-process)
- ✅ Multi-device FCM support
- ✅ AI-powered company highlights
- ✅ Hindi news translations
- ✅ Enhanced security logging
- ✅ KYC document management (Cloudinary)

---

## 16. Documentation Index & Navigation Guide

### 📚 Documentation Structure

This master document contains ALL project documentation consolidated into one place:
- **16 sections** covering every aspect of development
- **2200+ lines** of complete reference material
- Single source of truth for the entire project

### 📋 Quick Navigation within Master Doc

| Section | Purpose |
|---------|---------|
| 1 | Quick Start & Overview |
| 2 | Architecture (Unified Backend Model) |
| 3 | Security & Authentication |
| 4 | Platform Fee Model & Business Logic |
| 5 | Development Workflows |
| 6 | Daily Developer Workflows & Scripts |
| 7 | Feature Implementation Guides |
| 8 | API Reference |
| 9 | Database Models & Schemas |
| 10 | UI/UX Modernization & Components |
| 11 | Cloudinary Setup (KYC & Images) |
| 12 | Testing & Validation (8-Phase Plan) |
| 13 | Deployment Guide |
| 14 | Troubleshooting |
| 15 | New Tools & Dependencies |
| 16 | Documentation Index & Navigation |

### 🎯 Quick Navigation by Use Case

**"I'm starting development"**
- Read: § 1-2 (10 min) → § 6 (5 min) → Start coding!

**"I need to understand architecture"**
- Read: § 2 Architecture (15 min) + § 9 Database Models (20 min)

**"I'm testing the platform"**
- Read: § 12 Testing & Validation (Complete 8-phase plan)

**"I'm implementing a feature"**
- Read: § 7 Feature Guides → § 8 API Reference → § 9 Database Models

**"I'm working on UI/Frontend"**
- Read: § 10 UI/UX Modernization + reference Tailwind patterns

**"I need to setup KYC/documents"**
- Read: § 11 Cloudinary Setup

**"I'm deploying to production"**
- Read: § 13 Deployment Guide + § 14 Troubleshooting

**"I'm debugging an issue"**
- Check: § 14 Troubleshooting + § 6 Debug Commands

### ⚠️ Deprecated Files (ALL CONSOLIDATED)

All individual documentation files have been merged into this master file:

- ❌ DEV_GUIDE.md → § 6
- ❌ TESTING_PLAN.md → § 12
- ❌ PHASE_3_TESTING_GUIDE.md → § 12
- ❌ UI_MODERNIZATION_GUIDE.md → § 10
- ❌ UI_MODERNIZATION_SUMMARY.md → § 10
- ❌ CLOUDINARY_SETUP.md → § 11
- ❌ NEW_TOOLS_README.md → § 15
- ❌ DOCUMENTATION_INDEX.md → § 16

### 📌 Key Information Cross-Reference

**The 2% Platform Fee (CRITICAL)**
- Section: § 4 Platform Fee Model
- Files to update: `src/utils/helpers.js` in **BOTH** frontends

**Authentication & Security**
- Section: § 3 Security & Authentication
- Key file: `backend/middleware/auth.js`

**Listing Lifecycle & Bid Status Machine**
- Section: § 4 Platform Fee Model
- Key file: `backend/models/Listing.js`

**API Routes & Protection**
- Section: § 8 API Reference
- Key files: `backend/routes/*`

**Daily Debugging & Scripts**
- Section: § 6 Daily Developer Workflows
- All essential commands listed with examples

### 💡 Pro Tips for Using This Document

1. **Use Ctrl+F** to search within document for any keyword
2. **Each section is self-contained** - read just what you need
3. **Cross-references** point to related sections
4. **Code examples** show real patterns from the codebase
5. **Commands** are ready to copy-paste into terminal
6. **Start with your use case** from the navigation table above

### 📞 Quick Help Reference

| Question | Answer |
|----------|--------|
| Where do I find daily commands? | § 6 Daily Developer Workflows |
| How do I start the app? | § 1 Quick Commands |
| How does the platform fee work? | § 4 Platform Fee Model |
| Where's the API reference? | § 8 API Reference |
| How do I test? | § 12 Testing & Validation |
| How do I deploy? | § 13 Deployment Guide |
| How do I fix an issue? | § 14 Troubleshooting |
| What new tools are available? | § 15 New Tools & Dependencies |

### ✅ Active Documentation Files

Only these files remain in the project:

| File | Purpose |
|------|---------|
| **NLISTPLANET_MASTER_DOCS.md** | Complete reference (2200+ lines) - Use for ANY question |
| **.github/copilot-instructions.md** | AI agent quick start (175 lines) - Use when coding with Copilot |

Everything you need is in these two files!

---

**End of Master Documentation**

*For questions or updates, contact the development team.*

**Last Updated:** December 25, 2025  
**Document Version:** 2.2.0 (Complete consolidation - All documentation in one master file)
