# 📋 NlistPlanet - Complete User Flow Guide (Hindi)

> **Target Audience:** Non-technical stakeholders  
> **Purpose:** Har possible scenario ko simple Hindi mein samjhana - Seller, Buyer, Admin perspectives

---

## 🎯 Overview

**3 Main Roles:**
1. **👤 Seller** - Jiske paas shares hai aur bechna chahta hai
2. **💰 Buyer** - Jo shares kharidna chahta hai  
3. **👮 Admin** - Platform manage karta hai aur deals finalize karta hai

**2 Types of Listings:**
- **🔴 SELL Post** - Seller ne post kiya (buyer ko dikhega)
- **🟢 BUY Post** - Buyer ne post kiya (seller ko dikhega)

---

## 📊 Price Display Logic (Hidden 2% Fee)

### **Rule 1: Owner Ko Kya Dikhega**
- **SELL Post Owner (Seller)** → Apni price dikhegi (₹100)
- **BUY Post Owner (Buyer)** → Apni price dikhegi (₹100)

### **Rule 2: Non-Owner Ko Kya Dikhega**
- **SELL Post dekh rahe Buyer ko** → ₹102 dikhega (buyer pays with hidden +2%)
- **BUY Post dekh rahe Seller ko** → ₹98 dikhega (seller gets with hidden -2%)

### **Example:**
```
Seller creates SELL post at ₹238/share

✅ Seller Dashboard → "Your Price: ₹238"
✅ Marketplace (Buyer sees) → "Price: ₹242.76" (₹238 × 1.02)

Buyer places bid at ₹230

✅ Buyer Dashboard → "Your Bid: ₹230"  
✅ Seller Dashboard → "Bid Received: ₹225.49" (₹230 × 0.98)
```

**🚫 Kabhi Nahi Dikhega:**
- "Platform Fee" text
- "2%" mention
- Fee breakdown to users

**✅ Admin Dashboard Me Dikhega:**
- Buyer Pays: ₹242.76
- Seller Gets: ₹238.00
- Platform Fee (2%): ₹4.76

---

## 🔴 SCENARIO 1: SELL POST (Seller Posts → Buyer Bids)

### **Step 1: Seller Creates SELL Post**

**Seller Dashboard:**
```
┌─────────────────────────────────────┐
│ 📱 My Posts Tab                    │
├─────────────────────────────────────┤
│ [SELL] [BUY] ← SELL selected      │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ 🟢 ACTIVE                      │  │
│ │ Zepto (unlisted)               │  │
│ │ ₹238/share • 10,000 shares     │  │
│ │ Your Selling Price: ₹238       │  │
│ │                                 │  │
│ │ 👁️ Views: 150                   │  │
│ │ 📥 Bids Received: 0             │  │
│ │                                 │  │
│ │ [Share] [Boost] [Delete]       │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Marketplace (Buyers See):**
```
┌─────────────────────────────────────┐
│ 📱 Marketplace Tab                 │
├─────────────────────────────────────┤
│ [All] [Buy] [Sell] ← All selected │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ BUY OPPORTUNITY 🟢             │  │
│ │ Zepto                          │  │
│ │ ₹242.76/share                  │  │ ← Buyer pays (₹238 × 1.02)
│ │ 10,000 shares available        │  │
│ │                                 │  │
│ │ Seller: @trader_123            │  │
│ │ Posted: 2 hours ago            │  │
│ │                                 │  │
│ │ [Place Bid] [Share]            │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Recent Activity (Seller):**
```
┌─────────────────────────────────────┐
│ 📱 Recent Activity                 │
├─────────────────────────────────────┤
│ 📌 Your SELL post for Zepto is    │
│    now live in marketplace!        │
│    2 hours ago                     │
└─────────────────────────────────────┘
```

---

### **Step 2: Buyer Places Bid**

**Buyer Enters:**
- Price: ₹230 (jo buyer pay karega)
- Quantity: 5,000 shares

**Backend Calculation:**
```
Buyer Pays:     ₹230/share
Seller Gets:    ₹225.49/share (₹230 × 0.98)
Platform Fee:   ₹4.51/share (₹230 - ₹225.49)
```

**Buyer Dashboard (My Bids Tab):**
```
┌─────────────────────────────────────┐
│ 📱 My Bids Tab                     │
├─────────────────────────────────────┤
│ [Bids Placed] [Offers Made]        │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ ⏳ PENDING - Seller Reviewing  │  │
│ │ Zepto                          │  │
│ │ Your Bid: ₹230/share           │  │
│ │ Quantity: 5,000 shares         │  │
│ │ Total: ₹11,50,000              │  │
│ │                                 │  │
│ │ Seller: @trader_123            │  │
│ │ Placed: Just now               │  │
│ │                                 │  │
│ │ [View] [Cancel Bid]            │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Seller Dashboard (My Posts Tab - Bid Notification):**
```
┌─────────────────────────────────────┐
│ 📱 My Posts Tab                    │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐  │
│ │ 🟢 ACTIVE                      │  │
│ │ Zepto                          │  │
│ │ ₹238/share • 10,000 shares     │  │
│ │                                 │  │
│ │ 👁️ Views: 156                   │  │
│ │ 📥 Bids Received: 1 NEW!       │  │ ← Counter badge
│ │                                 │  │
│ │ ▼ Pending Bids (1)             │  │
│ │                                 │  │
│ │ 📌 @buyer_xyz bid ₹225.49      │  │ ← Seller gets (₹230 × 0.98)
│ │    Qty: 5,000 shares           │  │
│ │    You'll Receive: ₹11,27,451  │  │
│ │                                 │  │
│ │    [Accept ✅] [Reject ❌]     │  │
│ │    [Counter 🔄] [View 👁️]     │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Action Center (Seller Overview Tab):**
```
┌─────────────────────────────────────┐
│ 🔔 Action Center (1 pending)      │
├─────────────────────────────────────┤
│ ⚠️ NEW BID RECEIVED                │
│                                     │
│ Zepto - SELL Post                  │
│ @buyer_xyz offered ₹225.49/share   │
│ Qty: 5,000 shares                  │
│                                     │
│ [Accept ✅] [Reject ❌]           │
│ [Counter 🔄] [View Details 👁️]   │
└─────────────────────────────────────┘
```

**Recent Activity (Both Users):**
```
Buyer:
┌─────────────────────────────────────┐
│ 💸 You placed a bid on Zepto       │
│    ₹230/share × 5,000 shares       │
│    Just now                        │
└─────────────────────────────────────┘

Seller:
┌─────────────────────────────────────┐
│ 📥 @buyer_xyz placed bid on Zepto  │
│    ₹225.49/share × 5,000 shares    │
│    Just now                        │
└─────────────────────────────────────┘
```

---

### **Step 3A: Seller Accepts Bid (Deal Confirmed ✅)**

**Backend Process:**
- Status: `pending` → `confirmed`
- Listing: `active` → `sold`
- Other pending bids: Rejected automatically
- Verification codes generated

**Seller Card Status:**
```
┌─────────────────────────────────────┐
│ 🎉 CONFIRMED ✅                    │
│ Zepto                              │
│ Sold: ₹225.49/share                │
│ Qty: 5,000 shares                  │
│ You'll Receive: ₹11,27,451         │
│                                     │
│ Buyer: @buyer_xyz                  │
│                                     │
│ 🔐 Verification Codes Generated    │
│ [View Codes] [Contact Admin]       │
└─────────────────────────────────────┘
```

**Buyer Card Status:**
```
┌─────────────────────────────────────┐
│ 🎉 DEAL CONFIRMED ✅                │
│ Zepto                              │
│ Your Bid Accepted: ₹230/share      │
│ Qty: 5,000 shares                  │
│ Total Payment: ₹11,50,000          │
│                                     │
│ Seller: @trader_123                │
│                                     │
│ 🔐 Verification Codes Generated    │
│ [View Codes] [Contact Admin]       │
└─────────────────────────────────────┘
```

**Verification Codes Modal:**
```
┌─────────────────────────────────────┐
│ 🔐 Deal Verification Codes         │
├─────────────────────────────────────┤
│ Zepto - 5,000 shares               │
│                                     │
│ BUYER CODE:                        │
│ ┌─────────────────────────────┐   │
│ │  BUY-ZEPTO-8F3A2             │   │ ← 6-digit unique code
│ └─────────────────────────────┘   │
│ [Copy]                             │
│                                     │
│ SELLER CODE:                       │
│ ┌─────────────────────────────┐   │
│ │  SELL-ZEPTO-K9L2C            │   │ ← 6-digit unique code
│ └─────────────────────────────┘   │
│ [Copy]                             │
│                                     │
│ ⚠️ Share these codes with admin   │
│    to complete the transaction!    │
│                                     │
│ [Contact Admin] [Close]            │
└─────────────────────────────────────┘
```

**Recent Activity (Both):**
```
Seller:
┌─────────────────────────────────────┐
│ 🎉 Deal Confirmed! Zepto sold to   │
│    @buyer_xyz at ₹225.49/share     │
│    Check verification codes!       │
│    Just now                        │
└─────────────────────────────────────┘

Buyer:
┌─────────────────────────────────────┐
│ 🎉 Deal Confirmed! Your bid for    │
│    Zepto accepted by @trader_123   │
│    Check verification codes!       │
│    Just now                        │
└─────────────────────────────────────┘
```

**Marketplace:**
- ❌ Listing ab marketplace se **hat jayegi** (sold)
- ✅ History tab me move ho jayegi (both users)

**Admin Dashboard (Final Deals Tab):**
```
┌─────────────────────────────────────┐
│ ✅ CONFIRMED - Pending Closure      │
│ Zepto                              │
│                                     │
│ Buyer: @buyer_xyz                  │
│ Buyer Pays: ₹11,50,000             │
│ Buyer Code: BUY-ZEPTO-8F3A2        │
│                                     │
│ Seller: @trader_123                │
│ Seller Gets: ₹11,27,451            │
│ Seller Code: SELL-ZEPTO-K9L2C      │
│                                     │
│ Platform Fee: ₹22,549 (2%)         │
│                                     │
│ [Mark as Closed] [View Details]    │
└─────────────────────────────────────┘
```

---

### **Step 3B: Seller Rejects Bid**

**Seller Card (After Reject):**
```
┌─────────────────────────────────────┐
│ 🟢 ACTIVE                          │
│ Zepto                              │
│ ₹238/share • 10,000 shares         │
│                                     │
│ 📥 Bids Received: 0                │
│ (Previous bid rejected)            │
│                                     │
│ [Share] [Boost] [Delete]           │
└─────────────────────────────────────┘
```

**Buyer Card (My Bids Tab):**
```
┌─────────────────────────────────────┐
│ ❌ REJECTED                         │
│ Zepto                              │
│ Your Bid: ₹230/share               │
│ Qty: 5,000 shares                  │
│                                     │
│ Seller: @trader_123                │
│ Status: Bid Rejected               │
│ Rejected: 5 mins ago               │
│                                     │
│ [View Listing] [Delete]            │
└─────────────────────────────────────┘
```

**Recent Activity:**
```
Buyer:
┌─────────────────────────────────────┐
│ ❌ Your bid on Zepto was rejected  │
│    by @trader_123                  │
│    5 mins ago                      │
└─────────────────────────────────────┘
```

**Marketplace:**
- ✅ Listing **wapas marketplace me active** rahegi
- Buyer phir se bid place kar sakta hai

---

### **Step 3C: Seller Counters the Bid 🔄**

**Seller Enters Counter:**
- Price: ₹235/share (jo seller ko chahiye)
- Quantity: 5,000 shares (same ya change kar sakta hai)

**Backend Calculation:**
```
Seller Gets:    ₹235/share
Buyer Pays:     ₹239.80/share (₹235 / 0.98)
Platform Fee:   ₹4.80/share
```

**Seller Card (After Counter):**
```
┌─────────────────────────────────────┐
│ 🟠 NEGOTIATING                     │
│ Zepto                              │
│ ₹238/share • 10,000 shares         │
│                                     │
│ ▼ Counter Offers (1)               │
│                                     │
│ 📌 You countered @buyer_xyz        │
│    Your Counter: ₹235/share        │
│    Qty: 5,000 shares               │
│    You'll Get: ₹11,75,000          │
│                                     │
│    ⏳ Waiting for buyer response   │
│                                     │
│    Round 1:                        │
│    Buyer Bid: ₹225.49 → You: ₹235  │
│                                     │
│    [View History]                  │
└─────────────────────────────────────┘
```

**Buyer Card (My Bids Tab):**
```
┌─────────────────────────────────────┐
│ ⚠️ COUNTER RECEIVED - Action Needed│
│ Zepto                              │
│                                     │
│ Round 1 (Your Bid):                │
│ ₹230/share × 5,000 = ₹11,50,000    │
│                                     │
│ Round 2 (Seller Counter):          │
│ ₹239.80/share × 5,000 = ₹11,98,980 │ ← Buyer pays
│                                     │
│ ⏳ Waiting for your response       │
│                                     │
│ [Accept ✅] [Reject ❌]           │
│ [Counter Back 🔄] [View History]  │
└─────────────────────────────────────┘
```

**Action Center (Buyer):**
```
┌─────────────────────────────────────┐
│ 🔔 Action Center (1 pending)      │
├─────────────────────────────────────┤
│ ⚠️ COUNTER OFFER RECEIVED          │
│                                     │
│ Zepto - Your Bid                   │
│ Seller wants ₹239.80/share         │
│ (You pay, with fee included)       │
│                                     │
│ [Accept ✅] [Reject ❌]           │
│ [Counter Back 🔄] [View]          │
└─────────────────────────────────────┘
```

**Marketplace:**
- ❌ Listing **hide ho jayegi** marketplace se (status: `negotiating`)
- Other users ko nahi dikhegi (deal in progress)

**Recent Activity:**
```
Seller:
┌─────────────────────────────────────┐
│ 🔄 You countered @buyer_xyz bid    │
│    Zepto - ₹235/share              │
│    Just now                        │
└─────────────────────────────────────┘

Buyer:
┌─────────────────────────────────────┐
│ 🔄 @trader_123 countered your bid  │
│    Zepto - ₹239.80/share           │
│    Just now                        │
└─────────────────────────────────────┘
```

**Counter History (Both Can See):**
```
┌─────────────────────────────────────┐
│ 📝 Negotiation History             │
├─────────────────────────────────────┤
│                                     │
│ Round 1:                           │
│ 👤 Buyer: ₹230/share               │
│    5,000 shares                    │
│    2 hours ago                     │
│                                     │
│ Round 2:                           │
│ 👤 Seller: ₹239.80/share           │
│    5,000 shares                    │
│    Just now                        │
│                                     │
│ ⏳ Waiting for buyer response      │
└─────────────────────────────────────┘
```

---

### **Step 4: Buyer Accepts Counter (Deal Final)**

**Same as Step 3A** - Deal confirmed, codes generated, listing sold

---

### **Step 5: Buyer Rejects Counter**

**Buyer Card:**
```
┌─────────────────────────────────────┐
│ ❌ COUNTER REJECTED                 │
│ Zepto                              │
│ Negotiation ended                  │
│                                     │
│ Seller wanted: ₹239.80/share       │
│ You rejected the counter           │
│                                     │
│ [View History] [Delete]            │
└─────────────────────────────────────┘
```

**Seller Card:**
```
┌─────────────────────────────────────┐
│ 🟢 ACTIVE                          │
│ Zepto                              │
│ ₹238/share • 10,000 shares         │
│                                     │
│ Buyer rejected your counter        │
│                                     │
│ [Share] [Boost] [Delete]           │
└─────────────────────────────────────┘
```

**Marketplace:**
- ✅ Listing **wapas active** ho jayegi
- Other buyers phir se bid kar sakte hain

---

## 🟢 SCENARIO 2: BUY POST (Buyer Posts → Seller Offers)

### **Step 1: Buyer Creates BUY Post**

**Buyer Dashboard:**
```
┌─────────────────────────────────────┐
│ 📱 My Posts Tab                    │
├─────────────────────────────────────┤
│ [SELL] [BUY] ← BUY selected        │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ 🟢 ACTIVE                      │  │
│ │ Swiggy (unlisted)              │  │
│ │ ₹150/share • Want 8,000 shares │  │
│ │ Your Buy Price: ₹150           │  │
│ │                                 │  │
│ │ 👁️ Views: 89                    │  │
│ │ 📥 Offers Received: 0           │  │
│ │                                 │  │
│ │ [Share] [Delete]               │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Marketplace (Sellers See):**
```
┌─────────────────────────────────────┐
│ 📱 Marketplace Tab                 │
├─────────────────────────────────────┤
│ [All] [Buy] [Sell] ← All selected │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ SELL OPPORTUNITY 🔵            │  │
│ │ Swiggy                         │  │
│ │ ₹147/share                     │  │ ← Seller gets (₹150 × 0.98)
│ │ Buyer wants 8,000 shares       │  │
│ │                                 │  │
│ │ Buyer: @investor_456           │  │
│ │ Posted: 1 hour ago             │  │
│ │                                 │  │
│ │ [Make Offer] [Share]           │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Recent Activity (Buyer):**
```
┌─────────────────────────────────────┐
│ 📌 Your BUY request for Swiggy is  │
│    now live in marketplace!        │
│    1 hour ago                      │
└─────────────────────────────────────┘
```

---

### **Step 2: Seller Places Offer**

**Seller Enters:**
- Price: ₹155/share (jo seller ko chahiye)
- Quantity: 5,000 shares

**Backend Calculation:**
```
Seller Gets:    ₹155/share
Buyer Pays:     ₹158.16/share (₹155 / 0.98)
Platform Fee:   ₹3.16/share
```

**Seller Dashboard (My Bids Tab → Offers Made):**
```
┌─────────────────────────────────────┐
│ 📱 My Bids Tab                     │
├─────────────────────────────────────┤
│ [Bids Placed] [Offers Made]        │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ ⏳ PENDING - Buyer Reviewing   │  │
│ │ Swiggy                         │  │
│ │ Your Offer: ₹155/share         │  │
│ │ Quantity: 5,000 shares         │  │
│ │ You'll Get: ₹7,75,000          │  │
│ │                                 │  │
│ │ Buyer: @investor_456           │  │
│ │ Placed: Just now               │  │
│ │                                 │  │
│ │ [View] [Cancel Offer]          │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Buyer Dashboard (My Posts Tab - Offer Notification):**
```
┌─────────────────────────────────────┐
│ 📱 My Posts Tab                    │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐  │
│ │ 🟢 ACTIVE                      │  │
│ │ Swiggy                         │  │
│ │ ₹150/share • 8,000 shares      │  │
│ │                                 │  │
│ │ 👁️ Views: 95                    │  │
│ │ 📥 Offers Received: 1 NEW!     │  │ ← Counter badge
│ │                                 │  │
│ │ ▼ Pending Offers (1)           │  │
│ │                                 │  │
│ │ 📌 @seller_789 offered ₹158.16 │  │ ← Buyer pays (₹155 / 0.98)
│ │    Qty: 5,000 shares           │  │
│ │    You'll Pay: ₹7,90,816       │  │
│ │                                 │  │
│ │    [Accept ✅] [Reject ❌]     │  │
│ │    [Counter 🔄] [View 👁️]     │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Action Center (Buyer Overview Tab):**
```
┌─────────────────────────────────────┐
│ 🔔 Action Center (1 pending)      │
├─────────────────────────────────────┤
│ ⚠️ NEW OFFER RECEIVED              │
│                                     │
│ Swiggy - BUY Request               │
│ @seller_789 wants ₹158.16/share    │
│ (You pay, with fee included)       │
│ Qty: 5,000 shares                  │
│                                     │
│ [Accept ✅] [Reject ❌]           │
│ [Counter 🔄] [View Details 👁️]   │
└─────────────────────────────────────┘
```

**Recent Activity (Both Users):**
```
Seller:
┌─────────────────────────────────────┐
│ 💸 You offered to sell Swiggy      │
│    ₹155/share × 5,000 shares       │
│    Just now                        │
└─────────────────────────────────────┘

Buyer:
┌─────────────────────────────────────┐
│ 📥 @seller_789 offered Swiggy      │
│    ₹158.16/share × 5,000 shares    │
│    Just now                        │
└─────────────────────────────────────┘
```

---

### **Step 3-5: Same as SELL Post**
- Accept → Deal Confirmed (verification codes)
- Reject → Offer rejected, listing wapas active
- Counter → Negotiation rounds (same flow as SELL)

---

## 📋 SUMMARY TABLE: Card Status & Display

### **My Posts Tab (Seller/Buyer Own Listings)**

| Status | Badge Color | What Shows | Actions Available |
|--------|-------------|------------|-------------------|
| 🟢 ACTIVE | Green | "ACTIVE", Views count, Bids/Offers count (0) | Share, Boost, Delete |
| 🟠 NEGOTIATING | Orange | "NEGOTIATING", Counter offers in progress | View counter history |
| ✅ CONFIRMED | Green | "CONFIRMED", Deal amount, Verification codes | View codes, Contact admin |
| ❌ CANCELLED | Gray | "CANCELLED", Reason shown | Delete |
| 🟣 SOLD | Purple | "SOLD", Final price, Buyer/Seller info | View history, Delete |

### **My Bids Tab (User's Placed Bids/Offers)**

| Status | Badge Color | What Shows | Actions Available |
|--------|-------------|------------|-------------------|
| ⏳ PENDING | Yellow | "Seller/Buyer Reviewing", Your bid/offer | View, Cancel |
| ⚠️ COUNTER RECEIVED | Amber/Blinking | "Action Needed", Counter price, Round history | Accept, Reject, Counter back |
| ✅ ACCEPTED | Green | "Deal Accepted", Waiting for confirmation | View |
| ✅ CONFIRMED | Green | "Deal Confirmed", Verification codes | View codes |
| ❌ REJECTED | Red | "Rejected", Reason if any | View, Delete |
| 🔄 COUNTERED | Blue | "Counter Sent", Waiting for response | View history |

### **Marketplace Tab (Public Listings)**

| Listing Type | Badge | Price Shows | Who Sees |
|--------------|-------|-------------|----------|
| 🟢 BUY Opportunity | Green "Buy" | Buyer Pays (+2% fee) | All buyers (not sellers) |
| 🔵 SELL Opportunity | Blue "Sell" | Seller Gets (-2% fee) | All sellers (not buyers) |
| 🟠 NEGOTIATING | Hidden | N/A | Nobody (hidden from marketplace) |
| ✅ SOLD | Hidden | N/A | Nobody (moved to history) |

### **Action Center (Overview Tab)**

| Alert Type | Priority | Shows |
|------------|----------|-------|
| ⚠️ NEW BID/OFFER | High | Red/Orange badge, Action buttons visible |
| 🔄 COUNTER RECEIVED | High | Amber blinking badge, Needs response |
| ✅ DEAL ACCEPTED | High | Green badge, Waiting for other party |
| 🎉 DEAL CONFIRMED | Normal | Green badge, Codes generated |

### **Recent Activity (Timeline)**

| Event | Icon | Message Example |
|-------|------|-----------------|
| Post Created | 📌 | "Your SELL post for Zepto is now live" |
| Bid Received | 📥 | "@buyer_xyz placed bid on Zepto" |
| Counter Sent | 🔄 | "You countered @buyer_xyz bid" |
| Deal Confirmed | 🎉 | "Deal Confirmed! Check verification codes" |
| Bid Rejected | ❌ | "Your bid on Zepto was rejected" |

---

## 👮 ADMIN DASHBOARD

### **Final Deals Tab**

```
┌─────────────────────────────────────┐
│ ✅ CONFIRMED - Pending Closure      │
├─────────────────────────────────────┤
│ Deal ID: #D12345                   │
│ Company: Zepto                     │
│ Type: SELL                         │
│ Quantity: 5,000 shares             │
│                                     │
│ 👤 BUYER DETAILS:                  │
│ Name: Rahul Kumar                  │
│ Username: @buyer_xyz               │
│ Buyer Pays: ₹11,50,000             │
│ Code: BUY-ZEPTO-8F3A2              │
│                                     │
│ 👤 SELLER DETAILS:                 │
│ Name: Amit Sharma                  │
│ Username: @trader_123              │
│ Seller Gets: ₹11,27,451            │
│ Code: SELL-ZEPTO-K9L2C             │
│                                     │
│ 💰 PLATFORM FEE: ₹22,549 (2%)     │
│                                     │
│ 📅 Confirmed: 15 Dec 2025, 3:45 PM│
│                                     │
│ [Mark as Closed ✅] [View Full]   │
└─────────────────────────────────────┘
```

**After Admin Closes Deal:**
- Status: `confirmed` → `completed`
- Deal moves to **Completed Deals** tab
- Both users get notification: "✅ Deal Completed! Transaction closed by admin."
- Deal history permanently saved

---

## 🔄 STATUS LIFECYCLE CHART

```
SELL POST:
┌─────────┐
│ ACTIVE  │ ← Marketplace visible
└────┬────┘
     │ Bid placed
     ↓
┌─────────┐
│ PENDING │ ← Seller reviewing
└────┬────┘
     │
     ├─→ Accept → CONFIRMED → Admin closes → COMPLETED ✅
     │
     ├─→ Reject → ACTIVE (back to marketplace)
     │
     └─→ Counter → NEGOTIATING → Hidden from marketplace
              │
              ├─→ Accept → CONFIRMED
              └─→ Reject → ACTIVE

BUY POST: (Same flow, roles reversed)
```

---

## 💡 KEY POINTS

### **Price Display Rules (2% Hidden Fee)**
1. **Owner always sees original price** entered by them
2. **Non-owner sees adjusted price** (buyer +2%, seller -2%)
3. **Platform fee NEVER shown** to users
4. **Admin sees full breakdown** (buyer pays, seller gets, platform fee)

### **Card Visibility**
- **ACTIVE** → Marketplace visible ✅
- **NEGOTIATING** → Marketplace hidden ❌ (deal in progress)
- **CONFIRMED/SOLD** → Marketplace hidden ❌ (moved to history)
- **CANCELLED** → Marketplace hidden ❌ (user cancelled)

### **Action Center Priorities**
1. **Counter Received** → Highest (blinking amber badge)
2. **New Bid/Offer** → High (red/orange badge)
3. **Deal Accepted** → Medium (waiting for other party)
4. **Deal Confirmed** → Normal (codes generated)

### **Notifications**
- Real-time via **Recent Activity** timeline
- Push notifications (if enabled)
- Email alerts for deal confirmations

---

## 📞 CONTACT & VERIFICATION

**After Deal Confirmed:**
1. Both parties get **unique verification codes**
2. Both contact admin via:
   - WhatsApp: +91-XXXXXXXXXX
   - Email: support@nlistplanet.com
3. Share codes with admin
4. Admin verifies both codes match
5. Admin marks deal as **COMPLETED ✅**
6. Transaction closed, funds transferred

---

## ❓ FAQs

**Q: Agar seller ko bid pasand nahi aayi to?**  
A: Seller can **Reject** or **Counter** with different price

**Q: Negotiation kitni baar ho sakti hai?**  
A: Unlimited rounds tak, jab tak dono agree na ho jayein

**Q: Marketplace me apni listing kyun nahi dikhi?**  
A: Own listing kabhi marketplace me nahi dikhti (to avoid confusion)

**Q: Platform fee kaise charge hota hai?**  
A: Automatically - buyer pays 2% extra, seller gets 2% less. Transparent to admin only.

**Q: Verification codes ka kya kaam hai?**  
A: Security - admin dono codes verify karta hai to ensure genuine deal

**Q: Deal cancel ho sakti hai confirmation ke baad?**  
A: Nahi - confirmed deal sirf admin hi cancel kar sakta hai (special cases only)

---

**🎉 END OF GUIDE**

> **Note:** Ye guide har possible scenario cover karti hai. Real UI me subtle differences ho sakte hain (colors, icons, wording) but core flow yahi rahegi.
