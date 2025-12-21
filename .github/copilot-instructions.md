# Copilot Instructions — NListPlanet / UnlistedHub

## 🏗️ Architecture (One Brain, Two Bodies)
- **Backend:** Express API (Port 5000, dev uses nodemon) - serves BOTH frontends.
- **Desktop:** React 18 + Tailwind (Port 3000) at `UnlistedHub-USM/frontend`.
- **Mobile:** React 19 + Tailwind PWA (Port 3001) at `nlistplanet-mobile/frontend`.
- **Core Concept:** Anonymous P2P marketplace for unlisted shares. Users trade via system-generated usernames (`@trader_xxx`). Admin mediates all transactions.
- **Critical Rule:** Backend changes affect BOTH apps. Always test on both frontends after backend API changes.

## 🚀 Critical Workflows
```bash
# Backend (Start first, REQUIRED for both frontends)
cd UnlistedHub-USM/backend
npm run dev                        # Development with nodemon (Port 5000)
npm start                          # Production

# Desktop frontend
cd UnlistedHub-USM/frontend
npm start                          # Port 3000

# Mobile frontend (PWA)
cd nlistplanet-mobile/frontend
BROWSER=none PORT=3001 npm start   # Port 3001 (disable auto-open)

# Admin & Data Management Scripts
cd UnlistedHub-USM/backend
npm run seed                       # Seed companies from CSV
node scripts/createAdmin.js        # Create admin user
node scripts/makeUserAdmin.js      # Grant admin role
node scripts/fetchNews.js          # Manual RSS news fetch
node scripts/generateCompanyHighlights.js  # AI-generate company highlights
node scripts/checkUserTokenDebug.js <username>  # Debug FCM tokens
```

## 💰 Platform Fee (Hidden 2% - Critical Business Logic)
**One-sided fee:** ONLY the initiator pays (never both parties).
- **SELL @ ₹100:** Seller gets ₹100, Buyer pays ₹102 (+2%).
- **BUY @ ₹100:** Buyer pays ₹100, Seller gets ₹98 (-2%).

**Implementation:**
- **Frontend helpers:** `calculateBuyerPays(price)`, `calculateSellerGets(price)` in `src/utils/helpers.js`.
- **Backend storage:** Bid/Listing models store `buyerOfferedPrice`, `sellerReceivesPrice`, `platformFee`.
- **Display logic:** Use `getPriceDisplay(price, listingType, isOwner)` - shows adjusted price to non-owners.
- **Never expose:** Fee percentage or breakdown to users. Show only net amounts.
- **Sync requirement:** Changes to fee helpers must be synced in BOTH `UnlistedHub-USM/frontend/src/utils/helpers.js` AND `nlistplanet-mobile/frontend/src/utils/helpers.js`.

## 🔑 Key Patterns & Conventions
- **ES Modules Only:** All code uses `import/export`. Never use `require()`.
- **Company Model Casing:** Handle legacy data: `company.CompanyName || company.name`, `company.ScripName || company.scriptName`, `company.Logo || company.logo`.
- **Dual Frontend Syncing:** `ShareCardGenerator.jsx` and `helpers.js` must stay identical across frontends. Use diff/copy when updating.
- **Post IDs:** Listings use unique `postId` format: `NLP-8C79CB` (6-char hex).
- **Listing Status Flow:** `active` → `negotiating` → `deal_pending` → `sold`/`cancelled`.
- **Counter Rounds:** Max 4 counter-offers per bid. Enforce in validation.
- **Company Verification:** Filter marketplace listings to show only `verificationStatus: 'verified'` or `addedBy: 'admin'`.

## 🛡️ Security & Auth
- **Password Hashing:** Argon2id (configured in `User.js` pre-save hook).
- **JWT:** 32+ char secret, tokens in `Authorization: Bearer {token}` header.
- **Middleware Chain:** `protect` (auth required) → `authorize('admin')` (role check).
- **Rate Limiting:** Applied globally (100 req/15min) and per-route (e.g., 5 req/15min for auth).
- **CORS:** Whitelist in `CORS_ORIGINS` env var. Auto-allows Vercel previews (`*.vercel.app`) and localhost.
- **Auto-Logout:** Frontend 30-min inactivity timer. 401 responses clear localStorage.
- **Input Sanitization:** `express-mongo-sanitize`, `xss-clean`, and custom `sanitizeInput` middleware on all routes.

## 🔔 Push Notifications (Firebase FCM)
- **Setup:** Firebase Admin SDK initialized in `backend/utils/pushNotifications.js` using `FIREBASE_SERVICE_ACCOUNT` env var (JSON string).
- **User Model:** FCM tokens stored in `User.fcmTokens[]` array (supports multi-device).
- **Send Function:** `createAndSendNotification(userId, { title, body, actionUrl, data })` - creates in-app + sends push.
- **Templates:** Use `NotificationTemplates.NEW_BID()`, `.BID_ACCEPTED()`, etc. for consistent messaging.
- **Frontend Registration:** `POST /api/notifications/register-device` with `{ fcmToken }` after Firebase initialization.
- **Testing:** `node test-push-notification.js <username>` or `POST /api/notifications/test-push`.

## 📱 Mobile-Only Utilities (in `nlistplanet-mobile/frontend/src/utils/helpers.js`)
- **Haptic Feedback:** `haptic.light()`, `haptic.success()`, `haptic.error()` - uses Vibration API.
- **Number Formatting:** `formatShortNumber(1500000)` → `"15 L"` (Lakhs/Crores format).
- **Currency Display:** `formatCurrency(amount)` → INR format with ₹ symbol.
- **Storage Helpers:** `storage.get(key)`, `storage.set(key, value)` - auto JSON parse/stringify.

## 🗄️ Database Models (MongoDB + Mongoose)
**Core Models:**
- `User`: Auth, FCM tokens, KYC, referrals, wallet balance.
- `Listing`: Posts with bids array, platform fee fields, counter history.
- `Company`: Mixed-case field names (legacy). Check `verificationStatus`, `isActive`.
- `CompletedDeal`: Final transaction records with seller/buyer/admin confirmations.
- `Notification`: In-app notifications with `actionUrl` for deep-linking.
- `ShareTracking`: Referral link tracking (views, clicks, conversions).
- `News`: RSS articles with AI-generated summaries (Hindi + English).

**Schema Gotchas:**
- Listings: `bids[]` embedded, each has `buyerOfferedPrice`, `sellerReceivesPrice`, `platformFee`.
- Company: `highlights[]` max 5 items, auto-generated by AI if empty.
- User: `username` lowercase, unique. `role: 'user'|'admin'`.

## 🛤️ API Routes (all under `/api`)
- `/auth` - Register, login, verify OTP, Google auth.
- `/listings` - CRUD, bidding, counters, accept/reject.
- `/companies` - Search, get details, user-submitted companies.
- `/notifications` - List, mark read, FCM device registration.
- `/portfolio` - User holdings, activities, stats.
- `/referrals` - User's referral stats and earnings.
- `/share` - Create share links, track clicks/conversions.
- `/news` - Public news feed with AI summaries.
- `/admin` - User management, deal completion (requires `authorize('admin')`).
- `/admin/news-ai` - AI summarization for news articles.

## 🧪 Testing & Debugging
- **Check DB Connections:** Server logs MongoDB connection status on startup.
- **Test FCM:** `node scripts/checkUserTokenDebug.js <username>` shows token count.
- **Inspect Bids:** `node check-divyansh-current-bids.js` (example script for debugging).
- **Verify Admin:** `node scripts/checkAllUsers.js` lists all users with roles.
- **News Scheduler:** Runs hourly via `utils/newsScheduler.js` (started in `server.js`).

## 📋 Environment Variables (Required)
**Backend `.env`:**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<32+ chars>
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://nlistplanet.com
NODE_ENV=production|development
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'  # JSON string
OPENAI_API_KEY=sk-...  # For AI summaries
EMAIL_USER=smtp@example.com
EMAIL_PASSWORD=<smtp-password>
TWILIO_ACCOUNT_SID=<optional>
TWILIO_AUTH_TOKEN=<optional>
```

**Frontend `.env` (both apps):**
```env
REACT_APP_API_URL=http://localhost:5000/api  # Development
# Production: https://nlistplanet-usm-v8dc.onrender.com/api
```

## 🚨 Common Pitfalls
- **Forgot to sync helpers.js:** Changes to platform fee logic must be copied to both frontends.
- **Company name casing:** Always use `company.CompanyName || company.name` for backward compatibility.
- **Missing protect middleware:** All user-specific routes need `protect` before handler.
- **FCM not initialized:** Check `FIREBASE_SERVICE_ACCOUNT` is valid JSON (remove outer quotes if present).
- **Port conflicts:** Backend MUST be on 5000 (or update `REACT_APP_API_URL` in both frontends).
- **Listing filters:** Marketplace queries filter out `verificationStatus: 'pending'` companies.

