# Copilot Instructions — NListPlanet / UnlistedHub

## Quick Reference Card

**Essential Commands:**
```bash
# Validate Environment First (⚠️ ALWAYS RUN BEFORE STARTING)
cd UnlistedHub-USM/backend && node scripts/validateEnv.js

# Backend Dev
cd UnlistedHub-USM/backend && npm run dev

# Desktop Frontend  
cd UnlistedHub-USM/frontend && npm start

# Mobile PWA
cd nlistplanet-mobile/frontend && $env:PORT='3001'; npm start

# Quick API Test (before pushing code)
node scripts/quickTest.js

# Test Push Notification
node test-push-notification.js <username>

# Create Admin
node scripts/createAdmin.js
```

**Critical Rules:**
- ✅ Update fee helpers in BOTH frontends when changing pricing
- ✅ Always use fallback: `company.CompanyName || company.name`
- ✅ Never show raw prices - use `getNetPriceForUser()`
- ✅ ES modules only (`import`/`export`, no `require`)
- ✅ Use `toast.success()` not `alert()` for user feedback

**Tech Stack:**
- Backend: Express + MongoDB (ES modules, port 5000)
- Desktop: React 18 + Tailwind (port 3000)
- Mobile: React 19 PWA (port 3001)
- Auth: JWT + Argon2id, auto-logout on 401
- Notifications: Firebase Cloud Messaging
- AI: OpenAI (news summaries, translations)

---

## Architecture & Purpose
**P2P unlisted shares marketplace** with anonymous `@trader_xxx` identities; admin mediates deals.

**Monorepo structure:**
- `UnlistedHub-USM/backend` - Express + MongoDB (port 5000)
- `UnlistedHub-USM/frontend` - Desktop React 18 (port 3000)
- `nlistplanet-mobile/frontend` - Mobile PWA React 19 (port 3001)

**Critical:** Backend must start first; API changes impact both frontends.

**Deployment:**
- Backend: Render.com (Oregon free tier) → `node server-fast.js`
- Frontends: Vercel (both desktop + mobile)
- Auto-deploy: Push to `main` branch triggers Render webhook (check `render.yaml` for config)

## Run & Debug

### Backend (port 5000)
```bash
cd UnlistedHub-USM/backend
npm install
npm run dev  # nodemon auto-reload
npm start    # production (uses server.js)
```

**Production server:** `server-fast.js` (used on Render, optimized startup)

**Key scripts:**
- `npm run seed` - Seed companies database
- `node scripts/createAdmin.js` - Create admin user
- `node scripts/fetchNews.js` - Fetch latest news
- `node scripts/checkUserTokenDebug.js <username>` - Debug FCM tokens
- `node test-push-notification.js <username>` - Test push to user

**Server health:** `/api/health` (news scheduler auto-starts)

### Desktop Frontend (port 3000)
```bash
cd UnlistedHub-USM/frontend
npm start
```

### Mobile PWA (port 3001)
```powershell
cd nlistplanet-mobile/frontend
npm install
$env:BROWSER='none'; $env:PORT='3001'; npm start
```

**Note:** Mobile uses React 19, desktop uses React 18. Keep component compatibility in mind.

## Business Logic (Critical - must stay consistent)

### Hidden 2% Platform Fee
**One-sided fee - initiator pays:**
- **SELL ₹100:** Buyer pays 102, Seller receives 100 (fee on buyer)
- **BUY ₹100:** Buyer pays 100, Seller receives 98 (fee on seller)

**Implementation rules:**
1. Keep fee helpers **identical** across both frontends in `src/utils/helpers.js`
2. Backend stores: `{ buyerOfferedPrice, sellerReceivesPrice, platformFee, platformFeePercentage }`
3. **Never show fee percentage to users** - only show net price via `getNetPriceForUser()`
4. Constants: `PLATFORM_FEE_PERCENTAGE = 2` (hardcoded in mobile, env-configurable in desktop)
5. Desktop uses `parseFloat(process.env.REACT_APP_PLATFORM_FEE_PERCENTAGE || 2)`, mobile uses hardcoded `2`

### Shared UI Components
**Must sync across desktop + mobile:**
- `src/components/ShareCardGenerator.jsx`
- `src/utils/helpers.js`

Update in **both** locations when modifying fee logic or card generation.

## Data Models & Legacy Compatibility

### Company Schema Evolution
Models changed from `CompanyName` → `name`, `ScripName` → `scriptName`, `Logo` → `logo`.

**Always use fallback patterns:**
```javascript
company.CompanyName || company.name
company.ScripName || company.scriptName  
company.Logo || company.logo
```

See: `UnlistedHub-USM/frontend/src/components/CreateListingModal.jsx` lines 249-262

### KYC & Document Management
**Storage:** Cloudinary (not MongoDB) - only URLs stored in database

**User schema fields:**
- `kycDocuments.pan` - PAN card URL
- `kycDocuments.aadhar` - Aadhar number (text)
- `kycDocuments.aadharFront` - Aadhar front image URL
- `kycDocuments.aadharBack` - Aadhar back image URL
- `kycDocuments.cancelledCheque` - Cancelled cheque URL
- `kycDocuments.cml` - CML statement URL
- `kycStatus` - Enum: `not_verified`, `pending`, `verified`, `rejected`
- `profileImage` - Profile photo URL

**Upload workflow:**
1. Frontend uploads file to `/api/uploads/profile-image` or `/api/uploads/document`
2. Backend validates (10MB max, JPG/PNG/PDF only)
3. Multer stores in memory, uploads to Cloudinary
4. Returns secure HTTPS URL to frontend
5. Frontend updates user profile with URL

See: `routes/uploads.js`, `routes/kyc.js`, `CLOUDINARY_SETUP.md`

### Listing Lifecycle
**Status flow:** `active` → `negotiating` → `deal_pending` → `sold`/`cancelled`

**Validation:**
- Max 4 counter-offers enforced
- Backend: `UnlistedHub-USM/backend/models/Listing.js` with `counterHistory[]`

### Company Visibility
Show companies only when:
```javascript
verificationStatus === 'verified' || addedBy === 'admin'
```

### Bid/Offer Status Flow
**Critical state machine** (see `models/Listing.js` bidSchema):
- `pending` - Initial bid/offer, awaiting seller/buyer response
- `countered` - Counter-offer made (max 4 rounds in `counterHistory[]`)
- `pending_confirmation` - One party accepted, waiting for other party
- `confirmed` - Both parties confirmed (deal locked)
- `rejected` / `cancelled` / `expired` - Terminal states

**Status transitions:**
1. Buyer bids → `pending`
2. Seller counters → `countered` (round 1)
3. Buyer counters back → `countered` (round 2)
4. Seller accepts → `pending_confirmation`
5. Buyer confirms → `confirmed` (admin completes transaction)

## Security & Auth

### ES Modules Only
**No CommonJS** - all files use `import`/`export`. Backend: `"type": "module"` in `package.json`.

### Route Protection Pattern
```javascript
router.post('/admin-only', protect, authorize('admin'), handler);
```
1. `protect` - validates JWT, checks user exists & not banned
2. `authorize('admin')` - role check
3. `optionalAuth` - for public endpoints that benefit from user context

See: `UnlistedHub-USM/backend/middleware/auth.js`

**Validation Middleware:**
- Use `express-validator` chains from `middleware/validation.js`
- Example: `validateListing`, `validateBid`, `validatePagination`
- Always include `handleValidationErrors` at end of validation chain

### Security Stack (applied globally in server.js)
- **Helmet** with strict CSP (whitelist: CORS_ORIGINS + `*.vercel.app` + localhost)
- **Argon2id** password hashing (User.js)
- **JWT_SECRET** - Must be ≥32 chars (startup validator exits if too short)
- **Rate limiting** - express-rate-limit
- **Sanitization** - express-mongo-sanitize, xss-clean, custom `sanitizeInput` and `detectInjectionAttempt` middleware

**CORS config:**
- Base: `localhost:3000`, `FRONTEND_URL`, `nlistplanet.com`, `*.vercel.app`
- Extends via `CORS_ORIGINS` env (comma-separated)

## Push Notifications (Firebase Cloud Messaging)

### Backend
**Module:** `UnlistedHub-USM/backend/utils/pushNotifications.js`
- Templates in `NotificationTemplates` object
- Tokens stored: `User.fcmTokens[]` array (supports multi-device)
- Conditional import - graceful degradation if firebase-admin missing

**Test commands:**
```bash
node test-push-notification.js <username>
node scripts/checkUserTokenDebug.js <username>  # debug tokens
```

### Frontend Service Workers
- Desktop: `UnlistedHub-USM/frontend/public/firebase-messaging-sw.js`
- Mobile: `nlistplanet-mobile/frontend/public/firebase-messaging-sw.js`

## Environment Variables

### Backend Required (.env)
```bash
MONGODB_URI=mongodb://...              # MongoDB connection
JWT_SECRET=<min-32-chars>              # Startup fails if <32 chars
CORS_ORIGINS=https://...               # Comma-separated extras
FRONTEND_URL=https://...               # Main frontend
FIREBASE_SERVICE_ACCOUNT='{...}'       # Raw JSON, no file path
OPENAI_API_KEY=sk-...                  # For news summaries/highlights
CLOUDINARY_CLOUD_NAME=nlistplanet      # For KYC/profile image storage
CLOUDINARY_API_KEY=...                 # Cloudinary API key
CLOUDINARY_API_SECRET=...              # Cloudinary API secret
```

**OpenAI Integration:**
- Lazy initialization in `utils/newsAI.js` (graceful degradation if missing)
- Used for: News summaries (60 words), Hindi translations, editor's notes
- Test: `node test-openai.js` or `node test-auto-highlights.js`

**Cloudinary Integration:**
- Stores KYC documents and profile images (not in MongoDB)
- Folder structure: `nlistplanet/profile-images/{userId}/` and `nlistplanet/kyc-documents/{userId}/`
- Supports images (JPG/PNG) and PDFs (max 10MB)
- See `CLOUDINARY_SETUP.md` for complete setup guide

### Frontend Required
```bash
REACT_APP_API_URL=http://localhost:5000/api       # Backend URL
REACT_APP_PLATFORM_FEE_PERCENTAGE=2               # Desktop only (mobile hardcoded)
```

Mobile PWA: Same pattern, adjust for deployment URLs.

## News & AI Features

### Auto-News Scheduler
**Module:** `UnlistedHub-USM/backend/utils/newsScheduler.js`
- Runs in-process (no cron needed), starts with server
- Fetches from RSS feeds every 30 minutes
- Filters by keywords: `unlisted`, `pre-ipo`, `ipo`, `sebi`, etc.
- Auto-categorizes: IPO, Unlisted, Startup, Regulatory, Market

**RSS Sources:**
- Economic Times Markets
- Moneycontrol Top News
- Google News (unlisted shares, IPO India)
- ET IPO/FPO

**Manual fetch:**
```bash
node scripts/fetchNews.js
```

### AI Processing
**Module:** `UnlistedHub-USM/backend/utils/newsAI.js`
- `generateEditorNote()` - 2-line summary in professional tone
- `generateHindiSummary()` - Full Hindi translation
- `generateCompanyHighlights()` - 3 key points for company pages

**Admin routes:** `/api/admin/news/ai/*` - Generate summaries, translate, batch process

## Common Pitfalls

### Fee Logic Drift
**Symptom:** Users see wrong prices on mobile vs desktop.  
**Fix:** Update `helpers.js` in **both** frontend folders simultaneously.

### Mixed-Case Company Fields
**Symptom:** Undefined company names/logos.  
**Fix:** Use fallback pattern: `company.CompanyName || company.name`

### Port Already in Use
**Windows:**
```powershell
Stop-Process -Name "node" -Force
```

### Startup Crashes
**Common causes:**
1. Missing `.env` file
2. JWT_SECRET < 32 chars (validator exits immediately)
3. MONGODB_URI incorrect

**Debug order:**
1. Check `.env` exists in backend folder
2. Verify JWT_SECRET length
3. Test MongoDB connection externally
4. Check logs for which env var validation failed

### Auto-Deploy Not Triggering
**Symptom:** Push to `main` doesn't deploy backend.  
**Fix:** Check Render dashboard → Settings → Auto-Deploy enabled, branch = `main` (not master)  
**Workaround:** Use Manual Deploy button until webhook reconnects

### Vercel Auto-Deploy Issues (Private Repo)
**Symptom:** Frontend deployments stopped after making repo private.  
**Fix:** Re-authorize GitHub integration in Vercel dashboard  
**Details:** See `VERCEL_PRIVATE_REPO_FIX.md`  
**Steps:**
1. Vercel → Settings → Git → Disconnect
2. Connect Git Repository → GitHub → Authorize
3. Select private repo → Install & Authorize

### News Scheduler Not Running
**Symptom:** No new news articles appearing.  
**Check:** `/api/health` endpoint - scheduler status should be "running"  
**Manual trigger:** `node scripts/fetchNews.js`

### 401 Unauthorized Errors
**Symptom:** User suddenly logged out or API calls fail with 401.  
**Root cause:** Axios interceptor in `AuthContext.jsx` auto-logout on invalid/expired JWT  
**Debug:** Check browser localStorage for `token`, verify JWT_SECRET matches between backend .env and token generation

### Price Discrepancies in Listings
**Symptom:** Buyer/seller see different prices than expected.  
**Root cause:** Not using `getNetPriceForUser()` helper correctly  
**Fix pattern:**
```javascript
// WRONG - shows raw price without fee adjustment
<span>{listing.price}</span>

// CORRECT - shows user's actual price
const netPrice = getNetPriceForUser(bid, listing.type, isOwner);
<span>{formatCurrency(netPrice)}</span>
```

## File Locations Reference

**Fee logic:**
- `UnlistedHub-USM/frontend/src/utils/helpers.js`
- `nlistplanet-mobile/frontend/src/utils/helpers.js`
- `UnlistedHub-USM/backend/models/Listing.js` (bidSchema stores fee breakdown)

**Auth middleware:**
- `UnlistedHub-USM/backend/middleware/auth.js` (protect, authorize, optionalAuth)

**Security stack:**
- `UnlistedHub-USM/backend/server.js` lines 1-150 (helmet, CORS, rate limiting)
- `UnlistedHub-USM/backend/middleware/validation.js` (sanitizeInput)
- `UnlistedHub-USM/backend/middleware/securityLogger.js` (detectInjectionAttempt)

**Models:**
- `UnlistedHub-USM/backend/models/` - all Mongoose schemas (Company, Listing, User, etc.)

## Testing & Validation Scripts

### Backend Testing Utilities
Located in `UnlistedHub-USM/backend/` and `/scripts/`:

**Push Notifications:**
- `node test-push-notification.js <username>` - Send test push to user
- `node scripts/checkUserTokenDebug.js <username>` - Debug FCM token issues
- `node scripts/sendTestToUser.js <username>` - Alternative push test

**AI/News Testing:**
- `node test-openai.js` - Verify OpenAI API connection
- `node test-auto-highlights.js` - Test company highlight generation
- `node scripts/fetchNews.js` - Manual news fetch

**Data Management:**
- `node scripts/createAdmin.js` - Create/reset admin account
- `node scripts/seedCompanies.js` - Populate company database
- `node scripts/checkDatabase.js` - Verify DB schema integrity

**User Management:**
- `node scripts/makeUserAdmin.js` - Promote user to admin
- `node scripts/checkAllUsers.js` - List all users with stats

## React Component Patterns

### State Management
**Context-based architecture** - No Redux/Zustand:
- `UnlistedHub-USM/frontend/src/context/AuthContext.jsx` - Global auth state
- Use `useAuth()` hook: `const { user, login, logout, loading } = useAuth()`
- Auto-logout after 30min inactivity (configured in AuthContext)

**Data fetching:**
- Axios with JWT interceptor (auto-logout on 401)
- Base API utilities in `src/utils/api.js` (listingsAPI, companiesAPI, etc.)
- No React Query - direct API calls with `useState`/`useEffect`

### UI/UX Standards
**Styling:** Tailwind CSS with modern design system
- **Modern UI Library:** `src/modern-ui.css` - 100+ utility classes (desktop only)
- **Mobile UI:** `src/modern-ui-mobile.css` - Mobile-optimized components
- **Effects:** Glassmorphism, gradients, animations, glow effects
- Primary colors: `bg-gray-900` (dark backgrounds), `text-emerald-500` (CTAs)
- Modern components: `.btn-modern`, `.card-modern`, `.input-modern`, `.badge-modern`
- Visual effects: `.hover-lift`, `.glow-emerald`, `.glass-effect`, `.transition-smooth`
- Use shadcn/ui component patterns (see `components.json`, `tailwind.config.js`)
- Dark theme design system: `dark-50` through `dark-900` scale
- Responsive: Mobile-first, breakpoint at `2xl:1400px`

**User feedback:**
- `react-hot-toast` for all notifications (no alerts)
- Standard patterns: `toast.success('✅ Message')`, `toast.error('Error message')`
- Loading states: `<Loader>` component from `lucide-react`
- Skeleton loading: `.skeleton-modern` class

**Icons:** `lucide-react` only (consistent across app)

**UI Documentation:**
- `UI_MODERNIZATION_GUIDE.md` - Complete desktop UI guide
- `UI_MODERNIZATION_SUMMARY.md` - Quick reference for modern components
- `nlistplanet-mobile/MOBILE_UI_GUIDE.md` - Mobile UI patterns

### Component Organization
**File structure conventions:**
- Pages: `src/pages/*Page.jsx` (LoginPage, DashboardPage, etc.)
- Reusable UI: `src/components/` (modals, cards, forms)
- Dashboard widgets: `src/components/dashboard/` (MyPostCard, HistoryTab, etc.)

**Naming patterns:**
- Components: PascalCase with descriptive suffixes (`Modal`, `Card`, `Tab`)
- Utilities: camelCase functions in `src/utils/helpers.js`
- API modules: `*API` suffix (e.g., `listingsAPI`, `authAPI`)

## API Integration Patterns

### Request/Response Flow
**All API calls through centralized modules:**
```javascript
import { listingsAPI } from '../utils/api';
const listings = await listingsAPI.getAll();
```

**Error handling standard:**
```javascript
try {
  const result = await api.call();
  toast.success('Action completed!');
} catch (error) {
  toast.error(error.response?.data?.message || 'Operation failed');
}
```

**Protected routes:** Always check `user` from `useAuth()` before rendering admin/protected UI

### Data Transformation
**Company field access - always use fallbacks:**
```javascript
const name = company.CompanyName || company.name;
const logo = company.Logo || company.logo;
const scrip = company.ScripName || company.scriptName;
```

**Price display - never show raw prices:**
```javascript
import { getNetPriceForUser, formatCurrency } from '../utils/helpers';
const visiblePrice = getNetPriceForUser(bid, listing.type, isOwner);
const formatted = formatCurrency(visiblePrice);
```

## Development Tools & Validation

### Pre-Start Validation
**Always validate environment before starting server:**
```bash
cd UnlistedHub-USM/backend
node scripts/validateEnv.js  # Checks all env vars, exits with errors if misconfigured
```

**Quick API health check:**
```bash
node scripts/quickTest.js    # Tests all public endpoints, CORS, rate limiting
```

### Quality Checks
- **Environment validation** - `scripts/validateEnv.js` catches config issues early
- **API testing** - `scripts/quickTest.js` validates endpoints without Postman
- **Build verification** - Always `npm run build` before pushing to test production builds
- **Database checks** - `scripts/checkDatabase.js` verifies schema integrity

## Additional Documentation
- `DEV_GUIDE.md` - **START HERE** - Daily workflows, troubleshooting, commands
- `NLISTPLANET_MASTER_DOCS.md` - Comprehensive project documentation
- `PUSH_NOTIFICATIONS_COMPLETE.md` - FCM implementation guide
- `REFERRAL_TRACKING_SYSTEM.md` - Referral/share tracking architecture
- `FIREBASE_SETUP_EASY.md` - Firebase configuration steps
- `RENDER_AUTODEPLOY.md` - Backend deployment troubleshooting
- `VERCEL_AUTODEPLOY.md` - Frontend deployment guide (Desktop + Mobile)
- `CLOUDINARY_SETUP.md` - Document storage setup and usage
- `UI_MODERNIZATION_GUIDE.md` - Desktop UI component library guide
- `UI_MODERNIZATION_SUMMARY.md` - Quick reference for modern UI
- `nlistplanet-mobile/MOBILE_UI_GUIDE.md` - Mobile PWA UI patterns

