# Share Card Highlights Fix

## Issue
Mobile marketplace share cards were showing old hardcoded highlights instead of AI-generated company highlights, while desktop My Posts share cards showed correct highlights.

## Root Cause
Backend listing routes were inconsistently populating the `companyId.highlights` field:
- ✅ `/api/listings/my` route - **included** highlights
- ❌ `/api/listings` route (marketplace) - **missing** highlights  
- ❌ `/api/listings/my-placed-bids` route - **missing** highlights
- ❌ `/api/share/create` route - population without explicit fields

## Solution
Added `highlights` field to all companyId populate queries:

### 1. Marketplace Route (`/api/listings`)
**File:** `UnlistedHub-USM/backend/routes/listings.js:62`
```javascript
.populate('companyId', 'CompanyName ScripName scriptName Logo Sector name logo sector PAN ISIN CIN pan isin cin highlights');
```

### 2. My Placed Bids Route (`/api/listings/my-placed-bids`)
**File:** `UnlistedHub-USM/backend/routes/listings.js:129`
```javascript
.populate('companyId', 'CompanyName ScripName scriptName Logo Sector name logo sector PAN ISIN CIN pan isin cin highlights');
```

### 3. Share Create Route (`/api/share/create`)
**File:** `UnlistedHub-USM/backend/routes/share.js:29`
```javascript
.populate('companyId', 'name scriptName logo sector highlights');
```

## Impact
- Mobile marketplace share cards now show AI-generated highlights
- Desktop My Posts share cards continue to work correctly
- Consistent share card experience across platforms
- All share routes now have access to company highlights

## Testing
1. Open mobile marketplace
2. Click share button on any listing card
3. Verify share card shows company-specific AI highlights
4. Compare with desktop My Posts share - should be identical

## Files Modified
- `UnlistedHub-USM/backend/routes/listings.js` - Added highlights to 2 routes
- `UnlistedHub-USM/backend/routes/share.js` - Added highlights with explicit fields

## Commit
```
fix: add highlights field to all listing populate queries for share cards

- Added 'highlights' to marketplace route (/api/listings) populate
- Added 'highlights' to my-placed-bids route populate
- Added 'highlights' with explicit fields to share create route
- Ensures mobile marketplace share cards show AI-generated highlights
- Fixes inconsistency between desktop My Posts and mobile Marketplace share cards
```

## Related Components
- **Desktop:** `UnlistedHub-USM/frontend/src/components/ShareCardGenerator.jsx`
- **Mobile:** `nlistplanet-mobile/frontend/src/components/ShareCardGenerator.jsx`
- **Backend:** `UnlistedHub-USM/backend/routes/listings.js`
- **Backend:** `UnlistedHub-USM/backend/routes/share.js`

## Notes
- ShareCardGenerator components are identical in desktop and mobile
- Both check `listing.companyId?.highlights` array
- Fallback to hardcoded highlights only if companyId.highlights is missing
- With this fix, fallback should rarely be used
