# AI Agent Instructions — NListPlanet / UnlistedHub

**Purpose:** P2P unlisted shares marketplace with anonymous `@trader_xxx` identities; admin mediates transactions.

**Quick Start (always in order):**
```bash
# 1. Backend - validate environment FIRST
cd UnlistedHub-USM/backend && node scripts/validateEnv.js

# 2. Start backend (port 5000)
npm run dev

# 3. Start desktop frontend (port 3000)
cd UnlistedHub-USM/frontend && npm start

# 4. Start mobile PWA (port 3001) - if needed
cd nlistplanet-mobile/frontend && $env:PORT='3001'; npm start
```

**Critical Before Each Task:**
1. ✅ ALWAYS validate environment first: `node scripts/validateEnv.js`
2. ✅ Check if ports in use: `netstat -ano | findstr :5000` (Windows)
3. ✅ ES modules ONLY - all `.js` files use `import`/`export` (backend has `"type": "module"`)
4. ✅ Fee helpers: Update **BOTH** frontends simultaneously when pricing changes
5. ✅ Never show raw prices - use `getNetPriceForUser(bid, listingType, isOwner)`
6. ✅ Company fields always need fallback: `company.CompanyName || company.name`
7. ✅ UI feedback: `toast.success()/error()/loading()` from `react-hot-toast`, never `alert()`

**Tech Stack:**
- Backend: Express + MongoDB (port 5000, node ≥18)
- Desktop Frontend: React 18 + Tailwind (port 3000)
- Mobile PWA: React 19 (port 3001)
- Auth: JWT (32+ char secret required) + Argon2id + auto-logout on 401
- External: Firebase (FCM), OpenAI, Cloudinary, Twilio

---

## Data Flow: Listing Lifecycle

**Bid Status Machine** (`models/Listing.js` → `bidSchema`):
1. Buyer bids/seller lists → `pending`
2. Counter-offer made → `countered` (max 4 rounds in `counterHistory[]`)
3. One party accepts → `pending_confirmation` (awaiting other party)
4. Both parties confirm → `confirmed` (admin completes transaction)
5. Terminal: `rejected`, `cancelled`, `expired`

**Price Formula (2% hidden fee):**
- SELL listing: Buyer pays `price * 1.02`, Seller gets `price` (fee on buyer)
- BUY listing: Buyer pays `price`, Seller gets `price * 0.98` (fee on seller)
- Backend stores: `{ buyerOfferedPrice, sellerReceivesPrice, platformFee, platformFeePercentage }`
- Frontend always uses: `getNetPriceForUser(bid, listing.type, isOwner)` to display

**Key Models:**
- `User` - JWT token, `fcmTokens[]` array (multi-device), KYC status
- `Listing` - `type: 'sell'|'buy'`, `bids[]` array, `status`, `companyId`
- `Company` - `name`, `scriptName`, `isin`, `verificationStatus` (only show if verified or admin-added)
- `News` - Auto-fetched every 30min, AI-summarized, cached Hindi translations

---

## API Structure

**Routes** (`server.js` lines 212-227):
- `/api/auth` - Login, register, profile, KYC upload
- `/api/listings` - CRUD, counter-offers, bid management
- `/api/companies` - Search, details, filters
- `/api/news` - Fetch, search, AI summaries
- `/api/admin` - User management, company verification, fee configuration
- `/api/transactions` - History, settlement
- `/api/referrals` - Tracking, payouts
- `/api/share` - Share analytics

**Protection Pattern:**
```javascript
router.post('/admin-only', protect, authorize('admin'), validateInput, handler);
```
- `protect` - JWT validation + user exists check
- `authorize('admin')` - Role verification
- `validateInput` - `express-validator` chains from `middleware/validation.js`

**Error Handling:** 
- Validation: Middleware chains always end with `handleValidationErrors`
- Security: Custom `sanitizeInput()`, `detectInjectionAttempt()` middleware

---

## Frontend Patterns

**Auth Context** (`src/context/AuthContext.jsx`):
```javascript
const { user, token, login, logout, loading } = useAuth();
```
- JWT stored in localStorage, auto-logout on 401 (axios interceptor)
- 30-min inactivity logout configured in AuthContext
- Protected routes check `user` existence

**API Integration** (`src/utils/api.js`):
```javascript
import { listingsAPI, companiesAPI, newsAPI } from '../utils/api';
const listings = await listingsAPI.getAll({ page: 1, limit: 20 });
```
- Centralized API modules with base URL from `REACT_APP_API_URL`
- Automatic JWT inclusion in all requests via axios instance

**Price Display Pattern:**
```javascript
import { getNetPriceForUser, formatCurrency } from '../utils/helpers';
const visiblePrice = getNetPriceForUser(bid, listing.type, isOwner);
<span>{formatCurrency(visiblePrice)}</span>
```
- Never use `listing.price` directly; always use `getNetPriceForUser()` helper

**Company Field Fallbacks:**
```javascript
const name = company.CompanyName || company.name;
const logo = company.Logo || company.logo;
```
- Legacy models used `CompanyName`, newer use `name` - support both

---

## Environment Variables

```bash
# Backend (.env)
MONGODB_URI=mongodb://...
JWT_SECRET=<32+ chars required>
FRONTEND_URL=https://...
FIREBASE_SERVICE_ACCOUNT='{raw JSON}'
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=nlistplanet

# Frontend (.env.local)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_PLATFORM_FEE_PERCENTAGE=2  # desktop only; mobile hardcoded
```

---

## Pre-Commit Validation

```bash
cd UnlistedHub-USM/backend
node scripts/validateEnv.js   # Check env vars
node scripts/quickTest.js     # Test API endpoints
```

---

## Deployment

- **Render** (backend): `node server-fast.js` on push to `main`
- **Vercel** (frontends): Auto-deploy on push to `main`
- Health check: `/api/health` returns `{ status: 'ok', newsScheduler: 'running' }`

---

## Key Files

| **File** | **Purpose** |
|----------|-----------|
| [UnlistedHub-USM/frontend/src/utils/helpers.js](UnlistedHub-USM/frontend/src/utils/helpers.js) | Fee calculations (sync both frontends) |
| [UnlistedHub-USM/backend/middleware/auth.js](UnlistedHub-USM/backend/middleware/auth.js) | JWT protect/authorize/optionalAuth |
| [UnlistedHub-USM/backend/models/Listing.js](UnlistedHub-USM/backend/models/Listing.js) | Bid status machine, fee storage |
| [UnlistedHub-USM/backend/server.js](UnlistedHub-USM/backend/server.js) | Helmet CSP, CORS, rate limiting |

---

## Common Errors & Fixes

| **Error** | **Fix** |
|-----------|--------|
| JWT_SECRET too short | Validator exits if < 32 chars - increase in .env |
| 401 Unauthorized | Token expired or JWT_SECRET mismatch |
| Price mismatch (desktop vs mobile) | Update helpers.js in BOTH frontends simultaneously |
| Company names undefined | Use `company.CompanyName \|\| company.name` |
| Port already in use | `Stop-Process -Name "node" -Force` (Windows) |

