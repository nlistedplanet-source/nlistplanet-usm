
# 🧩 Nlist Planet — System Architecture, Logic & Flow (Developer Handover)
**Environment:** React + Vite + Tailwind + Context API  
**Audience:** Developers using VS Code + GitHub Copilot  
**Purpose:** Explain complete functional and logical architecture for implementation and future scaling.

---

## 🏠 1. Landing Page

### Purpose
Entry point for users. Public access showing platform overview and sample listings.

### Sections
- Hero Section — Headline: *“Buy & Sell Unlisted Shares at Your Price”*
- CTA Button → [Login] (opens modal with Login/Sign Up tabs)
- Sample public posts → `CommonPostCard`
- Stats Counter (Active Users, Trading Volume, Companies)
- Footer with “How It Works” steps

### User Actions
- Login → Redirect `/dashboard`
- No sign up on header (handled inside modal)
- View sample posts (non-interactive)

---

## 👤 2. Authentication Flow (Login / Sign Up / KYC)

### Login
- Fields: Email/Mobile, Password
- “Remember Me”, “Forgot Password” (optional)
- On success → `user` context updated → redirect `/dashboard`

### Sign Up
- Fields: Full Name, Username, Email, Mobile, Password
- Checkboxes:
  - [x] I have an active Demat Account and latest CML Copy
  - [x] I agree to Terms & Conditions and Privacy Policy
- Label behavior: floating inside input outline (moves on input)
- On success → KYC incomplete notification shown

### KYC
- Post-signup banner in dashboard until verified.
- Required documents:
  - PAN, Address Proof, CML Copy, Bank Details
- Statuses:
  - **Incomplete** (can use site but unverified badge)
  - **Under Review**
  - **Verified** (green tick)

---

## 📊 3. User Dashboard Overview

### Tabs
| Tab | Purpose |
|------|----------|
| Market | Default view – public listings |
| Buy | Manage buy posts, offers, counters |
| Sell | Manage sell posts, bids, counters |
| Orders | Active/Previous deals |
| Portfolio | Holdings & add existing shares |
| FAQ | Read-only Q&A |
| Support | Contact Admin |
| Profile | Account details & privacy |

### Default Route
```
/dashboard/market
```

---

## 💹 4. Buy Section Logic

### 1. Buy List
- User’s own buy posts
- Card: similar to CommonPostCard (role = Buyer)
- Actions: Edit / Remove / View

### 2. Offer Received
- Shows all sellers’ offers on buyer’s posts
- Fields: Offer price, qty, seller username, date, verified badge
- Actions:
  - Accept → moves to Await Seller Confirm
  - Reject → closes offer
  - Counter → opens counter modal

### 3. Counter Offer Status
- Tracks counter negotiation chain
- Uses `BuyCounterOfferStatusCard`
- Shows both prices and current status
- Buyer can Accept Counter / Reject / Send New Offer

### 4. Transaction Complete
- Finalized deals (read-only)
- Shows settlement info (price, qty, date)

---

## 🏷️ 5. Sell Section Logic

### 1. Sell List
- User’s own sell posts
- Uses `SellPostCard`
- Edit/Delete + Active indicator

### 2. Bid Received
- Buyer bids shown here
- Uses `BidReceivedCard`
- Actions:
  - Accept → Await Buyer Confirm
  - Reject → Bid closed
  - Counter Offer → Buyer → Counter Status

### 3. Counter Offer Status
- Seller’s counter negotiation tab
- Shows Ask/Counter Price, Qty, Bidder, Status

### 4. Transaction Complete
- After admin closure → appears here (read-only)

---

## 📦 6. Orders Logic

| Type | Description |
|-------|--------------|
| Active Orders | Deals awaiting admin offline closure |
| Previous Orders | Completed or user-unlisted deals |

---

## 💰 7. Portfolio Logic

- User holdings of unlisted shares
- Add Existing Unlisted Share form:
  - Company Name, Sector, Purchase Date, Qty, Price, Notes
- Show current holdings with actions:
  - Place Sell Order (prefills company)
  - Buy More
  - Edit Record

---

## 💬 8. Support & FAQ

### Support
- Form fields: Subject, Message, (optional) Attachment
- Sends to admin requests tab

### FAQ
- Collapsible list (accordions)

---

## 👥 9. Profile Logic

| Field | Editable | Notes |
|--------|-----------|--------|
| Username | ✅ | public name (used on posts) |
| Full Name | ❌ | admin-only |
| Email / Mobile | ✅ | must reverify on edit |
| Profile Picture | ✅ | via auto avatar or upload |
| Privacy | N/A | hides contact info from others |

---

## 🧑‍💼 10. Admin Dashboard Overview

### Tabs
| Tab | Function |
|------|-----------|
| All Listings | View/remove all Buy/Sell posts |
| Bids/Offers | View all bids & counters |
| Deal Closure Queue | Both accepted deals appear here |
| Users/KYC | Approve user KYC documents |
| Portfolio Update | Adjust holdings post-deal |
| Requests | View messages from Support tab |

---

## 🔁 11. Deal Lifecycle (State Machine)

```text
User (Sell Post)
  ↓
Buyer places Bid (status: Pending Seller)
  ↓
Seller → [Accept] → Pending Buyer
      → [Reject] → Closed
      → [Counter Offer] → Buyer → Counter Status
  ↓
Both Accept → Admin → Deal Closure Queue
  ↓
Admin verifies offline → Marks Closed
  ↓
Orders → Previous
Portfolio Updated
```

---

## 🔗 12. Data Relationships

| Entity | Key Fields | Relation |
|---------|-------------|-----------|
| User | id, username, kycStatus | Owns listings, bids, portfolio |
| Listing | id, type, price, qty, company | Public post |
| Bid | id, listingId, price, status | Linked to listing |
| Order | id, bidId, status | Derived after acceptance |
| Portfolio | id, userId, companyName, qty | Updated post-deal |

---

## ⚙️ 13. Admin Flow Diagram

```text
User Dashboard
 ├─ Market → Posts visible to all
 ├─ Buy → Offers Received / Counter Offers
 └─ Sell → Bids Received / Counters Sent
       ↓
[Both Parties Accepted]
       ↓
Admin Dashboard
 ├─ Deal Closure Queue (manual verify)
 ├─ Update Portfolio (adjust holdings)
 ├─ Users/KYC (verify users)
 └─ Requests (handle support)

After closure:
 Orders → Previous
 Portfolio updated
```

---

## 🎨 14. Design Mapping

| Section | Accent | Component |
|----------|---------|------------|
| Market | Green | `CommonPostCard` |
| Sell | Blue | `SellPostCard` |
| Bid Received | Indigo | `BidReceivedCard` |
| Counter Offer | Green | `BuyCounterOfferStatusCard` |

**Theme:** Black base, soft shadows, rounded corners, neon-accent glow for highlights.

---

## 🔒 15. Security

- Hide real name, email, mobile from public
- RBAC for admin routes
- KYC docs stored securely (server-side only)
- Verify all deal transitions on server

---

## ✅ 16. Integration Map

| Location | Component | Data Source |
|-----------|------------|--------------|
| Market | CommonPostCard | Listings API |
| Sell → Sell List | SellPostCard | My Listings API |
| Sell → Bid Received | BidReceivedCard | Bids API |
| Buy → Counter Offer | BuyCounterOfferStatusCard | Counters API |
| Orders | Generic row/table | Orders API |
| Portfolio | Table/List | Portfolio API |
| Admin → Queue | Compact rows | Admin queue API |

---

## 💡 17. Developer Tips (VS Code)

- Use `AuthContext.jsx` for login state.
- Add axios or fetch layer for backend calls.
- Each card takes props (`onBid`, `onView`, `onAccept`, etc.) — connect to modals or API endpoints.
- Keep global formatting utils for price, qty, date.
- Use Tailwind responsive classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- Use VS Code snippets to speed up repeated JSX blocks.

---

## 📘 18. Deployment Notes

- Development: `npm run dev`
- Production build: `npm run build`
- Deploy on Netlify / Vercel
- API endpoints: configure `.env` for URLs

---

**Author:** System Spec by GPT‑5 (based on approved user flow)  
**File:** `/docs/NlistPlanet_System_Architecture_FULL.md`  
**Last Updated:** 08 Nov 2025
