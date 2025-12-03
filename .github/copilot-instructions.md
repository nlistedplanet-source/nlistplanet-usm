
# Copilot Instructions for NListPlanet/UnlistedHub Codebase

## Big Picture & Architecture
This workspace contains multiple generations of the NListPlanet/UnlistedHub marketplace for unlisted shares. Key subprojects:
- **UnlistedHub-Backend-OLD**: Legacy Node.js/Express REST API (see `UnlistedHub-Backend-OLD/README.md`).
- **UnlistedHub-React-Project-OLD**: Legacy React SPA, in-memory state, no backend integration.
- **UnlistedHub-USM**: Current backend/frontend split (see `UnlistedHub-USM/PROJECT_DOCUMENTATION.md`).
- **nlistplanet-mobile**: Mobile-first PWA and dedicated backend, forked from USM, tailored for mobile deployment.

## Project Structure
- Backend: `backend/` (models, routes, middleware, utils, server.js)
- Frontend: `frontend/src/` (pages, components, context, utils)
- Mobile: `nlistplanet-mobile/` (standalone backend/frontend)
- Docs: `NlistPlanet_System_Architecture_FULL.md`, `PROJECT_DOCUMENTATION.md`, `README.md`

## Developer Workflows
### Backend
- Install: `npm install` (in backend dir)
- Dev: `npm run dev` (nodemon)
- Prod: `npm start`
- Health check: `GET /api/health`
- Environment: Copy `.env.example` to `.env`, fill values (never commit secrets)
- Manual API validation: Use Postman/Thunder Client
- Auto-deploy: Render.com (see `RENDER_AUTODEPLOY.md`, `.github-webhook-setup.md`)

### Frontend
- Install: `npm install` (in frontend dir)
- Dev: `npm start`
- Build: `npm run build`
- Environment: Set `REACT_APP_API_URL`, `CI`, `GENERATE_SOURCEMAP` in Vercel/Netlify (see `VERCEL_QUICK_FIX.md`)
- Validate in browser; no formal tests

### Mobile
- Backend: Same as above, but CORS must whitelist mobile prod + Vercel previews
- Frontend: PWA, React, deploy via Vercel
- Domains: Desktop (`nlistplanet.com`), Mobile (`mobile.nlistplanet.com`), Backend (`nlistplanet-usm-v8dc.onrender.com`)

## Key Conventions & Patterns
- **Auth**: JWT (`Authorization: Bearer <token>`), context-based state in frontend
- **KYC**: See `routes/kyc.js` for user onboarding, document upload, status logic
- **Portfolio/Orders**: See architecture docs for buy/sell/portfolio flows
- **Anonymous Trading**: System-generated usernames, never reveal real identity (see `PROJECT_DOCUMENTATION.md`)
- **CORS**: Only allow whitelisted origins; add preview domains to `CORS_ORIGINS`
- **Security**: Helmet, rate limiting, sanitization, HSTS, password policy (`PASSWORD_POLICY_GUIDE.md`)
- **Environment**: Always use `.env` for secrets; restart server after changes
- **Manual validation**: No automated tests; always validate endpoints/UI after edits
- **Sensitive info**: Never commit credentials or `.env` files

## Integration & Deployment
- Backend auto-deploy: Render.com (main branch, see `RENDER_AUTODEPLOY.md`)
- Frontend auto-deploy: Vercel (main branch, preview deploys)
- Webhook setup: See `.github-webhook-setup.md` in backend/mobile
- Environment variables: Documented in deployment guides and `.env.example`

## Where to Start
- For backend: See `backend/README.md` and architecture docs
- For frontend: See `frontend/README.md` and context files
- For mobile: See `nlistplanet-mobile/README.md` and deployment docs
- For architecture: See `NlistPlanet_System_Architecture_FULL.md` and `PROJECT_DOCUMENTATION.md`

---
If any section is unclear or missing, specify which area (e.g., API flows, data models, integration) and request an update for more detail.
