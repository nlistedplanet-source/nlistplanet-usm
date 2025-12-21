# Copilot Instructions — NListPlanet / UnlistedHub

## 🏗️ Architecture (One Brain, Two Bodies)
| Layer | Stack | Port | Path |
|-------|-------|------|------|
| **Backend** | Express + MongoDB | 5000 | `UnlistedHub-USM/backend` |
| **Desktop** | React 18 + Tailwind | 3000 | `UnlistedHub-USM/frontend` |
| **Mobile** | React 19 PWA + Tailwind | 3001 | `nlistplanet-mobile/frontend` |

**Core Concept:** Anonymous P2P marketplace for unlisted shares. Users trade via system-generated usernames (`@trader_xxx`). Admin mediates all transactions.

**Critical Rule:** Backend changes affect BOTH frontends. Test on both after API changes.

## 🚀 Development Workflows
```bash
# Start backend FIRST (required for both frontends)
cd UnlistedHub-USM/backend && npm run dev

# Desktop frontend
cd UnlistedHub-USM/frontend && npm start

# Mobile PWA (PowerShell)
cd nlistplanet-mobile/frontend
$env:BROWSER='none'; $env:PORT='3001'; npm start

# Key backend scripts
cd UnlistedHub-USM/backend
npm run seed                                    # Seed companies from CSV
node scripts/createAdmin.js                     # Create admin user
node scripts/fetchNews.js                       # Manual RSS news fetch
node scripts/checkUserTokenDebug.js <username>  # Debug FCM tokens
node test-push-notification.js <username>       # Test push notification
```

## 💰 Platform Fee (Hidden 2% - Critical Business Logic)
**One-sided fee:** ONLY the initiator pays (never both parties).
- **SELL @ ₹100:** Seller gets ₹100, Buyer pays ₹102 (+2%)
- **BUY @ ₹100:** Buyer pays ₹100, Seller gets ₹98 (-2%)

```javascript
// Frontend: src/utils/helpers.js (MUST sync between both frontends!)
calculateBuyerPays(price)   // price * 1.02
calculateSellerGets(price)  // price * 0.98

// Backend: Listing.bids[] schema stores
{ buyerOfferedPrice, sellerReceivesPrice, platformFee, platformFeePercentage }
```

**Never expose** fee percentage to users. Show only net amounts via `getNetPriceForUser()`.

## 🔑 Key Patterns & Conventions
- **ES Modules Only:** Use `import/export`. Never `require()`.
- **Company Model Casing (Legacy):**
  ```javascript
  // Always handle both patterns for backward compatibility
  company.CompanyName || company.name
  company.ScripName || company.scriptName
  company.Logo || company.logo
  ```
- **Dual Frontend Sync Required:** `ShareCardGenerator.jsx` and `helpers.js` must stay identical across both frontends.
- **Listing Status Flow:** `active` → `negotiating` → `deal_pending` → `sold`/`cancelled`
- **Counter Rounds:** Max 4 counter-offers per bid (enforced in validation)
- **Company Verification:** Marketplace filters by `verificationStatus: 'verified'` OR `addedBy: 'admin'`

## 🛡️ Security & Auth
```javascript
// Middleware chain pattern
import { protect, authorize } from './middleware/auth.js';

router.get('/admin-only', protect, authorize('admin'), handler);
router.get('/user-only', protect, handler);
```

- **Password Hashing:** Argon2id (in `User.js` pre-save hook)
- **JWT:** 32+ char secret, `Authorization: Bearer {token}` header
- **Rate Limiting:** Global 100 req/15min, auth routes 5 req/15min
- **CORS:** Whitelist in `CORS_ORIGINS` env. Auto-allows `*.vercel.app` and localhost.
- **Input Sanitization:** `express-mongo-sanitize`, `xss-clean`, custom `sanitizeInput` middleware

## 🔔 Push Notifications (Firebase FCM)
```javascript
// Backend: utils/pushNotifications.js
import { createAndSendNotification, NotificationTemplates } from './pushNotifications.js';

// Send notification with template
await createAndSendNotification(userId, NotificationTemplates.NEW_BID(bidderName, companyName));

// FCM tokens stored in User.fcmTokens[] (multi-device support)
```
- **Testing:** `node test-push-notification.js <username>`
- **Debug:** `node scripts/checkUserTokenDebug.js <username>`
- **Service Worker:** `public/firebase-messaging-sw.js`

## 📱 Mobile-Only Utilities (`nlistplanet-mobile/frontend/src/utils/helpers.js`)
```javascript
haptic.light()               // 10ms vibration
haptic.success()             // [10, 50, 10]ms pattern
formatShortNumber(1500000)   // → "15 L" (Lakhs/Crores format)
storage.get('key')           // Safe localStorage with JSON parse
```

## 🗄️ Database Models
| Model | Key Fields | Notes |
|-------|------------|-------|
| `User` | `fcmTokens[]`, `role`, `isBanned` | Username lowercase, unique |
| `Listing` | `bids[]`, `type`, `status`, `postId` | PostId format: `NLP-8C79CB` |
| `Company` | `verificationStatus`, `addedBy`, `highlights[]` | Mixed-case legacy fields |
| `CompletedDeal` | Seller/buyer/admin confirmations | Final transaction record |
| `Notification` | `actionUrl` for deep-linking | In-app + push |

## 🛤️ API Routes (`/api/*`)
| Route | Purpose | Auth |
|-------|---------|------|
| `/auth` | Register, login, OTP, Google | Public |
| `/listings` | CRUD, bidding, counters | `protect` |
| `/companies` | Search, user-submitted | Mixed |
| `/notifications` | List, mark read, FCM registration | `protect` |
| `/admin/*` | User/deal management | `protect` + `authorize('admin')` |

## 📋 Environment Variables
```env
# Backend (.env)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<32+ chars, REQUIRED>
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://nlistplanet.com
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
OPENAI_API_KEY=sk-...  # For AI summaries

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚨 Common Pitfalls
| Issue | Solution |
|-------|----------|
| Fee logic mismatch | Sync `helpers.js` to BOTH frontends after changes |
| Company name undefined | Use `company.CompanyName \|\| company.name` pattern |
| Auth route unprotected | Add `protect` middleware before handler |
| FCM init fails | Verify `FIREBASE_SERVICE_ACCOUNT` is valid JSON (no outer quotes) |
| Listing not showing | Check `verificationStatus !== 'pending'` for company |
| Port 5000 in use | Kill node processes: `Stop-Process -Name "node" -Force` |

