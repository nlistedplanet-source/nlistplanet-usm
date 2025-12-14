# Two-Step Accept Flow - Complete Implementation

## 🎯 Overview
Uniform two-step acceptance flow for BOTH scenarios (SELL and BUY listings). First party accepts → status: 'accepted', Second party accepts → status: 'confirmed'.

---

## 🔄 New Accept Flow (Both Scenarios)

### Scenario 1: SELL Listing (Seller has shares to sell)

```
Step 1: Buyer places bid on SELL listing
   → Status: 'pending'
   → Listing visible in marketplace

Step 2: EITHER party accepts first (Buyer OR Seller)
   → Status: 'accepted' ⏳
   → Listing HIDDEN from marketplace (status: 'negotiating')
   → First acceptor gets: "✅ Accepted! Waiting for other party to confirm."
   → Other party gets: "🔔 Deal Accepted! @username accepted. Accept to confirm!"
   → Card shows "Deal Accepted!" with high priority

Step 3: Second party accepts
   → Status: 'confirmed' ✅
   → Verification codes generated
   → Listing marked as 'sold'
   → Other pending bids rejected
   → Both get: "🎉 Deal Confirmed! Check your verification codes."
   → Codes modal shown
```

### Scenario 2: BUY Listing (Buyer wants to buy shares)

```
Step 1: Seller places offer on BUY listing
   → Status: 'pending'
   → Listing visible in marketplace

Step 2: EITHER party accepts first (Buyer OR Seller)
   → Status: 'accepted' ⏳
   → Listing HIDDEN from marketplace (status: 'negotiating')
   → First acceptor gets: "✅ Accepted! Waiting for other party to confirm."
   → Other party gets: "🔔 Deal Accepted! @username accepted. Accept to confirm!"
   → Card shows "Deal Accepted!" with high priority

Step 3: Second party accepts
   → Status: 'confirmed' ✅
   → Verification codes generated
   → Listing marked as 'sold'
   → Other pending offers rejected
   → Both get: "🎉 Deal Confirmed! Check your verification codes."
   → Codes modal shown
```

---

## 📊 Status Flow Diagram

```
BOTH SCENARIOS (SELL & BUY):

┌──────────────────┐
│ Status: 'pending'│
│ Visible in market│
└─────────┬────────┘
          │ ANY party clicks Accept
          ↓
┌────────────────────────┐
│ Status: 'accepted'     │ ← FIRST ACCEPTANCE
│ Hidden from marketplace│
│ Waiting for 2nd party  │
└─────────┬──────────────┘
          │ Other party clicks Accept
          ↓
┌───────────────────────┐
│ Status: 'confirmed'   │ ← MUTUAL CONFIRMATION
│ Codes generated       │
│ Listing marked 'sold' │
└───────────────────────┘
```

---

## 🔧 Backend Changes

### File: `UnlistedHub-USM/backend/routes/listings.js`

#### 1. New Authorization & Status Logic

```javascript
// Check if already confirmed
if (bid.status === 'confirmed') {
  return res.status(400).json({
    success: false,
    message: 'This bid has already been confirmed'
  });
}

// Check if someone already accepted
if (bid.status === 'accepted') {
  // Determine who accepted first
  const buyerAcceptedFirst = bid.buyerAcceptedAt;
  const sellerAcceptedFirst = bid.sellerAcceptedAt;
  
  // Prevent same person accepting twice
  if ((buyerAcceptedFirst && isBidder) || (sellerAcceptedFirst && isOwner)) {
    return res.status(400).json({
      success: false,
      message: 'You have already accepted this. Waiting for other party.'
    });
  }
  
  // Second party accepting → Status becomes 'confirmed'
  bid.status = 'confirmed';
  if (isBidder) {
    bid.buyerAcceptedAt = new Date();
  } else {
    bid.sellerAcceptedAt = new Date();
  }
} else {
  // First acceptance → Status becomes 'accepted'
  bid.status = 'accepted';
  
  // Track who accepted first
  const isSellListing = listing.type === 'sell';
  const isBuyer = isSellListing ? isBidder : isOwner;
  
  if (isBuyer) {
    bid.buyerAcceptedAt = new Date();
  } else {
    bid.sellerAcceptedAt = new Date();
  }
}
```

#### 2. Listing Status Update

```javascript
if (newStatus === 'confirmed') {
  // Deal confirmed → Mark as sold
  listing.status = 'sold';
  
  // Reject all other pending bids
  bidArray.forEach(b => {
    if (b._id.toString() !== bid._id.toString() && b.status === 'pending') {
      b.status = 'rejected';
    }
  });
} else if (newStatus === 'accepted') {
  // First acceptance → Hide from marketplace
  listing.status = 'negotiating';
}
```

#### 3. New Notifications

```javascript
if (newStatus === 'confirmed') {
  // Both parties confirmed
  await Notification.create({
    userId: buyerId,
    type: 'deal_confirmed',
    title: '🎉 Deal Confirmed!',
    message: `Your deal for ${companyName} is confirmed! Check your verification codes.`
  });
  
  await Notification.create({
    userId: sellerId,
    type: 'deal_confirmed',
    title: '🎉 Deal Confirmed!',
    message: `Your deal for ${companyName} is confirmed! Check your verification codes.`
  });
} else if (newStatus === 'accepted') {
  // First party accepted
  await Notification.create({
    userId: acceptorId,
    type: 'acceptance_sent',
    title: '✅ Acceptance Sent!',
    message: `Waiting for @${waitingForUsername} to accept the deal for ${companyName}`
  });
  
  await Notification.create({
    userId: waitingForId,
    type: 'party_accepted',
    title: '🔔 Deal Accepted!',
    message: `@${acceptorUsername} accepted the deal for ${companyName}. Accept to confirm!`
  });
}
```

#### 4. Response Structure

```javascript
res.json({
  success: true,
  message: newStatus === 'confirmed' 
    ? 'Deal confirmed! Verification codes generated.' 
    : 'Acceptance sent! Waiting for other party to confirm.',
  status: newStatus,  // NEW: Returns 'accepted' or 'confirmed'
  deal: newStatus === 'confirmed' ? {
    id: deal._id,
    status: deal.status,
    buyerCode: deal.buyerVerificationCode,
    sellerCode: deal.sellerVerificationCode,
    rmCode: deal.rmVerificationCode
  } : {
    id: deal._id,
    status: deal.status  // Returns deal without codes
  }
});
```

---

## 🎨 Frontend Changes

### Mobile App: `nlistplanet-mobile/frontend/src/pages/dashboard/HomePage.jsx`

#### 1. Updated Action Items Detection

```javascript
// Only check for 'accepted' status (not pending_*)
} else if (bid.status === 'accepted') {
  actions.push({
    type: 'deal_accepted',
    status: 'accepted',
    priority: 'high',
    buyerAcceptedAt: bid.buyerAcceptedAt,
    sellerAcceptedAt: bid.sellerAcceptedAt
  });
}
```

#### 2. Updated handleAcceptAction

```javascript
const handleAcceptAction = async (item) => {
  const response = await listingsAPI.acceptBid(item.listingId, item.id);
  const status = response.data.status;
  
  if (status === 'confirmed') {
    // Both parties accepted → Show codes
    toast.success('Deal confirmed! 🎉');
    setVerificationDeal(response.data.deal);
    setShowVerificationModal(true);
  } else if (status === 'accepted') {
    // First acceptance → Waiting
    toast.success('Accepted! Waiting for other party to confirm. ⏳');
    await fetchData();
  }
};
```

---

## 📱 UI Changes

### Action Center Cards

**Status: 'accepted' (High Priority)**:
- Emerald gradient card
- Header: "🎉 Deal Accepted!"
- Message: "One party accepted - Accept to confirm!"
- Button: "Confirm Deal" (calls handleAcceptAction)

**Status: 'confirmed'**:
- Removed from action center (deal complete)
- Verification codes modal shown

### Notification Banner

```javascript
{actionItems.some(item => item.priority === 'high') && (
  <div className="bg-gradient-to-r from-emerald-500 to-green-600">
    <Sparkles /> 
    <h3>🎉 Deal Accepted!</h3>
    <p>You have {count} deals waiting for confirmation</p>
  </div>
)}
```

---

## 🔐 Marketplace Visibility

### Listing Status Changes

| Deal Status | Listing Status | Marketplace Visible |
|------------|---------------|-------------------|
| `pending` | `active` | ✅ Yes |
| `accepted` | `negotiating` | ❌ No (Hidden) |
| `confirmed` | `sold` | ❌ No (Sold) |
| `rejected` | `active` | ✅ Yes (Back) |

---

## 📊 Database Fields

### Bid/Offer Schema

```javascript
{
  status: 'pending' | 'accepted' | 'confirmed' | 'rejected',
  buyerAcceptedAt: Date,   // Timestamp when buyer accepted
  sellerAcceptedAt: Date,  // Timestamp when seller accepted
  dealId: ObjectId
}
```

### CompletedDeal Schema

```javascript
{
  status: 'accepted' | 'confirmed',
  buyerAcceptedAt: Date,
  sellerAcceptedAt: Date,
  buyerConfirmed: Boolean,
  sellerConfirmed: Boolean,
  buyerConfirmedAt: Date,
  sellerConfirmedAt: Date
}
```

---

## 🧪 Testing Scenarios

### Test Case 1: Buyer Accepts First (SELL Listing)

1. ✅ Seller creates SELL listing (visible in marketplace)
2. ✅ Buyer places bid (status: 'pending')
3. ✅ Buyer clicks Accept
   - Status → 'accepted'
   - Listing hidden (status: 'negotiating')
   - Buyer gets: "Accepted! Waiting for seller..."
   - Seller gets: "Buyer accepted! Accept to confirm!"
4. ✅ Seller clicks Accept
   - Status → 'confirmed'
   - Codes generated
   - Both get: "Deal confirmed!"
   - Verification modal shown

### Test Case 2: Seller Accepts First (SELL Listing)

1. ✅ Seller creates SELL listing
2. ✅ Buyer places bid
3. ✅ Seller clicks Accept
   - Status → 'accepted'
   - Listing hidden
   - Seller gets: "Accepted! Waiting for buyer..."
   - Buyer gets: "Seller accepted! Accept to confirm!"
4. ✅ Buyer clicks Accept
   - Status → 'confirmed'
   - Deal complete

### Test Case 3: Buyer Accepts First (BUY Listing)

1. ✅ Buyer creates BUY listing
2. ✅ Seller places offer
3. ✅ Buyer clicks Accept
   - Status → 'accepted'
   - Listing hidden
   - Same flow as above

### Test Case 4: Seller Accepts First (BUY Listing)

1. ✅ Buyer creates BUY listing
2. ✅ Seller places offer
3. ✅ Seller clicks Accept
   - Status → 'accepted'
   - Listing hidden
   - Same flow as above

---

## 🎯 Key Benefits

✅ **Uniform Flow**: Both SELL and BUY listings follow same logic
✅ **Hidden Listings**: Marketplace hides listings after first acceptance
✅ **Clear Status**: 'accepted' vs 'confirmed' is obvious
✅ **Prevents Double Accept**: Backend checks if user already accepted
✅ **Proper Notifications**: Both parties informed at each step
✅ **High Priority UI**: Accepted deals show emerald cards
✅ **Two-Way Process**: Either party can accept first

---

## 📝 Summary

**Old Flow**:
- SELL: Seller accepts → Immediate confirmation
- BUY: Buyer accepts → pending_seller_confirmation → Seller confirms

**New Flow**:
- **BOTH**: First party accepts → 'accepted' (hidden) → Second party accepts → 'confirmed'

**Key Changes**:
1. ✅ First acceptance always sets status to 'accepted'
2. ✅ Listing always hidden after first acceptance
3. ✅ Second acceptance always confirms deal
4. ✅ Works same for SELL and BUY listings
5. ✅ Either party can accept first

---

**Implementation Date**: December 14, 2024
**Version**: v2.0
**Status**: ✅ Complete (Backend + Frontend + Mobile)
**Previous Docs**: ACCEPTED_DEALS_COMPLETE_SYSTEM.md, ADMIN_ACCEPTED_DEALS_COMPLETE.md
