# Feature: Edit Extended Company Data

## Overview
Added the ability to edit extended company fields (`website`, `foundedYear`, `highlights`) in the Admin Dashboard. This allows admins to manage the full company profile used in the "Share" cards and other UI elements.

## Changes Implemented

### 1. Backend (`backend/routes/admin.js`)
- Updated `POST /companies` and `PUT /companies/:id` to accept:
  - `website` (String)
  - `foundedYear` (Number)
  - `highlights` (Array of Strings)
- Added logic to parse `highlights` from either an array or a newline/comma-separated string.

### 2. Frontend (`frontend/src/components/admin/CompaniesManagement.jsx`)
- Updated `formData` state to include the new fields.
- Updated `handleEdit` to populate these fields from the existing company data.
- Updated `handleSubmit` to send these fields to the backend (handling both JSON and FormData modes).
- Added UI input fields to the modal:
  - **Website**: URL input.
  - **Founded Year**: Number input.
  - **Highlights**: Textarea (one per line) for easy editing of bullet points.

## Verification
1. Go to Admin Dashboard > Companies Management.
2. Click "Edit" on a company.
3. You should see new fields for Website, Founded Year, and Highlights.
4. Add some highlights (e.g., "Market Leader", "High Growth").
5. Save and verify the data persists.
