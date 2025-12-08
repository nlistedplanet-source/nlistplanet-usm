# NlistPlanet Platform Fee Model

## Core Business Rule: 2% Platform Fee (Hidden from Users)

The platform charges a 2% fee on all transactions. This fee is **hidden from users** - they only see their adjusted prices.

---

## Fundamental Principle

| User Type | Always Sees |
|-----------|-------------|
| **SELLER** | What they will **RECEIVE** (after 2% deduction) |
| **BUYER** | What they will **PAY** (after 2% addition) |

**Both users see their OWN perspective - never the other person's actual amount.**

---

## Scenario 1: SELL Listing

> Seller wants to sell shares

### Step 1: Seller Creates Listing

```
Seller enters: ₹238/share

System calculates internally:
  • Seller will get:  ₹238 (their entered price)
  • Buyer will pay:   ₹242.76 (₹238 × 1.02)
  • Platform fee:     ₹4.76
```

### Marketplace View

| User | Sees | Explanation |
|------|------|-------------|
| Seller | Does NOT see own listing | Self-listings hidden |
| Buyer | ₹242.76/share | What buyer will PAY |

### Seller's Dashboard (My Posts)

```
Your Selling Price: ₹238/share (what seller will RECEIVE)
```

### Case 1A: Buyer Accepts at ₹242.76

**Buyer's Screen (Accept Modal):**
```
You will pay: ₹242.76/share
Quantity: 1,00,000
Total: ₹2.43 Cr
```

**Buyer's Dashboard (My Bids):**
```
Your Bid: ₹242.76/share (what buyer PAYS)
Status: Pending/Accepted
```

**Seller's Dashboard (Pending Bids):**
```
Bid from @buyer123
You will receive: ₹238/share (what seller GETS)
Quantity: 1,00,000
Total: ₹2.38 Cr
```

**Actual Transaction:**
```
• Buyer pays:   ₹2,42,76,000
• Seller gets:  ₹2,38,00,000
• Platform:     ₹4,76,000
```

### Case 1B: Buyer Places Lower Bid at ₹230

```
Buyer enters: ₹230 (what they want to pay)

System calculates:
  • Buyer pays:   ₹230
  • Seller gets:  ₹225.49 (₹230 × 0.98)
  • Platform:     ₹4.51
```

**Buyer's Dashboard (My Bids):**
```
Your Bid: ₹230/share (what buyer PAYS)
```

**Seller's Dashboard (Pending Bids):**
```
You will receive: ₹225.49/share (₹230 × 0.98)
```

### Case 1C: Counter Offer Flow

**Seller counters at ₹235:**
```
Seller enters: ₹235 (what they want to RECEIVE)

System calculates:
  • Seller gets:  ₹235
  • Buyer pays:   ₹239.80 (₹235 × 1.02)
```

**Seller's View (Counter History):**
```
#1 Buyer bid:     ₹225.49 (what seller would get from ₹230 bid)
#2 Your counter:  ₹235 (what seller wants)
#3 Buyer bid:     ₹230.30 (what seller would get from ₹235 bid)
```

**Buyer's View (Counter History):**
```
#1 Your bid:       ₹230 (what buyer pays)
#2 Seller counter: ₹239.80 (what buyer would pay for ₹235 ask)
#3 Your bid:       ₹235 (what buyer pays)
```

---

## Scenario 2: BUY Listing

> Buyer wants to buy shares

### Step 1: Buyer Creates Listing

```
Buyer enters: ₹500/share (their max budget)

System calculates internally:
  • Buyer will pay:   ₹500 (their entered price)
  • Seller will get:  ₹490 (₹500 × 0.98)
  • Platform fee:     ₹10
```

### Marketplace View

| User | Sees | Explanation |
|------|------|-------------|
| Buyer | Does NOT see own listing | Self-listings hidden |
| Seller | ₹490/share | What seller will RECEIVE |

### Buyer's Dashboard (My Posts)

```
Your Buy Budget: ₹500/share (what buyer will PAY)
```

### Case 2A: Seller Accepts at ₹490

**Seller's Screen (Accept Modal):**
```
You will receive: ₹490/share
Quantity: 50,000
Total: ₹2.45 Cr
```

**Seller's Dashboard (My Offers):**
```
Your Offer: ₹490/share (what seller GETS)
Status: Pending/Accepted
```

**Buyer's Dashboard (Offers Received):**
```
Offer from @seller456
You will pay: ₹500/share (what buyer PAYS)
Quantity: 50,000
Total: ₹2.50 Cr
```

**Actual Transaction:**
```
• Buyer pays:   ₹2,50,00,000
• Seller gets:  ₹2,45,00,000
• Platform:     ₹5,00,000
```

### Case 2B: Seller Places Higher Offer at ₹520

```
Seller enters: ₹520 (what they want to receive)

System calculates:
  • Seller gets:  ₹520
  • Buyer pays:   ₹530.61 (₹520 × 1.02)
```

**Seller's Dashboard (My Offers):**
```
Your Offer: ₹520/share (what seller GETS)
```

**Buyer's Dashboard (Offers Received):**
```
You will pay: ₹530.61/share (₹520 × 1.02)
```

---

## Price Display Rules Summary

### Seller Always Sees

| Context | Display |
|---------|---------|
| Own SELL listing | Original price (what they entered) |
| Incoming bids on SELL | `bid.price × 0.98` (what they will RECEIVE) |
| Own counter offer | Their entered price (what they want) |
| Buyer's counter | `counter.price × 0.98` (what they will RECEIVE) |
| BUY listing in marketplace | `buyer.price × 0.98` (what they will RECEIVE) |

### Buyer Always Sees

| Context | Display |
|---------|---------|
| Own BUY listing | Original price (their budget) |
| Own bids | Their entered price (what they will PAY) |
| Seller's counter | `counter.price × 1.02` (what they will PAY) |
| Incoming offers on BUY | `offer.price × 1.02` (what they will PAY) |
| SELL listing in marketplace | `seller.price × 1.02` (what they will PAY) |

---

## What is Hidden from Users

- ❌ "Platform Fee 2%" text anywhere
- ❌ Other person's actual price/amount
- ❌ Fee calculation breakdown
- ❌ "You receive" / "After fee" labels

---

## Helper Functions (Frontend)

```javascript
// utils/helpers.js

// Calculate what buyer pays (for SELL listings / seller counters)
export const calculateBuyerPays = (price) => {
  return price * 1.02;
};

// Calculate what seller receives (for bids / BUY listings)
export const calculateSellerGets = (price) => {
  return price * 0.98;
};
```

---

## Database Storage

Bids/Offers are stored with:
- `price`: The original price entered by user
- `originalPrice`: Backup of original price
- `buyerOfferedPrice`: What buyer pays (calculated)
- `sellerReceivesPrice`: What seller gets (calculated)
- `platformFee`: The 2% fee amount

---

## Admin View (Settlement)

Only admin sees the full breakdown during transaction closure:
```
Buyer Payment:    ₹2,42,76,000
Platform Fee:     ₹4,76,000 (2%)
Seller Payout:    ₹2,38,00,000
```

---

## Quick Reference Table

| Listing Type | Poster Sees | Other User Sees in Marketplace |
|--------------|-------------|-------------------------------|
| SELL ₹238 | ₹238 | ₹242.76 (×1.02) |
| BUY ₹500 | ₹500 | ₹490 (×0.98) |

| Bid/Offer | Bidder Sees | Listing Owner Sees |
|-----------|-------------|-------------------|
| Bid ₹230 on SELL | ₹230 | ₹225.49 (×0.98) |
| Offer ₹520 on BUY | ₹520 | ₹530.61 (×1.02) |

---

*Document Version: 1.0*
*Last Updated: December 8, 2025*
