# Copilot Instructions — NListPlanet / UnlistedHub

## 🎯 Project Overview
P2P marketplace for unlisted shares with **admin-mediated transactions**. Monorepo with two active projects sharing unified backend architecture.

| Project | Purpose | Status |
|---------|---------|--------|
| `UnlistedHub-USM/` | Desktop web application | Production (Vercel + Render) |
| `nlistplanet-mobile/` | Mobile PWA (fork of USM) | Production (Vercel + Render) |

**Tech Stack:** React 18/19 + Vite, Node.js/Express, MongoDB/Mongoose, JWT auth, Tailwind CSS, Argon2id password hashing

---

## 🏗️ Architecture (Unified Backend Model)

### Critical Concept: One Brain, Two Bodies
- **ONE BACKEND** (`UnlistedHub-USM/backend/`) serves **BOTH** desktop and mobile frontends
- Backend changes affect BOTH applications immediately
- Frontend changes are isolated per project

```
UnlistedHub-USM/
├── backend/              # ← SHARED brain (serves both apps)
│   ├── server.js         # Express entry: Helmet, CORS, rate limiting, route registration
│   ├── models/           # Mongoose schemas (User, Listing, Company, Transaction, etc.)
│   ├── routes/           # API endpoints (/api/auth, /api/listings, /api/admin, etc.)
│   ├── middleware/       # auth.js (JWT), validation.js, securityLogger.js
│   └── utils/            # emailService, smsService, newsScheduler, companyLookup
└── frontend/             # Desktop UI only

nlistplanet-mobile/
└── frontend/             # Mobile PWA UI only
```

---

## 🚀 Quick Start Commands

### Backend (from project folder)
```bash
cd UnlistedHub-USM/backend
npm install
cp .env.example .env  # Edit with real values
npm run dev           # Development with nodemon
npm start             # Production
```

### Frontend (Desktop)
```bash
cd UnlistedHub-USM/frontend
npm install
npm start             # Runs on localhost:3000
npm run build
```

### Frontend (Mobile)
```bash
cd nlistplanet-mobile/frontend
npm install
npm start
npm run build
```

### Environment Variables (Required)
**Backend `.env`:**
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — 32+ character secret (validated at startup)
- `FRONTEND_URL` — Frontend URL for CORS
- `CORS_ORIGINS` — Comma-separated allowed origins
- `EMAIL_USER`, `EMAIL_PASSWORD` — SMTP credentials

**Frontend `.env`:**
- `REACT_APP_API_URL` — Backend API URL (defaults to production if missing)

---

## 💰 Platform Fee Model (CRITICAL — Read This!)

### The Hidden 2% Rule
**Platform earns 2% on ALL transactions. Fee is NEVER shown to users.**

Users only see their own perspective:
- **Sellers** see what they RECEIVE (original price - 2%)
- **Buyers** see what they PAY (original price + 2%)

### Implementation
**Frontend:** `frontend/src/utils/helpers.js`
```javascript
export const calculateBuyerPays = (price) => price * 1.02;    // Buyer pays +2%
export const calculateSellerGets = (price) => price * 0.98;   // Seller gets -2%
```

**Backend:** `backend/models/Listing.js`
```javascript
buyerOfferedPrice: { type: Number },      // What buyer pays (price × 1.02)
sellerReceivesPrice: { type: Number },    // What seller gets (price × 0.98)
platformFee: { type: Number },            // The 2% (price × 0.02)
```

**Key Files:**
- `PLATFORM_FEE_MODEL.md` — Complete fee scenarios with examples
- `frontend/src/utils/helpers.js:16-36` — Fee calculation functions
- `backend/models/Listing.js:18-36` — Fee schema fields

---

## 🔐 Security Architecture (Bank-Level)

### Password Policy (Alphanumeric Only)
- **Length:** 12-128 characters
- **Requirements:** 1 uppercase + 1 lowercase + 1 number
- **Forbidden:** Special characters (`!@#$%` etc.) — prevents XSS warnings
- **Hashing:** Argon2id (GPU-resistant, 64MB memory cost)
- **Validation:** Express-validator in `backend/routes/auth.js`
- **Reference:** `PASSWORD_POLICY_GUIDE.md`

### Middleware Stack (Order Matters!)
1. **Helmet.js** — Security headers (CSP, XSS protection, no-sniff)
2. **CORS** — Strict origin checking (`CORS_ORIGINS` env var)
3. **Rate Limiting:**
   - Global: 300 req/15min per IP
   - Auth: 20 req/15min per IP (brute-force prevention)
4. **Sanitization:**
   - `express-mongo-sanitize` — Prevents NoSQL injection
   - `xss-clean` — XSS attack prevention
5. **Compression** — gzip responses

**See:** `SECURITY_HARDENING_SUMMARY.md` for full details

### Authentication Flow
**Middleware:** `backend/middleware/auth.js`
- `protect` — Requires valid JWT token
- `authorize(...roles)` — Role-based access (e.g., `authorize('admin')`)
- `optionalAuth` — Allows guests (for public marketplace views)

**Frontend:** Sets `Authorization: Bearer <token>` header via `AuthContext`

---

## 📂 Key Files Reference

### Must-Read Before Coding
| File | Purpose |
|------|---------|
| `backend/server.js:1-80` | Security setup, CORS config, route registration |
| `backend/middleware/auth.js` | JWT protect/authorize/optionalAuth patterns |
| `backend/models/Listing.js:1-100` | Listing schema with fee fields, bid schema, counterHistory |
| `backend/models/Company.js` | Company schema (note: uses `name` not `CompanyName`) |
| `frontend/src/utils/helpers.js:1-100` | Fee calculations, price display logic, date formatting |
| `frontend/src/utils/api.js` | Axios wrapper for all API calls (listingsAPI, companiesAPI, etc.) |
| `PLATFORM_FEE_MODEL.md` | Complete fee calculation scenarios |
| `NlistPlanet_System_Architecture_FULL.md` | UI/UX flow and component architecture |

### Route Registration Pattern
`backend/server.js:16-28` shows route imports:
```javascript
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
// ... register in server.js:
app.use('/api/auth', authRoutes);
app.use('/api/listings', protect, listingRoutes);
```

Available routes: `auth`, `listings`, `notifications`, `companies`, `transactions`, `referrals`, `portfolio`, `admin`, `adminCompanies`, `ads`, `news`, `adminNews`, `share`, `kyc`

---

## 🛠️ Common Development Patterns

### Adding a New API Endpoint
1. Create route file in `backend/routes/` (e.g., `myFeature.js`)
2. Import and register in `backend/server.js`
3. Use middleware: `protect` (auth required) or `authorize('admin')` (admin-only)
4. Add to `frontend/src/utils/api.js` for frontend consumption

### Modifying Platform Fee Logic
1. Update `frontend/src/utils/helpers.js` (`calculateBuyerPays`, `calculateSellerGets`)
2. Update `backend/models/Listing.js` schema defaults
3. Update any bid acceptance/counter logic in `backend/routes/listings.js`
4. Test both SELL and BUY listing flows

### Adding Utilities
- Backend: `backend/utils/` (existing: emailService, smsService, newsScheduler, companyLookup)
- Frontend: `frontend/src/utils/` (existing: helpers, api, validation)

---

## 🧪 Testing & Validation

### No Automated Tests
- Use Postman/Insomnia for API testing
- Manual frontend testing via UI
- Use `test-*.js` files in backend/ for ad-hoc tests

### Useful Backend Scripts
```bash
node scripts/seedCompanies.js  # Seed company data
node scripts/fetchNews.js      # Fetch news (cron job simulation)
```

---

## 🚢 Deployment

### Backend (Render.com)
- Auto-deploy from GitHub (see `RENDER_AUTODEPLOY.md`)
- Build: `npm install`
- Start: `npm start`
- Config: `render.yaml`

### Frontend (Vercel)
- Desktop: `UnlistedHub-USM/frontend/`
- Mobile: `nlistplanet-mobile/frontend/`
- Build: `npm run build`
- Root directory: Set to frontend folder
- Env: `REACT_APP_API_URL`, `CI=false`, `GENERATE_SOURCEMAP=false`

---

## ⚠️ Critical Don'ts

1. **Never expose platform fee in UI** — Users only see their own prices
2. **Never use `require()`** — Backend uses ES modules (`"type": "module"`)
3. **Never weaken password hashing** — Argon2id is mandatory
4. **Never bypass rate limiting** — Security critical for auth endpoints
5. **Never assume `company.CompanyName`** — Use `company.name` (legacy field removed)
6. **Never commit `.env`** — Secrets stay local

---

## 🔍 Quick Search Patterns

```bash
# Find platform fee logic
grep -r "calculateBuyerPays\|calculateSellerGets"

# Find admin-only routes
grep -r "authorize('admin')"

# Find validation middleware usage
grep -r "validateListing\|validateBid"

# Find price fields in DB
grep -r "buyerOfferedPrice\|sellerReceivesPrice\|platformFee"
```

---

## 📚 Additional Documentation

- `UNIFIED_WORKFLOW_GUIDE.md` — How unified backend affects development
- `SELL_FLOW_NEW_DESIGN.md` — UI/UX sell flow architecture
- `USERNAME_HISTORY_GUIDE.md` — Username change tracking system
- `SECURITY_FEATURES.md` — Complete security implementation details

---

**Questions?** Reference the file paths above or ask to expand specific sections (e.g., "Show me bid counter flow implementation").
