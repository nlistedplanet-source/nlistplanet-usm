# Copilot Instructions — NListPlanet / UnlistedHub

## 🏗️ Architecture Overview

**One Backend, Two Frontends:** Single shared backend ([UnlistedHub-USM/backend](UnlistedHub-USM/backend)) serves both desktop ([UnlistedHub-USM/frontend](UnlistedHub-USM/frontend)) and mobile PWA ([nlistplanet-mobile/frontend](nlistplanet-mobile/frontend)). Backend uses ES modules exclusively—no `require()`. Any docs mentioning separate mobile backend are legacy and incorrect.

**Core Concept:** Anonymous P2P marketplace for unlisted shares. Users trade anonymously via system-generated usernames (`@trader_xxx`). Admin mediates all transactions. Platform earns hidden 2% fee.

## 📁 Essential Files (Read These First)

| Path | Purpose |
|------|---------|
| [backend/server.js](UnlistedHub-USM/backend/server.js) | Security headers, CORS config, route registration, middleware chain |
| [backend/middleware/auth.js](UnlistedHub-USM/backend/middleware/auth.js) | JWT auth helpers: `protect`, `authorize`, `optionalAuth` |
| [backend/models/Listing.js](UnlistedHub-USM/backend/models/Listing.js) | Listing/bid schema with hidden fee fields (`buyerOfferedPrice`, `sellerReceivesPrice`, `platformFee`) |
| [backend/models/Company.js](UnlistedHub-USM/backend/models/Company.js) | Company schema; pre-save hook auto-normalizes `pan`, `isin`, `cin` to lowercase |
| [backend/models/User.js](UnlistedHub-USM/backend/models/User.js) | User schema with Argon2id password hashing, FCM tokens, KYC status, referral tracking |
| [UnlistedHub-USM/frontend/src/utils/api.js](UnlistedHub-USM/frontend/src/utils/api.js) | Desktop axios client with auto token injection and 401 handling |
| [nlistplanet-mobile/frontend/src/utils/api.js](nlistplanet-mobile/frontend/src/utils/api.js) | Mobile axios client (similar pattern, slight URL differences) |
| [UnlistedHub-USM/frontend/src/utils/helpers.js](UnlistedHub-USM/frontend/src/utils/helpers.js) | Price/date formatting: `calculateBuyerPays`, `calculateSellerGets`, `getPriceDisplay`, `formatCurrency` |

## 🚀 Dev Workflows

**Backend (Port 5001):**
```bash
cd UnlistedHub-USM/backend
npm install
npm run dev  # nodemon hot-reload
npm start    # production mode
```

**Desktop (Port 3000):**
```bash
cd UnlistedHub-USM/frontend
npm install
npm start
```

**Mobile PWA:**
```bash
cd nlistplanet-mobile/frontend
npm install
npm start
```

**Health Check:** `GET /api/health`

**Testing:** No automated tests. Validate via Postman/browser UI. Ad-hoc test scripts in backend root: `node test-admin-api.js`, `node test-openai.js`, `node test-sms.js`.

**Kill Port 5001 (PowerShell):**
```powershell
$processId = (Get-NetTCPConnection -LocalPort 5001).OwningProcess; Stop-Process -Id $processId -Force
```

**Utility Scripts (run from backend):**
- `npm run seed` — Seed companies ([scripts/seedCompanies.js](UnlistedHub-USM/backend/scripts/seedCompanies.js))
- `node scripts/createAdmin.js` — Create admin user
- `node scripts/fetchNews.js` — Fetch news articles
- `node scripts/migrateUsernameHistory.js` — Username history migration

## 🔐 Environment Variables

**Backend Required:**
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — 32+ chars (validation enforced)
- `FRONTEND_URL` — Main frontend URL
- `CORS_ORIGINS` — Comma-separated allowed origins
- `EMAIL_USER`, `EMAIL_PASSWORD` — SMTP credentials
- `OPENAI_API_KEY` — For AI news features (optional but required for news AI)

**Backend Optional:**
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Image storage
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` — Push notifications (graceful fallback if missing)

**Frontends:**
- `REACT_APP_API_URL` — Backend URL (defaults to production if unset)
- `REACT_APP_FIREBASE_*` — Firebase config for push notifications (see [FIREBASE_SETUP_EASY.md](FIREBASE_SETUP_EASY.md))

**Never commit `.env` files.**

## 💰 Platform Fee Model (CRITICAL)

**Hidden 2% brokerage—ONLY one side pays:**

- **SELL listing:** Seller gets asking price, buyer pays +2%
  - `buyerPays = price × 1.02`
  - `sellerGets = price`
- **BUY listing:** Buyer pays budget, seller gets -2%
  - `buyerPays = price`
  - `sellerGets = price × 0.98`

**NEVER charge both sides (that's 4% total).**

**Display Rules:**
- SELL listing owner sees base price; others see buyer-pays
- BUY listing owner sees base price; others see seller-gets

**Always use helpers from [helpers.js](UnlistedHub-USM/frontend/src/utils/helpers.js):**
- `calculateBuyerPays(price)` → price × 1.02
- `calculateSellerGets(price)` → price × 0.98
- `getPriceDisplay(price, listingType, isOwner)` → handles display logic

**Backend stores:** `buyerOfferedPrice`, `sellerReceivesPrice`, `platformFee` on listings/bids. **Never surface the fee explicitly to users.**

See [PLATFORM_FEE_MODEL.md](PLATFORM_FEE_MODEL.md) for comprehensive examples.

## 🔒 Security & Auth

**Middleware Chain (order matters):**
1. Helmet (CSP headers, XSS protection)
2. CORS (whitelist from `CORS_ORIGINS`)
3. Rate limiting (300/15min global; 20/15min auth endpoints)
4. mongo-sanitize (NoSQL injection prevention)
5. xss-clean (XSS sanitization)
6. compression

**Password Policy:**
- 12-128 chars, alphanumeric with upper/lower/number
- Hashed with Argon2id (never bcrypt)

**Auth Middleware:**
- `protect` — Requires valid JWT
- `authorize(...roles)` — Role-based access control
- `optionalAuth` — Attach user if token present, else continue

**Frontend Auth:**
- AuthContext sets `Authorization: Bearer {token}` on all requests
- Auto-logout after ~30min inactivity
- 401 responses clear local storage and redirect to login

## 🔄 Critical Data Flows

**Two-Step Bid Accept (Anonymous Trading):**
1. Buyer bids → status: `pending`
2. Either party accepts first → status: `accepted`, listing hidden from marketplace
3. Second party accepts → status: `confirmed`, verification codes generated
4. Admin manually closes → status: `closed`, transaction complete

**Trading is anonymous:**
- Users see `@trader_xxx` usernames only
- Real identities visible to admin only in transaction details
- See [TWO_STEP_ACCEPT_FLOW_UNIFIED.md](TWO_STEP_ACCEPT_FLOW_UNIFIED.md) for complete flow

## 🎨 Frontend Patterns

**Frameworks:**
- Desktop: React 18 + Tailwind CSS
- Mobile: React 19 + Tailwind CSS

**Mobile-Specific Helpers:**
- `haptic.*` functions in [nlistplanet-mobile/frontend/src/utils/helpers.js](nlistplanet-mobile/frontend/src/utils/helpers.js)
- `triggerHaptic(type)` for tactile feedback

**Critical Duplication:**
- `ShareCardGenerator` component exists in BOTH UIs:
  - [Desktop version](UnlistedHub-USM/frontend/src/components/ShareCardGenerator.jsx)
  - [Mobile version](nlistplanet-mobile/frontend/src/components/ShareCardGenerator.jsx)
- Uses html2canvas to render investment highlight cards with company logos
- **Always update both versions when making changes**

**Keep centralized:**
- Price formatting in `helpers.js` (avoid duplicating math)
- Date formatting in `helpers.js`
- API calls in `api.js` with proper error handling

## 🤖 AI Features

**Automated News Pipeline:**
- [utils/newsAI.js](UnlistedHub-USM/backend/utils/newsAI.js) generates Hindi Inshorts summaries (40-60 words) + DALL-E 3 images
- Runs every 30min via [utils/newsScheduler.js](UnlistedHub-USM/backend/utils/newsScheduler.js)
- Requires `OPENAI_API_KEY`; optional `CLOUDINARY_*` for permanent storage

**Admin Endpoints:**
- `POST /api/admin/news-ai/process-ai` — Process single article
- `POST /api/admin/news-ai/batch-process-ai` — Batch process
- `POST /api/admin/news-ai/generate-image` — Generate DALL-E image
- `POST /api/admin/news-ai/generate-hindi` — Generate Hindi summary

See [INSHORTS_NEWS_AI_GUIDE.md](INSHORTS_NEWS_AI_GUIDE.md) for complete API docs and [NEWS_AI_POSTMAN.json](NEWS_AI_POSTMAN.json) for Postman collection.

## 📲 Push Notifications

**System:** Firebase Cloud Messaging (FCM) via firebase-admin

**Current State:** Stub implementation ([backend/utils/pushNotifications.js](UnlistedHub-USM/backend/utils/pushNotifications.js)) — gracefully fails if firebase-admin not installed. Real implementation in [pushNotifications-original.js](UnlistedHub-USM/backend/utils/pushNotifications-original.js).

**User Model Fields:**
- `fcmTokens: [String]` — Multi-device support
- `notificationPreferences` — Push/email/bid/offer/deal toggles

**Notification Templates:** Predefined in `NotificationTemplates` object for bid, offer, counter, accept, reject, deal events.

**Setup:** See [FIREBASE_SETUP_EASY.md](FIREBASE_SETUP_EASY.md) and [PUSH_NOTIFICATIONS_COMPLETE.md](PUSH_NOTIFICATIONS_COMPLETE.md).

## 📊 Referral & Share Tracking

**Share Tracking:** Users generate unique share links (`/listing/{id}?ref={shareId}`). Track views (by IP), clicks, conversions, earnings (50% of platform fee on conversions = 1% of transaction).

**Models:**
- [ReferralTracking](UnlistedHub-USM/backend/models/ReferralTracking.js) — User referral codes
- [ShareTracking](UnlistedHub-USM/backend/models/ShareTracking.js) — Post share metrics

**Endpoints:**
- `POST /api/share/create` — Generate share link
- `GET /api/share/track/:shareId` — Track click/view
- `GET /api/share/my-shares` — User's share performance
- `GET /api/referrals/my-referrals` — User's referrals list

**UI Locations:**
- Desktop: `UnlistedHub-USM/frontend/src/components/dashboard/ReferralsTab.jsx`
- Mobile: `nlistplanet-mobile/frontend/src/pages/referrals/ReferralsPage.jsx`

See [REFERRAL_SHARE_TRACKING_COMPLETE.md](REFERRAL_SHARE_TRACKING_COMPLETE.md) and [REFERRAL_TRACKING_SYSTEM.md](REFERRAL_TRACKING_SYSTEM.md).

## 🚀 Deployment

**Backend:** Render.com (see [RENDER_AUTODEPLOY.md](UnlistedHub-USM/backend/RENDER_AUTODEPLOY.md))
- Auto-deploy from Git
- Add all env vars from backend `.env.example`

**Frontends:** Vercel
- Set env vars: `CI=false`, `GENERATE_SOURCEMAP=false`
- Desktop root: `UnlistedHub-USM/frontend`
- Mobile root: `nlistplanet-mobile/frontend`

## 🚫 Critical Don'ts

1. **DO NOT expose platform fee** to users (keep hidden)
2. **DO NOT weaken rate limiting** or security middleware
3. **DO NOT assume legacy `CompanyName` fields** — use `name` field
4. **DO NOT bypass Argon2id** or password policy
5. **DO NOT use `require()`** — ES modules only
6. **DO NOT forget:** Backend changes impact BOTH UIs
7. **DO NOT hardcode prices** — always use helper functions

## 📚 Comprehensive Docs

| Doc | Focus |
|-----|-------|
| [NLISTPLANET_MASTER_DOCS.md](NLISTPLANET_MASTER_DOCS.md) | Complete system architecture and workflows |
| [PLATFORM_FEE_MODEL.md](PLATFORM_FEE_MODEL.md) | Fee calculation with examples |
| [SECURITY_HARDENING_SUMMARY.md](SECURITY_HARDENING_SUMMARY.md) | Security features overview |
| [TWO_STEP_ACCEPT_FLOW_UNIFIED.md](TWO_STEP_ACCEPT_FLOW_UNIFIED.md) | Bid acceptance flow details |
| [INSHORTS_NEWS_AI_GUIDE.md](INSHORTS_NEWS_AI_GUIDE.md) | AI news generation API docs |
| [USERNAME_HISTORY_GUIDE.md](UnlistedHub-USM/backend/USERNAME_HISTORY_GUIDE.md) | Username change tracking |
| [SECURITY_FEATURES.md](UnlistedHub-USM/backend/SECURITY_FEATURES.md) | Detailed security implementation |
| [FIREBASE_SETUP_EASY.md](FIREBASE_SETUP_EASY.md) | Firebase FCM setup guide |
| [PUSH_NOTIFICATIONS_COMPLETE.md](PUSH_NOTIFICATIONS_COMPLETE.md) | Push notification system docs |
| [REFERRAL_SHARE_TRACKING_COMPLETE.md](REFERRAL_SHARE_TRACKING_COMPLETE.md) | Share tracking implementation |
