# Copilot Instructions — UnlistedHub Desktop

> **See [root copilot-instructions](../../.github/copilot-instructions.md) for full architecture, fee model, and security details.**

## Desktop App Specifics

**Tech Stack:** React 18 + Tailwind CSS

```bash
cd UnlistedHub-USM/backend && npm run dev    # Backend :5001
cd UnlistedHub-USM/frontend && npm start     # Frontend :3000
```

## Backend Scripts (run from `backend/`)

```bash
npm run dev                        # Nodemon hot-reload
npm run seed                       # Seed companies
node scripts/createAdmin.js        # Create admin user
node scripts/fetchNews.js          # Manual news fetch
node scripts/migrateUsernameHistory.js  # Username migration
```

## API Wrappers (`src/utils/api.js`)

```javascript
// All return axios promises with auto token injection
listingsAPI.getAll(params)    // GET /api/listings
listingsAPI.create(data)      // POST /api/listings
listingsAPI.placeBid(id, bid) // POST /api/listings/:id/bids

companiesAPI.getAll()         // GET /api/companies
companiesAPI.search(query)    // GET /api/companies/search

adminAPI.getStats()           // GET /api/admin/stats
adminAPI.getUsers()           // GET /api/admin/users
adminAPI.banUser(id)          // PUT /api/admin/users/:id/ban
```

## Admin Panel Routes

```
/admin/dashboard    — Stats overview
/admin/users        — User management
/admin/listings     — Listing moderation
/admin/transactions — Deal closure
/admin/companies    — Company CRUD
/admin/news         — News management + AI
```

## Components to Keep Synced with Mobile

**Always update BOTH when modifying:**
- `ShareCardGenerator.jsx` — html2canvas investment cards
- `helpers.js` — Price calculation functions (fee logic must match)

## Desktop-Only Features

- Full admin panel UI
- MobileApp.jsx wrapper for responsive testing
- Advanced data tables with sorting/filtering

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
