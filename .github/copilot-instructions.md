# Copilot Instructions for UnlistedHub Codebase

## Overview & Architecture
This workspace contains multiple generations of the UnlistedHub project—a P2P marketplace for unlisted shares—with both legacy and current backend/frontend implementations. Key subprojects:
- **UnlistedHub-Backend-OLD**: Node.js/Express REST API, MongoDB, OTP flows, admin/user roles, manual API testing.
- **UnlistedHub-React-Project-OLD**: React SPA, Context API for state, in-memory auth, localStorage for listings, no backend integration.
- **UnlistedHub-USM**: Newer backend/frontend (see `UnlistedHub-USM/README.md` for details).

## Backend (UnlistedHub-Backend-OLD)
- **Domains**: Auth (JWT, OTP), Listings, Bids, Trades, Admin, Portfolio.
- **Key files**: `server.js`, `models/`, `routes/`, `middleware/`, `utils/otpService.js`, `scripts/resetDatabase.js`.
- **Workflows**:
  - Install: `npm install`
  - Dev: `npm run dev` (nodemon)
  - Prod: `npm start`
  - Reset DB: `node scripts/resetDatabase.js`
  - No formal tests—use Postman/Thunder Client for API validation.
- **Patterns**:
  - Role-based access in `middleware/`
  - OTP/email flows in `routes/auth.js`, `utils/otpService.js`
  - Admin user created/reset via DB script
  - Manual API testing only; validate endpoints after changes

## Frontend (UnlistedHub-React-Project-OLD)
- **SPA, no backend**: All data in memory or localStorage.
- **Key files**: `src/App.jsx`, `src/context/`, `src/components/`, `src/data/companies.json`
- **Patterns**:
  - Navigation via `setPage()` (no router)
  - Contexts: `AuthContext`, `ListingContext`, `BidContext`, `CompanyContext`
  - Listings/bids: `ListingContext` is source of truth; `Marketplace.jsx` may use static data—prefer context for new features
  - Styling: Tailwind-like classes, but Tailwind not installed—use plain CSS or add Tailwind if needed
- **Workflows**:
  - Install: `npm install`
  - Dev: `npm start`
  - Build: `npm run build`
  - No tests; validate in browser

## Newer Project (UnlistedHub-USM)
- See `UnlistedHub-USM/README.md` and `FILE_STRUCTURE.md` for updated architecture, deployment, and file layout.
- Backend/frontend split under `UnlistedHub-USM/backend` and `UnlistedHub-USM/frontend`.
- Use provided scripts and docs for setup and deployment.

## Cross-cutting Conventions
- **Environment**: Use `.env` for secrets (never commit). Restart server after changes.
- **Manual validation**: No automated tests—always validate endpoints/UI after edits.
- **Sensitive info**: Never commit credentials or `.env` files.
- **PR checklist**:
  - Data flows consistent (models/routes/contexts)
  - Env vars documented/updated
  - Manual tests run for new/changed flows
  - No sensitive info committed

## Where to Start
- For backend: See `UnlistedHub-Backend-OLD/README.md` and `scripts/README.md`.
- For frontend: See `UnlistedHub-React-Project-OLD/README.md` and context files.
- For new work: Prefer `UnlistedHub-USM` structure and docs.

---
If any section is unclear or missing, specify which area (e.g., API flows, data models, integration) and request an update for more detail.
