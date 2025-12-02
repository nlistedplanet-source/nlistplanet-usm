# NListPlanet Mobile Backend

A dedicated backend service for the mobile PWA, forked from `UnlistedHub-USM/backend` and tailored for mobile domains and deployment.

## Highlights
- API base path: `/api`
- Auth: JWT (`Authorization: Bearer <token>`)
- CORS: Whitelist mobile prod + Vercel previews
- Security: Helmet, rate limiting, sanitization, HSTS

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Ensure `FRONTEND_URL` points to `https://mobile.nlistplanet.com`.
3. Add preview domains to `CORS_ORIGINS` as comma-separated list.

## Scripts
- `npm run dev` — start with hot-reload (nodemon)
- `npm start` — production start

## Deployment
- Render.com recommended.
- Environment variables: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `CORS_ORIGINS`.
- Health: `GET /api/health`

## CORS Notes
The server allows:
- Exact `FRONTEND_URL`
- Any `*.vercel.app` preview by default
- Additional origins via `CORS_ORIGINS`

## Authentication
- `POST /api/auth/login` — `{ username, password }`
- `GET /api/auth/me` — returns `{ success, user }`

## Change Log
- Initial fork for mobile backend (2025-12-02)
- Updated `.env.example` for mobile domains
