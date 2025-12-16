# Manual Entries Management System

## Overview
User-created companies (manual listings) ab admin approval ke baad hi marketplace mein list hongi. Pehle direct marketplace mein aa jati thi, ab admin verify karega.

## User Flow

### 1. User Creates Listing with Manual Company
```
User → Create Listing → Company name enter → "Continue with manual entry"
```

**Backend Action:**
- Agar company database mein nahi mili
- Automatically new Company entry create hogi
- `verificationStatus: 'pending'`
- `addedBy: 'user'`
- `addedByUser: userId`

### 2. Admin Sees Manual Entry
```
Admin Dashboard → Companies Management → "Manual Entries (Pending)" Tab
```

**Display:**
- Orange badge: "User Added"
- All company details (name, sector, ISIN, PAN, CIN, etc.)
- Two action buttons: **Approve** | **Reject**

### 3. Admin Approves/Rejects

#### Approve:
```javascript
PUT /api/admin/companies/:id/verify
{
  "status": "verified",
  "notes": "Approved by admin"
}
```
**Result:**
- `verificationStatus` → 'verified'
- Notification sent to user: "✅ Company Verified - Your company is now live on marketplace!"
- Company appears in marketplace listings
- Listing becomes visible to buyers/sellers

#### Reject:
```javascript
PUT /api/admin/companies/:id/verify
{
  "status": "rejected",
  "notes": "Invalid company details"
}
```
**Result:**
- `verificationStatus` → 'rejected'
- Notification sent to user: "❌ Company Rejected - [reason]"
- Company does NOT appear in marketplace
- Listing remains hidden

## Technical Implementation

### Frontend Changes

#### CompaniesManagement.jsx
```jsx
// State
const [activeTab, setActiveTab] = useState('verified'); // 'verified' | 'manual-entries'

// Tabs
<button onClick={() => setActiveTab('verified')}>
  Verified Companies ({count})
</button>
<button onClick={() => setActiveTab('manual-entries')}>
  Manual Entries (Pending) ({pendingCount})
</button>

// Filter logic
const filteredByTab = useMemo(() => {
  if (activeTab === 'manual-entries') {
    return companies.filter(c => c.addedBy === 'user' && c.verificationStatus === 'pending');
  }
  return companies.filter(c => c.verificationStatus === 'verified' || c.addedBy === 'admin');
}, [companies, activeTab]);

// Actions
const handleApproveManualEntry = async (companyId) => {
  await axios.put(`${BASE_API_URL}/admin/companies/${companyId}/verify`, {
    status: 'verified',
    notes: 'Approved by admin'
  });
};

const handleRejectManualEntry = async (companyId) => {
  const reason = prompt('Rejection reason (optional):');
  await axios.put(`${BASE_API_URL}/admin/companies/${companyId}/verify`, {
    status: 'rejected',
    notes: reason
  });
};
```

### Backend Changes

#### adminCompanies.js - New Route
```javascript
// @route   PUT /api/admin/companies/:id/verify
// @desc    Verify/Reject user-added company
router.put('/companies/:id/verify', protect, authorize('admin'), async (req, res) => {
  const { status, notes } = req.body; // 'verified' or 'rejected'
  const company = await Company.findById(req.params.id);
  
  company.verificationStatus = status;
  company.verificationNotes = notes;
  company.verifiedBy = req.user._id;
  company.verifiedAt = new Date();
  await company.save();
  
  // Notify user
  if (company.addedByUser) {
    await Notification.create({
      userId: company.addedByUser,
      type: status === 'verified' ? 'success' : 'warning',
      title: status === 'verified' ? '✅ Company Verified' : '❌ Company Rejected',
      message: `Your company "${company.name}" ${status === 'verified' ? 'is now live!' : 'was rejected. ' + notes}`
    });
  }
});
```

#### listings.js - Marketplace Filter
```javascript
// GET /api/listings - Marketplace listings
let listings = await Listing.find(query).populate('companyId');

// Filter out unverified manual entries
listings = listings.filter(listing => {
  if (!listing.companyId) return true; // No companyId = allow
  // Only show verified or admin-added companies
  return listing.companyId.verificationStatus === 'verified' 
    || listing.companyId.addedBy === 'admin';
});
```

## Database Schema

### Company Model
```javascript
{
  name: String,
  sector: String,
  verificationStatus: {
    type: String,
    enum: ['verified', 'pending', 'rejected'],
    default: 'verified' // Admin-added = verified by default
  },
  addedBy: {
    type: String,
    enum: ['admin', 'system', 'user'],
    default: 'admin'
  },
  addedByUser: {
    type: ObjectId,
    ref: 'User',
    default: null
  },
  verificationNotes: String,
  verifiedBy: { type: ObjectId, ref: 'User' },
  verifiedAt: Date,
  // ... other fields
}
```

## UI Components

### Manual Entries Tab Table
| Checkbox | Logo | Company | Script | ISIN | PAN | CIN | Sector | Reg. Date | **Added By** | **Actions** |
|----------|------|---------|--------|------|-----|-----|--------|-----------|--------------|-------------|
| ☑ | ![logo] | PhonePe | PHONEPE | INE... | AAEC... | U729... | Fintech | 01/07/2012 | `User Added` | ✓ Approve \| ✗ Reject |

### Verified Companies Tab Table
| Checkbox | Logo | Company | Script | ISIN | PAN | CIN | Sector | Reg. Date | Actions |
|----------|------|---------|--------|------|-----|-----|--------|-----------|---------|
| ☑ | ![logo] | PhonePe | PHONEPE | INE... | AAEC... | U729... | Fintech | 01/07/2012 | ✏️ Edit \| 🗑️ Delete |

## Admin Workflow

1. **Check Manual Entries Tab:**
   - Click "Manual Entries (Pending)" tab
   - See orange badge count of pending approvals

2. **Review Company Details:**
   - Name, sector, ISIN, PAN, CIN
   - Check if company is legitimate
   - Verify registration details

3. **Take Action:**
   - ✓ **Approve** - Company goes live immediately
   - ✗ **Reject** - Enter reason, user gets notified

4. **User Notification:**
   - Automatic notification sent to user
   - Approved: "Your company is now live!"
   - Rejected: "Rejected. Reason: [admin reason]"

## Benefits

✅ **Quality Control** - Admin reviews all user-added companies  
✅ **Spam Prevention** - Fake companies can't enter marketplace  
✅ **User Feedback** - Users know status of their submissions  
✅ **Clean Database** - Only verified companies in marketplace  
✅ **Audit Trail** - verifiedBy, verifiedAt fields track approvals  

## Testing Checklist

- [ ] User creates listing with manual company name
- [ ] Company appears in "Manual Entries" tab with pending status
- [ ] Company does NOT appear in marketplace
- [ ] Admin clicks "Approve" → Status changes to verified
- [ ] User receives approval notification
- [ ] Company now appears in marketplace
- [ ] Listing becomes visible to other users
- [ ] Admin clicks "Reject" → Status changes to rejected
- [ ] User receives rejection notification with reason
- [ ] Company stays hidden from marketplace

## Files Modified

### Frontend
- `UnlistedHub-USM/frontend/src/components/admin/CompaniesManagement.jsx`
  - Added `activeTab` state ('verified' | 'manual-entries')
  - Added tabs UI with counts
  - Added `filteredByTab` memo for filtering
  - Added approve/reject handlers
  - Updated table headers and rows for manual entries

### Backend
- `UnlistedHub-USM/backend/routes/adminCompanies.js`
  - Added PUT `/companies/:id/verify` route
  - Handles verification status update
  - Sends notifications to users

- `UnlistedHub-USM/backend/routes/listings.js`
  - Updated marketplace GET `/` route
  - Filters out unverified companies
  - Only shows verified or admin-added companies

## API Endpoints

### Verify Company
```http
PUT /api/admin/companies/:id/verify
Authorization: Bearer {admin_token}

{
  "status": "verified" | "rejected",
  "notes": "Optional admin notes"
}

Response:
{
  "success": true,
  "message": "Company approved successfully",
  "company": { ... }
}
```

## Database Queries

### Get Pending Manual Entries
```javascript
Company.find({
  addedBy: 'user',
  verificationStatus: 'pending'
})
```

### Get Verified Companies
```javascript
Company.find({
  $or: [
    { verificationStatus: 'verified' },
    { addedBy: 'admin' }
  ]
})
```

### Marketplace Listings (Verified Only)
```javascript
// After populating companyId
listings.filter(listing => {
  if (!listing.companyId) return true;
  return listing.companyId.verificationStatus === 'verified' 
    || listing.companyId.addedBy === 'admin';
})
```

## Future Enhancements

- [ ] Bulk approve/reject multiple companies
- [ ] Auto-approve companies with valid ISIN/PAN verification
- [ ] Email notification to users (in addition to in-app)
- [ ] Company edit suggestions from users (requires re-approval)
- [ ] Admin activity log (who approved what)
- [ ] Rejected companies list with re-submission option

## Notes

- **Default Status:** Admin-added companies are auto-verified
- **User-Added:** Always start as pending
- **Listings Visibility:** Only verified company listings appear in marketplace
- **Notifications:** Automatic on approve/reject
- **Audit:** verifiedBy and verifiedAt track who approved when
