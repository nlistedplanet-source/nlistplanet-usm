# Boost Feature - Visual Distinction Guide

## 🎯 Overview
Boosted listings get premium visual styling to stand out in the marketplace and attract more user attention.

---

## 🎨 Visual Design

### Desktop (MarketplaceCard Component)
**File:** `UnlistedHub-USM/frontend/src/components/MarketplaceCard.jsx`

**Premium Styling for Boosted Listings:**
1. **Golden Gradient Background:** `bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50`
2. **Premium Border:** `border-2 border-amber-400` with enhanced shadow `shadow-lg shadow-amber-200/50`
3. **Top Bar:** Gradient `bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500`
4. **Premium Badge:** Top-right corner with ⭐ PREMIUM label
   - Golden gradient background
   - White text with bold font
   - Shadow for depth
5. **Hover Effect:** `transform hover:scale-[1.02]` - subtle scale animation

### Mobile (CompactCard in MarketplacePage)
**File:** `nlistplanet-mobile/frontend/src/pages/marketplace/MarketplacePage.jsx`

**Premium Styling for Boosted Listings:**
1. **Golden Gradient Background:** `from-amber-50 via-yellow-50 to-orange-50`
2. **Enhanced Border:** `border-2 border-amber-400` with ring `ring-2 ring-amber-300/50`
3. **Shadow:** `shadow-lg shadow-amber-200/60` - stronger glow effect
4. **Premium Badge:** Inline with company name
   - `⚡ PREMIUM` label
   - Amber to orange gradient background
   - 8px font size for compact display
5. **Divider Color:** Amber-themed (`bg-amber-200`)

---

## 🔧 Implementation

### Props Required
```jsx
isBoosted={listing.isBoosted || (listing.boostedUntil && new Date(listing.boostedUntil) > new Date())}
```

**Logic:**
- Check `listing.isBoosted` flag (boolean)
- OR check if `listing.boostedUntil` date is in the future
- Returns `true` if either condition is met

### Database Fields (Backend)
From `backend/models/Listing.js`:
```javascript
isBoosted: { type: Boolean, default: false },
boostedUntil: { type: Date },
boostHistory: [{
  boostedAt: Date,
  expiresAt: Date,
  amount: Number
}]
```

---

## 🎨 Color Scheme Hierarchy

### Regular Listings
- **Sell Listings (Buy Opportunity):** Emerald green theme
  - Border: `border-emerald-200`
  - Background: `bg-emerald-50`
  - Text: `text-emerald-700`
  
- **Buy Listings (Sell Opportunity):** Yellow/Amber theme
  - Border: `border-yellow-200`
  - Background: `bg-yellow-50`
  - Text: `text-yellow-700`

### Boosted Listings (Highest Priority)
- **Theme:** Premium golden/amber/orange gradient
- **Border:** Thick golden border (2px vs 1px)
- **Shadow:** Enhanced glow effect
- **Badge:** Premium/Featured indicator
- **Hierarchy:** Overrides type-based colors

---

## 📊 Visual Hierarchy

```
┌─────────────────────────────────────┐
│ 🥇 BOOSTED LISTINGS                │ ← Premium golden theme
│    (Overrides all other styling)   │
├─────────────────────────────────────┤
│ 🟢 SELL LISTINGS (Buy Opportunity) │ ← Emerald green
├─────────────────────────────────────┤
│ 🟡 BUY LISTINGS (Sell Opportunity) │ ← Yellow/amber
└─────────────────────────────────────┘
```

---

## 🚀 Boost Feature Economics

**Pricing:** ₹100 for 24 hours  
**Purpose:** Increased visibility in marketplace  
**Target Users:** Sellers wanting faster transactions  

**Benefits:**
- Stand out with premium golden styling
- Higher position in search results (backend logic)
- Badge indicating featured/premium status
- Enhanced visual appeal attracts more clicks

---

## 📝 Usage Example

### Desktop
```jsx
<MarketplaceCard
  type="sell"
  companyName="Zerodha"
  price={650000}
  shares={100}
  isBoosted={true}  // ← Activates premium styling
  // ... other props
/>
```

### Mobile
```jsx
<CompactCard
  listing={{
    companyName: "Zerodha",
    price: 650000,
    quantity: 100,
    isBoosted: true,  // ← Activates premium styling
    // ... other fields
  }}
  onClick={handleClick}
/>
```

---

## 🎯 Design Rationale

1. **Golden Color Choice:** Universally associated with premium, value, and exclusivity
2. **Gradient Effects:** Modern, eye-catching, creates depth
3. **Enhanced Shadows:** Subtle glow makes cards "pop" from background
4. **Badge Placement:** Top-right (desktop) and inline (mobile) for instant recognition
5. **Scale Animation:** Hover feedback confirms interactivity
6. **Ring Effect (Mobile):** Adds extra visual layer on smaller screens

---

## 🔍 Testing Checklist

- [ ] Boosted cards show golden gradient background
- [ ] Premium badge displays correctly (⭐ PREMIUM or ⚡ PREMIUM)
- [ ] Border is thicker (2px) and golden colored
- [ ] Shadow effect visible and enhances card prominence
- [ ] Hover animation works smoothly (desktop)
- [ ] Non-boosted cards maintain original styling
- [ ] Badge doesn't overflow on mobile screens
- [ ] Boost expiration logic works (checks `boostedUntil` date)

---

## 🛠️ Future Enhancements

1. **Auto-Sort:** Boosted listings appear first in marketplace feed
2. **Boost Timer:** Show remaining time (e.g., "23h left")
3. **Pulse Animation:** Subtle glowing pulse effect for extra attention
4. **Analytics:** Track boost conversion rates
5. **Package Deals:** 3-day, 7-day boost options
6. **Multi-Boost:** Highlight listings that have been boosted multiple times

---

**Last Updated:** [Current Date]  
**Files Modified:**
- `UnlistedHub-USM/frontend/src/components/MarketplaceCard.jsx`
- `UnlistedHub-USM/frontend/src/pages/DashboardPage.jsx`
- `nlistplanet-mobile/frontend/src/pages/marketplace/MarketplacePage.jsx`
