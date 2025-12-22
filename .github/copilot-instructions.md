# Copilot Instructions — NListPlanet / UnlistedHub

## Architecture & Purpose
- Marketplace for unlisted shares with anonymous `@trader_xxx` identities; admin mediates deals.
- Monorepo paths: backend (Express + MongoDB) at UnlistedHub-USM/backend, desktop React 18 at UnlistedHub-USM/frontend, mobile PWA React 19 at nlistplanet-mobile/frontend.
- Default ports: backend 5000, desktop 3000, mobile 3001. Backend must start first; API changes impact both frontends.

## Run & Debug
- Backend: `cd UnlistedHub-USM/backend && npm run dev` (nodemon). Key scripts: `npm run seed`, `node scripts/createAdmin.js`, `node scripts/fetchNews.js`, `node scripts/checkUserTokenDebug.js <username>`, `node test-push-notification.js <username>`.
- Desktop: `cd UnlistedHub-USM/frontend && npm start`.
- Mobile (PowerShell): `cd nlistplanet-mobile/frontend; $env:BROWSER='none'; $env:PORT='3001'; npm start`.
- News scheduler auto-starts with server; health at `/api/health`.

## Business Logic (must stay consistent)
- Hidden 2% one-sided fee: initiator pays. SELL ₹100 → buyer pays 102, seller gets 100. BUY ₹100 → buyer pays 100, seller gets 98.
- Keep fee helpers identical in both frontends: src/utils/helpers.js. Backend stores `{ buyerOfferedPrice, sellerReceivesPrice, platformFee, platformFeePercentage }` on bids. Never show fee %; display net via `getNetPriceForUser()`.
- Sync shared UI utilities: ShareCardGenerator.jsx and helpers.js across desktop + mobile.

## Data & Models
- Legacy casing: always guard fields (`company.CompanyName || company.name`, `company.ScripName || company.scriptName`, `company.Logo || company.logo`).
- Listing status flow: active → negotiating → deal_pending → sold/cancelled. Max 4 counter-offers enforced in validation.
- Companies shown when `verificationStatus === 'verified'` or `addedBy === 'admin'`.

## Security & Auth
- ES modules only (no require). Protect routes with `protect` then `authorize('admin')` where needed.
- Argon2id hashing in User.js; JWT secret must be ≥32 chars (process exits otherwise).
- Global rate limiting and sanitization stack: helmet CSP + CORS whitelist (CORS_ORIGINS plus *.vercel.app + localhost), express-mongo-sanitize, xss-clean, custom sanitizeInput and detectInjectionAttempt middleware.

## Push Notifications (FCM)
- Backend utility: utils/pushNotifications.js with NotificationTemplates; tokens stored in User.fcmTokens[].
- Tests: `node test-push-notification.js <username>`; debug tokens with `node scripts/checkUserTokenDebug.js <username>`.
- Service workers live in frontend/public/firebase-messaging-sw.js (desktop) and nlistplanet-mobile/frontend/public/firebase-messaging-sw.js (mobile).

## Environment
- Backend required: MONGODB_URI, JWT_SECRET (>=32 chars), CORS_ORIGINS, FRONTEND_URL, FIREBASE_SERVICE_ACCOUNT (raw JSON), OPENAI_API_KEY (for summaries).
- Frontend: REACT_APP_API_URL=http://localhost:5000/api (adjust per deployment). Mobile PWA also needs correct API base and push config.

## Common Pitfalls
- Fee drift: update helpers.js in both frontends whenever fee logic changes.
- Mixed casing: always use fallback pattern for company fields to avoid undefined UI.
- Ports busy: kill node with `Stop-Process -Name "node" -Force` before restarting.
- Missing envs or short JWT secret will crash startup; check .env before debugging runtime errors.

