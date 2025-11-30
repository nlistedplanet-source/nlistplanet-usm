# 📚 NList Planet - Complete Project Documentation

**Version:** 1.0.0  
**Last Updated:** November 30, 2025  
**Project Type:** P2P Unlisted Shares Trading Platform

---

## 🎯 PROJECT OVERVIEW

### **Core Concept**
Anonymous, admin-mediated marketplace for trading unlisted company shares. Platform connects buyers and sellers without revealing identities, with manual transaction completion by admin.

### **Key Features**
- ✅ Anonymous trading (system-generated usernames)
- ✅ Bid/Counter/Accept/Reject mechanism
- ✅ Admin-mediated manual transactions
- ✅ Platform fee (2%) auto-calculated
- ✅ KYC verification system
- ✅ Referral program
- ✅ Portfolio tracking

---

## 🏗️ ARCHITECTURE

### **Tech Stack**
```
Frontend: React 18 (Create React App)
Backend: Node.js + Express.js
Database: MongoDB (Mongoose ODM)
Authentication: JWT tokens
Email: Brevo API (SMTP fallback)
Hosting: 
  ├─ Frontend: Vercel (nlistplanet.com)
  └─ Backend: Render (nlistplanet-usm-v8dc.onrender.com)
```

### **Project Structure**
```
UnlistedHub-USM/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, validation, security
│   ├── utils/           # Helper functions
│   └── server.js        # Express app
│
└── frontend/
    ├── src/
    │   ├── pages/       # Page components
    │   ├── components/  # Reusable components
    │   ├── context/     # React Context (Auth, etc.)
    │   └── utils/       # Helper functions
    └── public/          # Static assets
```

---

## 📊 DATABASE MODELS

### **1. User Model**
```javascript
{
  username: String,              // System-generated identifier
  email: String,                 // Unique, verified
  password: String,              // Hashed (argon2)
  fullName: String,
  phone: String,
  role: 'user' | 'admin',
  isVerified: Boolean,
  kycStatus: 'pending' | 'approved' | 'rejected',
  referredBy: String,            // Referral code
  referralCode: String,          // Unique code
  createdAt: Date,
  updatedAt: Date
}
```

### **2. Company Model**
```javascript
{
  name: String,                  // Company name
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

### **3. Listing Model**
```javascript
{
  userId: ObjectId,              // Creator reference
  username: String,              // System-generated ID
  type: 'sell' | 'buy',          // Post type
  companyId: ObjectId,           // Company reference
  companyName: String,           // Denormalized
  
  // Price fields
  price: Number,                 // Base price
  sellerDesiredPrice: Number,    // For SELL: seller wants this
  buyerMaxPrice: Number,         // For BUY: buyer offers this
  displayPrice: Number,          // Calculated with fee
  platformFeePercentage: 2,      // Fixed 2%
  platformFee: Number,           // Auto-calculated
  
  quantity: Number,              // Shares available
  minLot: Number,                // Minimum lot size
  status: 'active' | 'sold' | 'expired' | 'cancelled',
  
  bids: [Bid],                   // Nested bid array
  offers: [Bid],                 // Nested offer array
  
  isBoosted: Boolean,            // Paid promotion
  boostExpiresAt: Date,
  views: Number,
  expiresAt: Date,               // Auto-expires in 30 days
  createdAt: Date,
  updatedAt: Date
}
```

### **4. Bid Schema** (Nested in Listing)
```javascript
{
  userId: ObjectId,              // Bidder reference
  username: String,              // System-generated
  price: Number,                 // Bid amount
  
  // Platform fee breakdown
  buyerOfferedPrice: Number,     // Total buyer pays
  sellerReceivesPrice: Number,   // Net seller gets (98%)
  platformFee: Number,           // Platform keeps (2%)
  platformFeePercentage: 2,
  
  quantity: Number,              // Shares requested
  message: String,               // Optional message
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired',
  
  counterHistory: [              // Counter offer rounds
    {
      round: Number,             // 1-4 (max 4 rounds)
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

### **5. Transaction Model**
```javascript
{
  listingId: ObjectId,
  bidId: ObjectId,
  buyerId: ObjectId,
  sellerId: ObjectId,
  companyId: ObjectId,
  
  // Final agreed prices
  agreedPrice: Number,           // Per share
  quantity: Number,
  
  // Financial breakdown
  buyerPaysAmount: Number,       // Total buyer pays
  sellerReceivesAmount: Number,  // Net seller gets
  platformFeeAmount: Number,     // Platform keeps
  platformFeePercentage: 2,
  
  status: 'pending' | 'processing' | 'completed' | 'cancelled',
  adminNotes: String,            // Admin comments
  
  // Payment tracking
  buyerPaid: Boolean,
  sellerTransferred: Boolean,
  adminVerified: Boolean,
  
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **6. Notification Model**
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

## 💰 PLATFORM FEE SYSTEM

### **Core Formula**
```javascript
PLATFORM_FEE_PERCENTAGE = 2%

// When Buyer enters amount:
buyerAmount = 100
sellerReceives = buyerAmount × 0.98 = ₹98
platformFee = buyerAmount × 0.02 = ₹2

// When Seller enters amount:
sellerAmount = 100
buyerMustPay = sellerAmount / 0.98 = ₹102.04
platformFee = buyerMustPay - sellerAmount = ₹2.04
```

### **SELL Post Example**
```
Seller creates post:
  Input: "I want ₹100/share net"
  
System calculates:
  sellerDesiredPrice: ₹100
  displayPrice: ₹100 / 0.98 = ₹102.04
  platformFee: ₹2.04
  
Marketplace shows to buyers:
  "Price: ₹102.04/share"
  (Buyer will pay this amount, includes platform fee)
  
Seller's "My Posts" shows:
  "Your listing: ₹100/share"
  (Net amount seller will receive)
```

### **BUY Request Example**
```
Buyer creates request:
  Input: "I'll pay ₹100/share"
  
System calculates:
  buyerMaxPrice: ₹100
  displayPrice: ₹100 × 0.98 = ₹98
  platformFee: ₹2
  
Marketplace shows to sellers:
  "Offer: ₹98/share"
  (Seller will receive this amount)
  
Buyer's "My Posts" shows:
  "Your request: ₹100/share"
  (Total buyer will pay)
```

---

## 🔄 BID & COUNTER OFFER FLOW

### **Round 1: Initial Bid**
```
BUYER places bid: ₹100

Buyer Dashboard:
  "Your bid: ₹100" (I will pay ₹100 total)

System calculates:
  bidAmount: ₹100
  sellerReceives: ₹100 × 0.98 = ₹98
  platformFee: ₹2

Seller Dashboard:
  "Received bid: ₹98" (I will receive ₹98 net)
  Status: 🟡 Pending
  Actions: [Accept ₹98] [Reject] [Counter]
```

### **Round 2: Seller Counters**
```
SELLER counters: ₹102

Seller Dashboard:
  "Counter sent: ₹102" (I want ₹102 net)

System calculates:
  sellerWants: ₹102
  buyerMustPay: ₹102 / 0.98 = ₹104.08
  platformFee: ₹2.08

Buyer Dashboard:
  "Counter received: ₹104.08" (I must pay ₹104.08)
  Status: 💬 Countered
  Actions: [Accept ₹104.08] [Reject] [Counter]
```

### **Round 3: Buyer Counters**
```
BUYER counters: ₹101

Buyer Dashboard:
  "Counter sent: ₹101" (I'll pay ₹101)

System calculates:
  bidAmount: ₹101
  sellerReceives: ₹101 × 0.98 = ₹98.98
  platformFee: ₹2.02

Seller Dashboard:
  "Counter received: ₹98.98" (I'll get ₹98.98)
  Status: 💬 Countered
  Actions: [Accept ₹98.98] [Reject] [Counter]
```

### **Round 4: Final Agreement**
```
SELLER accepts: ₹98.98

Both Dashboards:
  Status: ✅ Accepted
  "Pending Admin Approval"

Admin Dashboard shows:
  Transaction #12345
  ├─ Buyer pays: ₹101
  ├─ Platform fee (2%): ₹2.02
  └─ Seller receives: ₹98.98
  Status: Manual Processing Required
```

### **Counter Offer Rules**
- Maximum 4 rounds allowed
- Platform fee recalculated on each counter
- Either party can accept/reject at any round
- After 4 rounds, no more counters allowed

---

## 🔐 ADMIN MANUAL TRANSACTION FLOW

### **Step-by-Step Process**

```
1. BOTH PARTIES AGREE
   Buyer and seller accept final price
   System status: "Pending Admin Approval"
      ↓
2. ADMIN DASHBOARD NOTIFICATION
   New transaction appears
   Shows full breakdown:
     - Buyer details (system username)
     - Seller details (system username)
     - Company & quantity
     - Financial breakdown
      ↓
3. ADMIN CONTACTS BOTH PARTIES
   Manual communication (phone/email):
   
   To Buyer:
   "Please transfer ₹[total] to company account:
    Account: XYZ Bank
    A/C No: 1234567890
    IFSC: ABCD0001234"
   
   To Seller:
   "Please transfer [quantity] shares to company demat:
    DP ID: IN123456
    Client ID: 12345678"
      ↓
4. ADMIN VERIFIES RECEIPTS
   ✅ Check bank account: Amount received from buyer
   ✅ Check demat account: Shares received from seller
   Update status: "Payment Verified"
      ↓
5. ADMIN INITIATES TRANSFER
   Action 1: Transfer shares to buyer's demat
   Action 2: Calculate seller's net amount
             (Total - Platform Fee)
   Action 3: Transfer net amount to seller's bank
   Platform keeps: Platform fee amount
      ↓
6. ADMIN MARKS COMPLETE
   Status: "Completed"
   Generate receipt with breakdown
      ↓
7. NOTIFICATIONS SENT
   To Buyer: "Transaction complete! Shares credited to your demat"
   To Seller: "Transaction complete! ₹[net] credited to your account"
```

### **Admin Dashboard Features**
- View all pending transactions
- Full financial breakdown
- Contact information of both parties (KYC verified)
- Payment tracking checkboxes
- Manual status updates
- Receipt generation
- Transaction history

---

## 🎭 ANONYMOUS TRADING SYSTEM

### **System-Generated Usernames**
```javascript
Purpose: Allow users to identify same seller/buyer without revealing identity

Format: @[prefix]_[random]
Examples: 
  - @trader_xyz123
  - @seller_abc789
  - @buyer_def456

Rules:
  ✅ Generated at account creation
  ✅ Permanent identifier for listings
  ✅ Visible on marketplace cards
  ✅ Same user = same identifier across all their posts
  ✅ Real name/email NEVER shown publicly
  ❌ Cannot be changed by user
  ❌ Not searchable
  ❌ Not used for direct contact
```

### **Privacy Protection**
```
PUBLIC (Visible to all):
  ✅ System-generated username (@trader_xyz)
  ✅ Company name
  ✅ Price (with fee included)
  ✅ Quantity
  ✅ Date posted
  ✅ Sector

PRIVATE (Admin only):
  🔒 Real full name
  🔒 Email address
  🔒 Phone number
  🔒 Bank details
  🔒 Demat details
  🔒 KYC documents

NEVER SHOWN:
  ❌ Real username
  ❌ Contact information
  ❌ Location
  ❌ Other user's bids (only your own)
```

---

## 📱 DASHBOARD TABS & FUNCTIONALITY

### **USER TABS (9 tabs)**

#### **1. Overview Tab**
**Purpose:** Dashboard home screen
```
Displays:
  - Portfolio summary (total value, gain/loss)
  - Recent holdings (top 5 stocks)
  - Recent activity feed (last 10 activities)
  - Quick action buttons

API Calls:
  - portfolioAPI.getStats()
  - portfolioAPI.getHoldings()
  - portfolioAPI.getActivities({ limit: 10 })
```

#### **2. Marketplace Tab**
**Purpose:** Browse all active listings
```
Features:
  - Search by company name
  - Filter: All/SELL/BUY
  - Sort: Latest/Price/Quantity
  - Like/Unlike listings
  - View listing details
  - Place bid/offer

Display Rules:
  ✅ Shows all active listings
  ❌ EXCLUDES your own listings
  ✅ Shows system username
  ✅ Shows price (with fee included)
  ✅ Shows date posted

Card Information:
  - Company logo + name
  - Sector
  - Price per share
  - Total quantity available
  - Minimum lot size
  - Post type badge (SELL/BUY)
  - Date posted
  - System username (@trader_xyz)
  - Actions: [Place Bid] [Share] [Like]

API Calls:
  - listingsAPI.getAll()
  - listingsAPI.like(id)
  - listingsAPI.unlike(id)
```

#### **3. Portfolio Tab**
**Purpose:** View holdings and transaction history
```
Displays:
  - Holdings table:
    ├─ Company name
    ├─ Quantity owned
    ├─ Average buy price
    ├─ Current value
    └─ Gain/Loss

  - Transaction history:
    ├─ Date
    ├─ Company
    ├─ Type (Buy/Sell)
    ├─ Quantity
    ├─ Price per share
    ├─ Platform fee paid
    └─ Total amount

API Calls:
  - portfolioAPI.getHoldings()
  - portfolioAPI.getTransactions()
```

#### **4. My Posts Tab**
**Purpose:** Manage your SELL/BUY listings
```
Component: MyPostsTab.jsx

Displays:
  - All your active/inactive listings
  - Post type (SELL/BUY)
  - Company details
  - YOUR price (net amount you'll receive for SELL,
                total you'll pay for BUY)
  - Quantity available
  - Date posted
  - Status badge
  - Number of bids/offers received

Actions:
  - View bids received
  - Edit listing (price/quantity)
  - Delete listing
  - Share listing
  - Boost (paid promotion)

Price Display:
  SELL post: Shows net amount you'll receive
  BUY post: Shows total amount you'll pay
  (Platform fee NOT shown to you)

API Calls:
  - listingsAPI.getMyListings()
  - listingsAPI.update(id, data)
  - listingsAPI.delete(id)
  - listingsAPI.boost(id)
```

#### **5. My Bids & Offers Tab**
**Purpose:** Track bids/offers YOU sent
```
Component: MyBidsOffersTab.jsx

Displays:
  - All bids you placed on SELL posts
  - All offers you made on BUY requests
  
For each bid:
  - Company name
  - YOUR bid price (total you'll pay)
  - Quantity requested
  - Status: 🟡 Pending / ✅ Accepted / ❌ Rejected / 💬 Countered
  - Counter offer details (if any)
  - Timestamp

Actions:
  - View bid details
  - Withdraw bid (if pending)
  - Accept counter offer
  - Reject counter offer
  - Place new counter (max 4 rounds)

Status Flow:
  Pending → Can withdraw
  Countered → Can accept/reject/counter
  Accepted → Waiting for admin
  Rejected → No further action
  Admin Review → Transaction in progress
  Completed → View receipt

API Calls:
  - listingsAPI.getMyBids()
  - listingsAPI.withdrawBid(listingId, bidId)
  - listingsAPI.acceptCounter(listingId, bidId)
  - listingsAPI.counterOffer(listingId, bidId, data)
```

#### **6. Received Bids & Offers Tab**
**Purpose:** Manage bids/offers on YOUR posts
```
Component: ReceivedBidsOffersTab.jsx

Displays:
  - All bids received on your SELL posts
  - All offers received on your BUY requests

For each bid:
  - Company name (your listing)
  - BID price (shows net amount you'll receive)
  - Quantity requested
  - Status
  - Timestamp
  - Anonymous bidder (system username)

Actions:
  - Accept bid (agree to their price)
  - Reject bid
  - Counter offer (propose new price)
  - View bid history

Counter Offer Flow:
  1. Receive bid: ₹98
  2. Counter: ₹102 (you want ₹102 net)
  3. Buyer sees: ₹104.08 (they must pay)
  4. Buyer accepts/rejects/counters

Price Display:
  Shows NET amount you'll receive
  (Platform fee already deducted)

API Calls:
  - listingsAPI.getReceivedBids()
  - listingsAPI.acceptBid(listingId, bidId)
  - listingsAPI.rejectBid(listingId, bidId)
  - listingsAPI.counterOffer(listingId, bidId, data)
```

#### **7. Notifications Tab**
**Purpose:** Activity alerts
```
Component: NotificationsTab.jsx

Types:
  🔔 New bid received
  💬 Counter offer received
  ✅ Bid accepted
  ❌ Bid rejected
  ⏳ Transaction pending admin
  🎉 Transaction completed
  📢 System announcements

Features:
  - Mark as read/unread
  - Filter by type
  - Clear all
  - Real-time updates (polling)

API Calls:
  - notificationsAPI.getAll()
  - notificationsAPI.markRead(id)
  - notificationsAPI.clearAll()
```

#### **8. Referrals Tab**
**Purpose:** Referral program tracking
```
Component: ReferralsTab.jsx

Displays:
  - Your unique referral code
  - Referral link (shareable)
  - Total referrals count
  - Referral earnings
  - Referral history table
  - Commission structure (5% default)

Features:
  - Copy referral link
  - Share on social media
  - Track earnings
  - View referred users (anonymous)

API Calls:
  - referralsAPI.getStats()
  - referralsAPI.getHistory()
```

#### **9. Profile Tab**
**Purpose:** Account management
```
Component: ProfileTab.jsx

Sections:
  1. Personal Info:
     - Full name
     - Email (verified badge)
     - Phone number
     - Edit profile button

  2. KYC Status:
     - Current status badge
     - Upload documents
     - Verification progress

  3. Username History:
     - View past usernames
     - Change username (limited)

  4. Security:
     - Change password
     - Two-factor auth (future)

  5. Preferences:
     - Email notifications
     - Push notifications
     - Language

API Calls:
  - authAPI.getProfile()
  - authAPI.updateProfile(data)
  - authAPI.changePassword(data)
  - authAPI.uploadKYC(files)
```

---

### **ADMIN TABS (8 additional tabs)**

#### **1. User Management**
```
Component: UserManagement.jsx

Features:
  - View all users
  - Search/filter users
  - User details (KYC status)
  - Approve/Reject KYC
  - Ban/Unban users
  - View user activity
```

#### **2. Listings Management**
```
Component: ListingsManagement.jsx

Features:
  - View all listings
  - Moderate posts
  - Remove fraudulent listings
  - Boost listings manually
  - View listing analytics
```

#### **3. Transactions**
```
Component: TransactionsManagement.jsx

Features:
  - View all transactions
  - Pending approvals queue
  - Full financial breakdown
  - Contact both parties
  - Mark payment received
  - Mark shares transferred
  - Complete transaction
  - Generate receipts
```

#### **4. Companies Management**
```
Component: CompaniesManagement.jsx

Features:
  - Add new companies
  - Edit company details
  - Upload company logos
  - Manage sectors
  - View company analytics
```

#### **5. Ads Management**
```
Component: AdManagement.jsx

Features:
  - Create platform ads
  - Schedule ads
  - Target specific users
  - View ad performance
```

#### **6. Referral Tracking**
```
Component: ReferralTracking.jsx

Features:
  - View all referrals
  - Commission payouts
  - Top referrers
  - Fraud detection
```

#### **7. Reports**
```
Component: ReportsManagement.jsx

Features:
  - User growth charts
  - Transaction volume
  - Revenue reports
  - Popular companies
  - Export data
```

#### **8. Platform Settings**
```
Component: PlatformSettings.jsx

Features:
  - Set platform fee %
  - Configure limits
  - Update terms
  - System maintenance
```

---

## 🔒 AUTHENTICATION & SECURITY

### **Registration Flow**
```
1. User enters: email, password, fullName, phone, referral code
2. Backend validates data
3. Password hashed with Argon2
4. System generates unique username (@trader_xyz123)
5. Verification email sent (Brevo API)
6. User must verify email before login
7. Email verified → Account active
```

### **Login Flow**
```
1. User enters: email/username + password
2. Backend validates credentials
3. Check email verification status
4. If verified: Generate JWT token
5. Token stored in localStorage
6. User redirected to dashboard
```

### **Security Features**
- Password hashing: Argon2
- JWT authentication
- Rate limiting (15 req/15min)
- Email verification required
- CORS whitelist
- XSS protection (helmet.js)
- SQL injection protection (mongoose)
- CSRF protection

---

## 📧 EMAIL SYSTEM

### **Email Service: Brevo API**
```javascript
Configuration:
  Host: smtp-relay.brevo.com
  Port: 465 (SSL)
  API Key: xkeysib-...
  From: hello@nlistplanet.com
  
Fallback: SMTP (if API fails)
```

### **Email Templates**
1. **Verification Email**
   - Professional gradient design
   - Company logo
   - Verification button
   - 24-hour expiry warning

2. **Welcome Email** (after verification)
3. **Bid Received** (notification)
4. **Counter Offer** (notification)
5. **Transaction Complete** (receipt)
6. **Password Reset**

---

## 🚀 DEPLOYMENT

### **Frontend (Vercel)**
```
Domain: nlistplanet.com
Environment Variables:
  REACT_APP_API_URL=https://nlistplanet-usm-v8dc.onrender.com/api

Build Command: npm run build
Output Directory: build
Auto-deploy: On git push to main branch
```

### **Backend (Render)**
```
URL: https://nlistplanet-usm-v8dc.onrender.com
Environment Variables:
  NODE_ENV=production
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=...
  BREVO_API_KEY=...
  FRONTEND_URL=https://nlistplanet.com
  CORS_ORIGINS=https://nlistplanet.com,https://www.nlistplanet.com

Build Command: npm install
Start Command: node server.js
Auto-deploy: On git push to main branch
```

---

## 🎨 MOBILE FRONTEND STRATEGY

### **Approach: Responsive Design (Single Codebase)**

```
Same React app works on all devices:
  Desktop (>768px): Sidebar navigation
  Tablet (768-1024px): Hybrid layout
  Mobile (<768px): Bottom navigation + full-screen views
```

### **Mobile-Specific Features**
1. **Bottom Navigation Bar** (5 tabs)
   - Home, Market, Post, Activity, Profile

2. **Touch-Optimized**
   - Larger buttons (min 44px tap target)
   - Swipe gestures
   - Pull-to-refresh
   - Bottom sheets for modals

3. **Progressive Web App (PWA)**
   - Install prompt
   - Offline support
   - Push notifications
   - App-like experience

4. **Mobile Layouts**
   - Single column cards
   - Horizontal scroll lists
   - Full-screen modals
   - Floating action buttons

### **Responsive Breakpoints**
```css
/* Mobile */
@media (max-width: 767px) {
  .sidebar { display: none; }
  .bottom-nav { display: flex; }
  .card { width: 100%; }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar { width: 200px; }
  .card { width: 50%; }
}

/* Desktop */
@media (min-width: 1024px) {
  .sidebar { width: 256px; }
  .bottom-nav { display: none; }
}
```

---

## 📋 API ENDPOINTS

### **Authentication**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-email/:token
POST   /api/auth/resend-verification
PUT    /api/auth/update-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
PUT    /api/auth/change-password
GET    /api/auth/profile
PUT    /api/auth/profile
```

### **Listings**
```
GET    /api/listings              # Get all (excludes user's own)
GET    /api/listings/my           # Get user's listings
POST   /api/listings              # Create listing
PUT    /api/listings/:id          # Update listing
DELETE /api/listings/:id          # Delete listing
POST   /api/listings/:id/bid      # Place bid
POST   /api/listings/:id/boost    # Boost listing
```

### **Bids**
```
GET    /api/listings/:id/bids           # Get bids for listing
PUT    /api/listings/:listingId/bids/:bidId/accept
PUT    /api/listings/:listingId/bids/:bidId/reject
POST   /api/listings/:listingId/bids/:bidId/counter
DELETE /api/listings/:listingId/bids/:bidId  # Withdraw
```

### **Portfolio**
```
GET    /api/portfolio/stats
GET    /api/portfolio/holdings
GET    /api/portfolio/activities
GET    /api/portfolio/transactions
```

### **Companies**
```
GET    /api/companies
GET    /api/companies/:id
POST   /api/admin/companies       # Admin only
PUT    /api/admin/companies/:id   # Admin only
```

### **Notifications**
```
GET    /api/notifications
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id
POST   /api/notifications/clear-all
```

### **Referrals**
```
GET    /api/referrals/stats
GET    /api/referrals/history
POST   /api/referrals/validate-code
```

---

## 🐛 KNOWN ISSUES & SOLUTIONS

### **Issue 1: Email Sending**
**Problem:** SMTP ports (587, 465) blocked on Render  
**Solution:** Using Brevo HTTP API instead of SMTP  
**Status:** ✅ Fixed

### **Issue 2: Environment Variables**
**Problem:** Vercel not injecting REACT_APP_API_URL  
**Solution:** Created .env.production.local file  
**Status:** ✅ Fixed

### **Issue 3: Logo Display**
**Problem:** Company logos not loading  
**Solution:** Added fallback URL handler with error handling  
**Status:** ✅ Fixed

### **Issue 4: CORS Errors**
**Problem:** Production domain not whitelisted  
**Solution:** Added nlistplanet.com to CORS whitelist  
**Status:** ✅ Fixed

---

## 📝 FUTURE ENHANCEMENTS

### **Phase 1: Mobile PWA** (Next)
- Bottom navigation fixes
- Touch-optimized UI
- Swipe gestures
- Install prompt
- Push notifications

### **Phase 2: Features**
- Auto-matching algorithm
- Live chat support
- Video KYC
- Multiple payment options
- Escrow service

### **Phase 3: Scale**
- Load balancing
- Redis caching
- CDN for assets
- Real-time WebSocket updates
- Advanced analytics

---

## 🆘 SUPPORT & MAINTENANCE

### **Contact**
- Email: hello@nlistplanet.com
- Admin: admin@nlistplanet.com

### **Monitoring**
- Uptime: Render dashboard
- Errors: Console logs + Sentry (future)
- Analytics: Google Analytics (future)

### **Backup**
- Database: MongoDB Atlas auto-backup (daily)
- Code: GitHub repository
- Environment: Documented in .env.example

---

## 📚 REFERENCES

### **Technologies**
- React: https://react.dev
- Node.js: https://nodejs.org
- MongoDB: https://mongodb.com
- Express: https://expressjs.com
- Brevo: https://brevo.com

### **Deployment**
- Vercel: https://vercel.com
- Render: https://render.com

---

**End of Documentation**  
**Version 1.0.0**  
**Last Updated: November 30, 2025**
