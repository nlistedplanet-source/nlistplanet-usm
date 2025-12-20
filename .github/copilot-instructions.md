# Copilot Instructions — NListPlanet / UnlistedHub

## 🏗️ Architecture (One Brain, Two Bodies)

```
UnlistedHub-USM/backend/     → Express API (Port 5001) - serves BOTH frontends
UnlistedHub-USM/frontend/    → Desktop React 18 + Tailwind (Port 3000)
nlistplanet-mobile/frontend/ → Mobile PWA React 19 + Tailwind (Port 3001)
```

**Core Concept:** Anonymous P2P marketplace for unlisted shares. Users trade via system-generated usernames (`@trader_xxx`). Admin mediates all transactions. Platform earns **hidden 2% fee**.

## 🚀 Quick Start & Workflows

```bash
# Backend (always start first)
cd UnlistedHub-USM/backend && npm install && npm run dev

# Desktop OR Mobile frontend
cd UnlistedHub-USM/frontend && npm start       # Desktop :3000
cd nlistplanet-mobile/frontend && npm start    # Mobile :3001
```

**Health check:** `GET /api/health` • **Kill port:** `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess -Force`

## 💰 Platform Fee (CRITICAL)

Hidden 2% brokerage where **ONLY one side pays** (never both):

| Listing Type | Owner Gets | Others See/Pay |
|--------------|------------|----------------|
| SELL @ ₹100  | ₹100       | ₹102 (buyer pays +2%) |
| BUY @ ₹100   | ₹100       | ₹98 (seller gets -2%)  |

**Always use helpers from `src/utils/helpers.js`:**
```javascript
calculateBuyerPays(price)   // → price × 1.02
calculateSellerGets(price)  // → price × 0.98
getPriceDisplay(price, listingType, isOwner) // → { displayPrice, label }
```
**Backend stores:** `buyerOfferedPrice`, `sellerReceivesPrice`, `platformFee` on bids. **Never expose fee to users.**

## 🔑 Key Files & Patterns

| Purpose | Path |
|---------|------|
| Security/CORS | `backend/server.js` (Helmet, Rate limit, Mongo-sanitize) |
| Auth Middleware | `backend/middleware/auth.js` (`protect`, `authorize`, `optionalAuth`) |
| API Client | `frontend/src/utils/api.js` (Auto token injection, 401 handling) |
| Models | `backend/models/` - User (Argon2id), Listing (bids), Company (mixed casing) |
| Push Notifications | `backend/utils/pushNotifications.js` (FCM integration) |
| Shared Components | `ShareCardGenerator.jsx` (Keep synced between Desktop/Mobile) |

## 🛡️ Security & Auth

- **JWT:** 32+ char `JWT_SECRET` required. Tokens via `Authorization: Bearer {token}`.
- **Password:** 12-128 chars, Argon2id hashing (never bcrypt).
- **Frontend:** 30-min inactivity auto-logout, 401 clears localStorage.

## 🔔 Push Notifications (Firebase)

**Always use** `createAndSendNotification(userId, data)` in `backend/utils/pushNotifications.js`:
- Creates in-app notification + sends FCM push.
- Multi-device support via `user.fcmTokens[]`.
- Templates: `NotificationTemplates.NEW_BID()`, `.BID_ACCEPTED()`, etc.

## 📱 Mobile-Only Utilities (`src/utils/helpers.js`)

```javascript
haptic.light()          // 10ms vibration
haptic.success()        // [10, 50, 10]ms pattern
formatShortNumber(num)  // 1500000 → "15 L"
```

## 🚫 Don'ts

1. **Never expose platform fee** to users.
2. **Never use `require()`** — ES modules only (`import/export`).
3. **Never assume** legacy `CompanyName` — use `name` field (or handle both).
4. **Never hardcode prices** — use helper functions.
5. **Never forget:** Backend changes impact BOTH UIs.
