# Copilot Instructions — NListPlanet / UnlistedHub

## Architecture (One Backend, Two Frontends)

```
UnlistedHub-USM/backend/     → Express API (Port 5001) - serves BOTH frontends
UnlistedHub-USM/frontend/    → Desktop React 18 + Tailwind (Port 3000)
nlistplanet-mobile/frontend/ → Mobile PWA React 19 + Tailwind (Port 3001)
```

**Core Concept:** Anonymous P2P marketplace for unlisted shares. Users trade via system-generated usernames (`@trader_xxx`). Admin mediates all transactions. Platform earns **hidden 2% fee**.

## Quick Start

```bash
# Backend (always start first)
cd UnlistedHub-USM/backend && npm install && npm run dev

# Desktop OR Mobile frontend
cd UnlistedHub-USM/frontend && npm start       # Desktop :3000
cd nlistplanet-mobile/frontend && npm start    # Mobile :3001
```

**Health check:** `GET /api/health` • **Kill port:** `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess -Force`

**Common Issues:**
- Backend won't start: Check `MONGODB_URI` and `JWT_SECRET` (32+ chars) in `.env`
- Frontend 401 errors: Backend cold start on Render takes 30-60s, retry or use cached user data
- Port already in use: `Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue`

## 💰 Platform Fee (CRITICAL - Read This)

Hidden 2% brokerage where **ONLY one side pays** (never both):

| Listing Type | Owner Gets | Others See/Pay |
|--------------|------------|----------------|
| SELL @ ₹100  | ₹100       | ₹102 (buyer pays +2%) |
| BUY @ ₹100   | ₹100       | ₹98 (seller gets -2%)  |

**Always use helpers from `frontend/src/utils/helpers.js`:**
```javascript
calculateBuyerPays(price)   // → price × 1.02
calculateSellerGets(price)  // → price × 0.98
getPriceDisplay(price, listingType, isOwner) // → { displayPrice, label }
```

**Backend stores:** `buyerOfferedPrice`, `sellerReceivesPrice`, `platformFee` on bids. **Never expose fee to users.**

## Key Files

| Purpose | Path |
|---------|------|
| Security/CORS/Routes | `backend/server.js` |
| Auth middleware | `backend/middleware/auth.js` (`protect`, `authorize`, `optionalAuth`) |
| Price helpers | `frontend/src/utils/helpers.js` (both frontends have this) |
| API client | `frontend/src/utils/api.js` (auto token injection, 401 handling) |
| Models | `backend/models/` - User (Argon2id), Listing (bids), Company (auto-lowercase pan/isin) |
| Push notifications | `backend/utils/pushNotifications.js` (FCM integration, templates) |
| Email service | `backend/utils/emailService.js` (SMTP via nodemailer) |
| News scheduler | `backend/utils/newsScheduler.js` (RSS feeds, AI processing) |

## Auth & Security

- **JWT:** 32+ char `JWT_SECRET` required, tokens via `Authorization: Bearer {token}`
- **Middleware order:** Helmet → CORS → Rate limit (300/15min) → mongo-sanitize → xss-clean
- **Password:** 12-128 chars, Argon2id hashing (never bcrypt)
- **Frontend:** 30-min inactivity auto-logout, 401 clears localStorage

## Two-Step Bid Flow

```
Bid placed → pending
First accept → accepted (listing hidden)
Second accept → confirmed (verification codes generated)
Admin closes → closed (transaction complete)
```

Users see only `@trader_xxx` usernames. Real identities visible to admin only.

## Push Notifications (Firebase)

**Architecture:** FCM (Firebase Cloud Messaging) sends instant notifications to all user devices.

**Key Function:** `createAndSendNotification(userId, data)` in `backend/utils/pushNotifications.js`
- Creates in-app notification + sends FCM push (non-blocking)
- Auto-cleans invalid tokens
- Multi-device support via `user.fcmTokens[]` array
- Templates: `NotificationTemplates.NEW_BID()`, `.BID_ACCEPTED()`, etc.

**Usage pattern:**
```javascript
// OLD (in-app only) - DON'T use
await Notification.create({ userId, type, title, message });

// NEW (in-app + push) - ALWAYS use
await createAndSendNotification(userId, {
  ...NotificationTemplates.NEW_BID(username, price, qty, company),
  data: { listingId: id },
  actionUrl: '/dashboard/bids'
});
```

**Setup:** `FIREBASE_SERVICE_ACCOUNT` env var (JSON string). See [FIREBASE_SETUP_EASY.md](FIREBASE_SETUP_EASY.md).

## Dual Frontend Sync

**Components duplicated in both UIs** (always update both):
- `ShareCardGenerator.jsx` - investment highlight cards with html2canvas

**Mobile-only utilities** in `nlistplanet-mobile/frontend/src/utils/helpers.js`:
```javascript
haptic.light()          // Vibration feedback
haptic.success()        // [10, 50, 10]ms pattern
formatShortNumber(num)  // 1500000 → "15 L"
```

**AuthContext differences:**
- Desktop: `UnlistedHub-USM/frontend/src/context/AuthContext.jsx` (410 lines)
- Mobile: `nlistplanet-mobile/frontend/src/context/AuthContext.jsx` (293 lines)
- Both: 30-min inactivity logout, FCM token management, cached user fallback

## API Client Pattern

**Auto token injection:** `frontend/src/utils/api.js` sets `Authorization: Bearer {token}` automatically
```javascript
// CORRECT - api.js adds token
await listingsAPI.getAll({ status: 'active' });

// WRONG - manual axios call without token
await axios.get('/api/listings');
```

**401 handling:** Mobile/Desktop AuthContext clears localStorage on 401 → redirects to login.

## Environment Variables

**Required:** `MONGODB_URI`, `JWT_SECRET` (32+ chars), `FRONTEND_URL`, `CORS_ORIGINS`
**Optional:** `OPENAI_API_KEY` (AI news), `CLOUDINARY_*` (images), `FIREBASE_SERVICE_ACCOUNT` (push notifications)

**Deployment:** Backend on Render.com (Oregon free tier), auto-deploy from `main` branch
- Production API: `https://nlistplanet-usm-v8dc.onrender.com/api`
- Manual deploy if auto-deploy fails (see [RENDER_AUTODEPLOY.md](UnlistedHub-USM/backend/RENDER_AUTODEPLOY.md))
- Cold start: 30-60s on first request after inactivity

## 🚫 Don'ts

1. **Never expose platform fee** to users
2. **Never use `require()`** — ES modules only (`import/export`)
3. **Never weaken** rate limiting or security middleware
4. **Never assume** legacy `CompanyName` — use `name` field
5. **Never hardcode prices** — use helper functions
6. **Never forget:** Backend changes impact BOTH UIs

## Docs Reference

- [PLATFORM_FEE_MODEL.md](PLATFORM_FEE_MODEL.md) — Fee calculation examples
- [TWO_STEP_ACCEPT_FLOW_UNIFIED.md](TWO_STEP_ACCEPT_FLOW_UNIFIED.md) — Bid acceptance flow
- [NLISTPLANET_MASTER_DOCS.md](NLISTPLANET_MASTER_DOCS.md) — Complete system architecture
- [FIREBASE_SETUP_EASY.md](FIREBASE_SETUP_EASY.md) — Push notification setup
