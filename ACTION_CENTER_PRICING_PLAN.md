# Action Center Pricing Logic - Complete Plan

## Platform Fee Model (Hidden 2%)
- **Buyer Pays**: Original Price × 1.02 (+2%)
- **Seller Gets**: Original Price × 0.98 (-2%)
- **Platform Fee**: 2% (hidden from users)

---

## Scenario 1: User A (Seller) receives Bid from User B (Buyer)

### Setup:
- **User A (@hrithik947)**: Creates SELL listing for Zepto at **₹60/share**
- **User B (@spongebob205)**: Places bid of **₹60/share**

### User A's View (Seller - My Posts Tab):
```
Listing Price: ₹58.80  (₹60 × 0.98 - what seller will receive)
Quantity: 10,000 shares

Incoming Bid:
- Buyer: @spongebob205
- Buyer Bid: ₹60.00  (what buyer entered)
- Your Price: ₹58.80  (what you'll receive if accepted)
```

### User A's View (Seller - Action Center):
```
TYPE: Sell | Bid
COMPANY: Zepto Private Limited
  List Price: ₹58.80  (seller sees what they'll receive)
  Qty: 10,000
YOUR BID: ₹58.80  (seller's listing price - what they'll get)
BUYER PRICE: ₹60.00  (buyer's bid - raw amount buyer entered)
```

### User B's View (Buyer - My Bids Tab):
```
Listing: Zepto Private Limited
Seller: @hrithik947
Listed Price: ₹61.20  (₹60 × 1.02 - what buyer will pay)

Negotiation History:
Round 1 - Your Bid: ₹60.00  (what I entered)
Status: Pending
```

### User B's View (Buyer - Action Center):
```
(No entry - only sellers see incoming bids in Action Center)
```

---

## Scenario 2: User A (Seller) sends Counter to User B (Buyer)

### Setup:
- User A counters User B's bid of ₹60 with **₹59/share**

### User A's View (Seller - My Posts Tab):
```
Counter Offers In-Progress:
- Buyer: @spongebob205
- Buyer Bid: ₹60.00
- Your Price: ₹59.00  (your counter - what you want to receive)
- Status: Waiting for buyer
```

### User A's View (Seller - Action Center):
```
(No entry - seller doesn't see their own counter in Action Center)
```

### User B's View (Buyer - My Bids Tab):
```
Listing: Zepto Private Limited
Seller: @hrithik947
Listed Price: ₹61.20  (original listing × 1.02)

Negotiation History:
Round 1 - Your Bid: ₹60.00
Round 1 - Seller Counter: ₹60.18  (₹59 × 1.02 - what buyer will pay)
Status: Countered
```

### User B's View (Buyer - Action Center):
```
TYPE: Buy | Counter
COMPANY: Zepto Private Limited
  List Price: ₹61.20  (original listing price buyer sees)
  Qty: 10,000
YOUR BID: ₹60.00  (buyer's ORIGINAL bid - never changes)
SELLER PRICE: ₹60.18  (₹59 × 1.02 - seller's counter adjusted for buyer)
```

---

## Scenario 3: User C (Buyer) creates BUY request, User D (Seller) sends Offer

### Setup:
- **User C**: Creates BUY request for HDFC Bank at **₹1500/share**
- **User D**: Sends offer of **₹1500/share**

### User C's View (Buyer - My Posts Tab):
```
Listing Price: ₹1530.00  (₹1500 × 1.02 - what buyer will pay)
Quantity: 100 shares

Incoming Offer:
- Seller: @userD
- Seller Offer: ₹1500.00  (what seller entered)
- Your Price: ₹1530.00  (what you'll pay if accepted)
```

### User C's View (Buyer - Action Center):
```
TYPE: Buy | Offer
COMPANY: HDFC Bank
  List Price: ₹1530.00  (buyer sees what they'll pay)
  Qty: 100
YOUR BID: ₹1530.00  (buyer's listing price - what they'll pay)
SELLER PRICE: ₹1500.00  (seller's offer - raw amount seller entered)
```

### User D's View (Seller - My Bids Tab):
```
Listing: HDFC Bank
Buyer: @userC
Listed Price: ₹1470.00  (₹1500 × 0.98 - what seller will receive)

Negotiation History:
Round 1 - Your Offer: ₹1500.00  (what I entered)
Status: Pending
```

---

## Critical Rules for Action Center

### For SELL Listings (Seller receives Bids):

**Seller's Action Center Entry:**
```javascript
listPrice: listing.price × 0.98           // What seller will receive
myActionPrice: listing.price × 0.98       // Seller's listing (what they get)
otherActionPrice: bid.price               // Buyer's bid (raw amount)
columnHeader: "BUYER PRICE"
```

**Buyer's My Bids Tab:**
```javascript
listPrice: listing.price × 1.02           // What buyer will pay
myActionPrice: bid.originalPrice          // Buyer's original bid (never changes)
counterPrice: counter.price × 1.02        // Seller's counter (adjusted for buyer)
```

### For BUY Listings (Buyer receives Offers):

**Buyer's Action Center Entry:**
```javascript
listPrice: listing.price × 1.02           // What buyer will pay
myActionPrice: listing.price × 1.02       // Buyer's listing (what they pay)
otherActionPrice: offer.price             // Seller's offer (raw amount)
columnHeader: "SELLER PRICE"
```

**Seller's My Bids Tab:**
```javascript
listPrice: listing.price × 0.98           // What seller will receive
myActionPrice: offer.originalPrice        // Seller's original offer (never changes)
counterPrice: counter.price × 0.98        // Buyer's counter (adjusted for seller)
```

---

## Current Bug Analysis

### Screenshot shows:
```
User B (Buyer @spongebob205) viewing Action Center:
- List Price: ₹61 (should be ₹61.20)
- Your Bid: ₹60 (CORRECT ✓)
- Buyer Price: ₹59 (should be ₹60.18 and labeled "SELLER PRICE")
```

### Root Cause:
1. **List Price ₹61 instead of ₹61.20**: 
   - `activity.listing.displayPrice` might be rounding or not set
   - Need to ensure backend calculates 60 × 1.02 = 61.20

2. **₹59 instead of ₹60.18**:
   - Counter price not applying buyer fee (+2%)
   - Should be: latestCounter.price (59) × 1.02 = 60.18

3. **"BUYER PRICE" instead of "SELLER PRICE"**:
   - `isBuyer` detection is wrong
   - User B is bidding on SELL listing → User B is BUYER
   - Should show "SELLER PRICE" (the counter from seller)

### Fix Required:
```javascript
// In Action Center data construction:
const isBuyer = activity.type === 'bid'; // If I placed a BID, I am BUYER

// List Price (ensure 2 decimals):
const listPrice = activity.listing.displayPrice || 
  (isBuyer ? calculateBuyerPays(activity.listing.listingPrice) : 
             calculateSellerGets(activity.listing.listingPrice));

// Other Price (counter with fees):
const otherPrice = isBuyer 
  ? calculateBuyerPays(latestCounter.price)  // Seller's counter → Buyer Pays
  : calculateSellerGets(latestCounter.price); // Buyer's counter → Seller Gets

// Column Header:
const priceLabel = isBuyer ? 'SELLER PRICE' : 'BUYER PRICE';
```

---

## Expected Final Result

### User B (Buyer @spongebob205) Action Center:
```
TYPE: Buy | Counter | 12 Dec
COMPANY: Zepto Private Limited
  List Price: ₹61.20
  Qty: 10,000
YOUR BID: ₹60.00
SELLER PRICE: ₹60.18
[✓ Accept] [✗ Reject] [↻ Counter] [👁 View]
```
