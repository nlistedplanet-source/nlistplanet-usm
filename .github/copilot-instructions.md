# Copilot Instructions — NListPlanet / UnlistedHub

## 🏗️ Architecture (One Brain, Two Bodies)
- **Backend:** Express API (Port 5001) - serves BOTH frontends.
- **Desktop:** React 18 + Tailwind (Port 3000).
- **Mobile:** React 19 + Tailwind PWA (Port 3001).
- **Core Concept:** Anonymous P2P marketplace for unlisted shares. Users trade via system-generated usernames (`@trader_xxx`). Admin mediates all transactions.

## 🚀 Critical Workflows
```bash
# Backend (Start first)
cd UnlistedHub-USM/backend && npm run dev

# Desktop OR Mobile frontend
cd UnlistedHub-USM/frontend && npm start       # Desktop
cd nlistplanet-mobile/frontend && npm start    # Mobile

# Admin & Data
npm run seed                       # Seed company data (Backend)
node scripts/createAdmin.js        # Create admin user (Backend)
node scripts/fetchNews.js          # Manual news fetch (RSS)
```

## 💰 Platform Fee (Hidden 2%)
Brokerage where **ONLY one side pays** (never both):
- **SELL @ ₹100:** Owner gets ₹100, Buyer pays ₹102 (+2%).
- **BUY @ ₹100:** Owner pays ₹100, Seller gets ₹98 (-2%).
- **Helpers:** Use `calculateBuyerPays(price)` and `calculateSellerGets(price)` from `src/utils/helpers.js`.
- **Storage:** Backend stores `buyerOfferedPrice`, `sellerReceivesPrice`, and `platformFee`. **Never expose fee to users.**

## 🔑 Key Patterns & Conventions
- **ES Modules:** Use `import/export` only. No `require()`.
- **Company Model:** Handle mixed casing: `company.CompanyName || company.name`.
- **Syncing:** Always update `ShareCardGenerator.jsx` and `helpers.js` in BOTH frontends when modified.
- **Security:** Argon2id for passwords, JWT (32+ chars) for auth, `authorize('admin')` for admin routes.
- **Push Notifications:** Use `createAndSendNotification(userId, data)` in `backend/utils/pushNotifications.js`.
- **Post IDs:** Listings use `postId` (e.g., `NLP-123456`).

## 📱 Mobile-Only Utilities
- **Haptics:** `haptic.light()`, `haptic.success()`, `haptic.error()`.
- **Formatting:** `formatShortNumber(num)` (e.g., 1500000 → "15 L").

## 🛡️ Security & Auth
- **JWT:** Tokens via `Authorization: Bearer {token}`.
- **Auto-Logout:** 30-min inactivity on frontend. 401 clears localStorage.

