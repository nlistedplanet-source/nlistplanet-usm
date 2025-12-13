# Dashboard Data Fetch Fix

## Problem
Users reported that "Action Center" and "Recent Activity" data was not loading on the first visit to the dashboard (showing 0 or empty), but would appear after a page refresh.

## Root Cause
**Race Condition:** The dashboard component (`DashboardPage.jsx` on Desktop, `HomePage.jsx` on Mobile) was attempting to fetch data *before* the authentication token was fully initialized and available in the Axios interceptor.
- `useEffect` triggered on mount.
- `AuthContext` was still loading or setting the token.
- API calls fired with missing or invalid headers, resulting in `401 Unauthorized` errors (visible in console).

## Solution
Refactored the data fetching logic in both `UnlistedHub-USM` (Desktop) and `nlistplanet-mobile` (Mobile) to:

1.  **Wait for Auth:** Explicitly check `authLoading` state from `AuthContext` and ensure `user` object exists before initiating fetch.
2.  **Sequential Fetching:** Replaced parallel `Promise.all` (which fails if *any* request fails) with sequential `await` calls wrapped in individual `try-catch` blocks. This ensures that if one section (e.g., Activities) fails, others (e.g., Stats) still load.
3.  **Token Verification:** Added a safety check to ensure `localStorage.getItem('token')` is present before making requests.
4.  **Unified Logic:** Combined scattered `useEffect` hooks into a single, managed data fetching routine.

## Files Modified
- `UnlistedHub-USM/frontend/src/pages/DashboardPage.jsx`
- `nlistplanet-mobile/frontend/src/pages/dashboard/HomePage.jsx`

## Verification
1.  Clear browser cache/cookies or use Incognito mode.
2.  Login to the application.
3.  Dashboard should immediately load all data (Stats, Action Center, Activities) without requiring a refresh.
