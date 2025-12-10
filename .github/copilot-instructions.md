# Copilot Instructions for NListPlanet/UnlistedHub

## Architecture Overview
P2P marketplace for unlisted shares with admin-mediated transactions. Two active projects share similar structure:

| Project | Purpose | Backend | Frontend |
|---------|---------|---------|----------|
| `UnlistedHub-USM/` | Desktop web app | `backend/` | `frontend/src/` |
| `nlistplanet-mobile/` | Mobile PWA (forked from USM) | `backend/` | `frontend/src/` |

**Tech Stack:** React 18/19, Node.js/Express, MongoDB (Mongoose), JWT auth, Tailwind CSS

## Project Structure Pattern
```
{project}/backend/
├── server.js          # Express app with Helmet, CORS, rate limiting
├── models/            # Mongoose schemas (User, Listing, Company, Transaction...)
├── routes/            # API endpoints (/api/auth, /api/listings, /api/admin...)
├── middleware/        # auth.js (JWT), validation.js, securityLogger.js
# Copilot Instructions — NListPlanet / UnlistedHub

Purpose: Help AI coding agents become productive quickly in this monorepo (desktop + mobile forks).

Quick summary
- Monorepo with two active projects: `UnlistedHub-USM/` (desktop) and `nlistplanet-mobile/` (mobile PWA).
- Each project follows the same pattern: `backend/` (Express + Mongoose) and `frontend/` (React + Tailwind).

Core files to inspect first
- Backend entry: `backend/server.js` (also `server-fast.js`) — CORS, Helmet, rate limiting, route registration.
- Auth middleware: `backend/middleware/auth.js` (protect/optionalAuth/authorize).
- Validation: `backend/middleware/validation.js` (validateListing, validateBid, validateObjectId).
- Listing model: `backend/models/Listing.js` (fields: `buyerOfferedPrice`, `sellerReceivesPrice`, `platformFee`, counterHistory).
- Frontend helpers: `frontend/src/utils/helpers.js` (calculateBuyerPays, calculateSellerGets — platform fee logic).
- Frontend API wrapper: `frontend/src/utils/api.js` (listingsAPI, companiesAPI, adminAPI).

Immediate dev/runtime commands
- Backend (project folder):
  - `cd <project>/backend; npm install` then `npm run dev` (nodemon) or `npm start`.
- Frontend (project folder):
  - `cd <project>/frontend; npm install` then `npm start` (localhost:3000) or `npm run build`.
- Env: copy `.env.example` → `.env`. Required vars: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `CORS_ORIGINS`.

Project-specific conventions (do not break these)
- Platform fee: Always apply 2% adjustment in helpers — fee is NEVER shown to users. Follow `calculateBuyerPays` / `calculateSellerGets` (frontend) and mirror logic in backend models/handlers.
- Auth: Backend uses JWT; follow `authorize('admin')` for admin-only routes. Frontend sets `Authorization: Bearer <token>` in AuthContext.
- ES modules: Backends set `"type": "module"` — use `import/export` not `require`.
- Company model naming: legacy mixed-casing exists — code must handle `company.CompanyName || company.name` (see `models/Company.js`).
- Anonymous trading: System-generated usernames (e.g., `@trader_xyz`). Real identity only visible to admin.

Where to implement common changes
- Add API routes: create files under `backend/routes/` and register in `server.js`.
- Add server utilities: `backend/utils/` (emailService, smsService, etc.).
- Update pricing/platform fee: change `frontend/src/utils/helpers.js` and ensure backend `models/Listing.js` and any bid-handling code mirror the change.

Testing & scripts
- There are no automated test suites by default. Use Postman or the frontend to validate changes.
- Useful backend scripts: `node scripts/seedCompanies.js` (seed data), `node scripts/fetchNews.js` (cron-style importer).

Deployment/CI hints
- Backend auto-deploy: Render (look for `render.yaml`, `RENDER_AUTODEPLOY.md`).
- Frontend: Vercel (see `vercel.json`).

Security & production notes
- Rate limiting and Helmet are enabled in `server.js` — keep these when adding endpoints.
- Passwords use Argon2 in the codebase; do not replace with weaker hashing.
- Never commit secrets — `.env` must remain local.

Search tips for agents (quick grep targets)
- `calculateBuyerPays|calculateSellerGets` → platform fee helpers
- `sellerReceivesPrice|buyerOfferedPrice|platformFee` → DB fields and bid math
- `authorize('admin')` → admin-only flows
- `validateListing|validateBid` → request validation rules

PR guidance for agents
- Keep changes scoped to a single logical area (backend or frontend). Update both sides when touching pricing/auth.
- Preserve existing endpoint contracts (route names and JSON shapes) unless updating clients together.

If anything here is unclear or you want me to expand an example (e.g., patching a specific route or updating fee logic), tell me which file to edit next.
