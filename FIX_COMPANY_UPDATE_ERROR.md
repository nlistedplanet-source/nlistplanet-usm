# Fix: Company Update Error "Company with this name already exists"

## Issue
When updating a company (e.g., changing the logo) in the Admin Dashboard, the user receives an error "Company with this name already exists".
This error occurs even if the name is not being changed, or if the user is unaware of a conflict in another field (like ISIN).

## Root Cause
The backend (`backend/routes/admin.js`) was catching all MongoDB duplicate key errors (code 11000) and hardcoding the error message to "Company with this name already exists".
However, the `Company` model has unique constraints on `name`, `isin`, and potentially other fields.
If the user submits a form with a duplicate ISIN (e.g., a placeholder like "INE123A01012" that is already used by another company), the update fails with code 11000, but the error message misleadingly points to the Name.

## Fix Implemented
Updated `backend/routes/admin.js` (both `PUT` and `POST` routes) to dynamically parse the duplicate key error.
The error message now correctly identifies the conflicting field:
- "Company with this name already exists"
- "Company with this ISIN already exists"
- "Company with this CIN already exists"
- "Company with this [field] already exists"

## Verification
1. Try to update a company with a unique name but a duplicate ISIN.
2. The error message should now say "Company with this ISIN already exists".
3. This clarifies that the user needs to fix the ISIN (or clear it) to proceed with the update.
