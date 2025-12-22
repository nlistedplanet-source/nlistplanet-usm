# Copilot Instructions — NListPlanet / UnlistedHub

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
MONGODB_URI=mongodb://...           # MongoDB connection
JWT_SECRET=<min-32-chars>           # Startup fails if <32 chars
CORS_ORIGINS=https://...            # Comma-separated extras
FRONTEND_URL=https://...            # Main frontend
FIREBASE_SERVICE_ACCOUNT='{...}'    # Raw JSON, no file path
OPENAI_API_KEY=sk-...               # For news summaries/highlights
```

**OpenAI Integration:**
- Lazy initialization in `utils/newsAI.js` (graceful degradation if missing)
- Used for: News summaries (60 words), Hindi translations, editor's notes
- Test: `node test-openai.js` or `node test-auto-highlights.js`

### Frontend Required
```bash
REACT_APP_API_URL=http://localhost:5000/api  # Backend URL
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

## Additional Documentation
- `NLISTPLANET_MASTER_DOCS.md` - Comprehensive project documentation
- `PUSH_NOTIFICATIONS_COMPLETE.md` - FCM implementation guide
- `REFERRAL_TRACKING_SYSTEM.md` - Referral/share tracking architecture
- `FIREBASE_SETUP_EASY.md` - Firebase configuration steps
- `RENDER_AUTODEPLOY.md` - Backend deployment troubleshooting
- `VERCEL_AUTODEPLOY.md` - Frontend deployment guide (Desktop + Mobile)

