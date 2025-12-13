# Fix: Internal Server Error on Company Creation

## Issue
User reported a 500 Internal Server Error when trying to add a company (specifically after deleting and re-adding).
The error was caused by a syntax error introduced in the previous update to `backend/routes/admin.js`.

## Root Cause
An extra closing brace and parenthesis `});` was accidentally left in the code during the implementation of the "Extended Company Data" feature.
This caused the server to fail when processing the `POST /companies` route.

## Fix Implemented
- Removed the duplicate `});` from `backend/routes/admin.js`.
- Verified the code structure for the `POST /companies` route is now correct.

## Verification
1. The server should now restart successfully (if it crashed) or reload the module.
2. Try adding the company again.
3. The 500 error should be resolved.
4. If the company name/ISIN still conflicts, you will now see the correct 400 error message ("Company with this ... already exists") instead of a 500 crash.
