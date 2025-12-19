# 🎯 Complete Referral & Share Tracking System

## System Architecture

### 1. Share Tracking (Post Sharing)
**When User Shares a Post:**
- Generate unique share link: `https://nlistplanet.com/listing/{listingId}?ref={shareId}`
- Track:
  - Views (unique visitors by IP)
  - Clicks
  - Conversions (if viewer makes transaction)
  - Earnings (1% of platform fee on conversions)

### 2. User Referral System
**Two Types:**
1. **Own Post Sharing** - User shares their own listing
2. **Other's Post Sharing** - User shares marketplace listing

### 3. Dashboard Displays

**User Dashboard - Referrals Tab:**
```
┌─────────────────────────────────────────────────────┐
│  📊 My Referral Performance                          │
│  ────────────────────────────────────────────────────│
│  Total Shares: 25    Views: 1,234    Conversions: 3 │
│  Total Earnings: ₹12,450                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🔗 Shared Posts                                     │
│  ────────────────────────────────────────────────────│
│  [Card]                                              │
│  Company: OYO Rooms                                  │
│  Post ID: NLP-8C79CB                                 │
│  Owner: @spongebob205 (Other's Post) / Your Post    │
│  ────────────────────────────────────────────────────│
│  📈 Performance:                                     │
│    Views: 45   Clicks: 12   Conversions: 1          │
│  💰 Earnings: ₹450                                   │
│  🔗 Share Link: [Copy] [Share Again]                │
└─────────────────────────────────────────────────────┘
```

**Admin Dashboard:**
```
┌─────────────────────────────────────────────────────┐
│  📊 Referral Analytics                               │
│  ────────────────────────────────────────────────────│
│  Total Shares: 1,250                                 │
│  Total Views: 45,678                                 │
│  Conversion Rate: 2.3%                               │
│  Platform Revenue from Referrals: ₹2,34,567         │
│  Referral Payouts: ₹23,456                          │
└─────────────────────────────────────────────────────┘

[Table with filters]
- Sharer username
- Post shared
- Views/Conversions
- Earnings
- Status
```

## Implementation Flow

### Backend API Endpoints:
```
POST   /api/share/create           - Create share link
GET    /api/share/track/:shareId   - Track click/view
GET    /api/share/my-shares        - Get user's all shares
GET    /api/admin/referrals        - Admin analytics
```

### Database Schema Updates:
- ShareTracking: ✅ Already exists (minor updates needed)
- ReferralTracking: ✅ Already exists
- Need to link Transaction → ShareTracking for conversion attribution

## Referral Reward Structure:
- Platform Fee: 2% of transaction
- Referral Reward: 50% of platform fee = 1% of transaction value
- Example: ₹1,00,000 transaction → ₹2,000 platform fee → ₹1,000 referral reward
