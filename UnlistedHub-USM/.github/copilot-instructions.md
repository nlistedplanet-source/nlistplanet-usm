# Copilot Instructions for UnlistedHub-USM

## Architecture Overview
P2P marketplace for unlisted shares with admin-mediated transactions. Desktop web app.

**Tech Stack:** React 18, Node.js/Express, MongoDB (Mongoose), JWT auth, Tailwind CSS

## Project Structure
```
backend/
├── server.js          # Express app with Helmet, CORS, rate limiting
├── models/            # Mongoose schemas (User, Listing, Company, Transaction...)
├── routes/            # API endpoints (/api/auth, /api/listings, /api/admin...)
├── middleware/        # auth.js (JWT), validation.js, securityLogger.js
└── utils/             # emailService.js, smsService.js

frontend/src/
├── context/           # AuthContext.jsx (login state, axios interceptor)
├── pages/             # Route components
├── components/        # Reusable UI (ListingCard, etc.)
└── utils/             # api.js (axios wrappers), helpers.js (price calculations)
```

## Developer Workflows
```bash
# Backend
cd backend && npm install
npm run dev          # nodemon hot-reload
npm start            # production
GET /api/health      # health check

# Frontend
cd frontend && npm install
npm start            # dev server (localhost:3000)
npm run build        # production build
```
**Environment:** Copy `.env.example` → `.env`, never commit secrets. Restart server after changes.

## Critical Business Logic: Platform Fee (2%)
The platform fee is the core pricing mechanism. Use helper functions from `utils/helpers.js`:

```javascript
// frontend/src/utils/helpers.js
calculateBuyerPays(price)  // → price * 1.02 (buyer pays +2%)
calculateSellerGets(price) // → price * 0.98 (seller gets -2%)
getPriceDisplay(price, listingType, isOwner) // → { displayPrice, label }
```

**Price Display Rules:**
| Listing Type | Owner Sees | Others See |
|--------------|------------|------------|
| SELL (₹100)  | ₹100 (Your Price) | ₹102 (Buyer Pays) |
| BUY (₹100)   | ₹100 (Your Price) | ₹98 (Seller Gets) |

Backend mirrors this in `models/Listing.js` with `buyerOfferedPrice`, `sellerReceivesPrice`, `platformFee` fields on bids.

## Auth Pattern
- **Backend:** JWT via `middleware/auth.js` - `protect` (required), `optionalAuth` (guest allowed), `authorize(...roles)`
- **Frontend:** `AuthContext.jsx` - `useAuth()` hook provides `{ user, login, logout, isAuthenticated }`
- **Header:** `Authorization: Bearer <token>` (axios default set in AuthContext)
- **30-min inactivity logout** in frontend

## API Structure
All endpoints prefixed with `/api`. See `frontend/src/utils/api.js` for axios wrappers:
```javascript
listingsAPI.getAll(), listingsAPI.create(), listingsAPI.placeBid()
companiesAPI.getAll(), companiesAPI.search()
adminAPI.getStats(), adminAPI.banUser()
```

## Key Patterns & Conventions
1. **Anonymous Trading:** System-generated usernames (`@trader_xyz`), real identity only visible to admin
2. **Validation:** Use `middleware/validation.js` - `validateListing`, `validateBid`, `validateObjectId`
3. **CORS:** Whitelist in `server.js` + `CORS_ORIGINS` env var; auto-allows `*.vercel.app` previews
4. **Security:** Helmet, rate limiting (300/15min global, 20/15min auth), Argon2 passwords, mongo-sanitize
5. **No automated tests:** Validate manually via Postman/browser after changes
6. **ES Modules:** Backend uses `"type": "module"` - use `import/export`, not `require`

## Data Flow: Bid Lifecycle
```
Buyer places Bid → status: 'pending'
  ↓
Seller: Accept/Reject/Counter → status: 'accepted'/'rejected'/'countered'
  ↓
Counter rounds (max 4) with counterHistory array
  ↓
Both accept → Transaction created → Admin manual closure
```

## Deployment
- **Backend:** Render.com auto-deploy on push to main (see `RENDER_AUTODEPLOY.md`)
- **Frontend:** Vercel auto-deploy with preview URLs
- **Required env vars:** `MONGODB_URI`, `JWT_SECRET` (32+ chars), `FRONTEND_URL`, `CORS_ORIGINS`

## Scripts & Automation
```bash
# Backend scripts (run from backend/)
node scripts/fetchNews.js      # Fetch news from RSS feeds (cron: every 6 hours)
node scripts/seedCompanies.js  # Seed company data
```

## Admin Routes
Admin-only endpoints require `authorize('admin')` middleware:
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - User management
- `PUT /api/admin/users/:id/ban` - Ban/unban users
- `POST /api/admin/companies` - Create companies
- `GET /api/admin/transactions` - All transactions

## Model Field Naming Quirk
Company model has mixed casing due to legacy data. Access both patterns:
```javascript
// In populate or queries, handle both:
company.CompanyName || company.name
company.Logo || company.logo
company.Sector || company.sector
```

## Reference Docs
- `PROJECT_DOCUMENTATION.md` - Database models, API specs, admin flows
- `SECURITY_FEATURES.md` - Security implementation details
- `PASSWORD_POLICY_GUIDE.md` - Password requirements
