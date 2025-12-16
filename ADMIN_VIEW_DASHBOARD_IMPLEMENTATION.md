# Admin View Dashboard Feature Implementation

## Overview
Admin can now view any user's dashboard by clicking "View" button in User Management. The dashboard will show that user's data with a clear admin banner at the top.

## Changes Made

### 1. Frontend - DashboardPage.jsx

#### Added State Management for Admin Viewing
```javascript
const viewAsUserId = searchParams.get('viewAs');
const [viewingUser, setViewingUser] = useState(null);
const isViewingAsAdmin = user?.role === 'admin' && viewAsUserId;
const effectiveUserId = isViewingAsAdmin ? viewAsUserId : user?._id;
```

#### Added useEffect to Fetch Viewing User Details
Fetches the viewing user's details when admin opens dashboard with `?viewAs={userId}` parameter.

#### Updated fetchDashboardData API Calls
All API calls now use `effectiveUserId` when admin is viewing:
```javascript
const apiParams = isViewingAsAdmin ? { userId: effectiveUserId } : {};
const sellRes = await listingsAPI.getMy({ type: 'sell', ...apiParams });
const buyRes = await listingsAPI.getMy({ type: 'buy', ...apiParams });
const myBidsRes = await listingsAPI.getMyPlacedBids(apiParams.userId);
```

#### Added Admin Viewing Banner
Orange/red gradient banner at top showing:
- 👁️ Admin View: Viewing dashboard of @username
- Exit View button to clear viewAs parameter

#### Updated Sidebar Profile Section
Shows viewing user's avatar and details when admin is viewing another user.

#### Adjusted Layout for Banner
- Sidebar: `top-[52px]` when banner visible
- Main content: `mt-[52px]` when banner visible

### 2. Backend - routes/listings.js

#### Updated `/api/listings/my` Route
Now accepts optional `userId` query parameter. Admin can view any user's listings:
```javascript
const { type, status, userId: requestedUserId } = req.query;
const targetUserId = (req.user.role === 'admin' && requestedUserId) ? requestedUserId : req.user._id;
const query = { userId: targetUserId };
```

#### Updated `/api/listings/my-placed-bids` Route
Now accepts optional `userId` query parameter. Admin can view any user's bids/offers:
```javascript
const { userId: requestedUserId } = req.query;
const targetUserId = (req.user.role === 'admin' && requestedUserId) ? requestedUserId : req.user._id;
const listings = await Listing.find({
  $or: [
    { 'bids.userId': targetUserId },
    { 'offers.userId': targetUserId }
  ]
});
```

#### Security
- Only admin role can use userId parameter
- Regular users always see their own data
- Authorization checked via req.user.role === 'admin'

### 3. Frontend - utils/api.js

#### Updated getMyPlacedBids Method
```javascript
getMyPlacedBids: (userId = null) => axios.get('/listings/my-placed-bids', userId ? { params: { userId } } : {})
```

### 4. Admin User Management (UserManagement.jsx)

#### View Button Already Added
Eye icon button that opens dashboard in new tab:
```javascript
<button onClick={() => window.open(`/dashboard?viewAs=${user._id}`, '_blank')}>
  <Eye className="w-4 h-4" />
</button>
```

## How It Works

1. Admin clicks "View" button in User Management for a specific user
2. New tab opens with URL: `/dashboard?viewAs={userId}`
3. DashboardPage reads `viewAs` parameter and sets `viewAsUserId`
4. Frontend fetches viewing user details via `adminAPI.getUserById(viewAsUserId)`
5. `isViewingAsAdmin` flag becomes true, `effectiveUserId` points to viewed user
6. Admin viewing banner appears at top with Exit View button
7. Sidebar profile shows viewing user's details
8. All API calls pass `userId` parameter in query
9. Backend validates admin role and returns viewed user's data
10. Dashboard displays that user's listings, bids, portfolio, etc.
11. Click "Exit View" to return to admin's own dashboard

## Testing

1. Login as admin
2. Go to Admin → User Management
3. Find any user and click "View" button (eye icon)
4. New tab opens showing that user's dashboard
5. Orange banner at top shows "Admin View: Viewing dashboard of @username"
6. All tabs (Overview, My Listings, My Bids, etc.) show that user's data
7. Sidebar profile shows that user's avatar and username
8. Click "Exit View" to return to admin dashboard

## Security Notes

- Only admin role can use viewAs functionality
- Backend validates `req.user.role === 'admin'` before using userId parameter
- Regular users cannot view other users' data
- Admin viewing is clearly indicated with prominent banner
- No confusion about whose data is being viewed
