# 🧪 NListPlanet Platform Testing Plan

**Date:** December 23, 2025  
**Platform:** Desktop (React 18) + Mobile PWA (React 19)  
**Backend:** Express + MongoDB

---

## 📋 Testing Checklist Overview

### Phase 1: Environment Setup & Validation ✅
### Phase 2: Authentication & User Management 👤
### Phase 3: Core Features Testing 🎯
### Phase 4: Admin Panel Testing 🛡️
### Phase 5: UI/UX & Responsiveness 📱
### Phase 6: Security & Performance 🔒
### Phase 7: Edge Cases & Error Handling ⚠️
### Phase 8: Production Deployment Verification 🚀

---

## Phase 1: Environment Setup & Validation ✅

### 1.1 Backend Health Check
```bash
cd UnlistedHub-USM/backend
node scripts/validateEnv.js
```
**Expected:**
- ✅ All environment variables present
- ✅ JWT_SECRET >= 32 characters
- ✅ MONGODB_URI valid
- ✅ FIREBASE_SERVICE_ACCOUNT parsed correctly

### 1.2 API Health Test
```bash
node scripts/quickTest.js
```
**Expected:**
- ✅ All 8 endpoints responding
- ✅ CORS headers correct
- ✅ Rate limiting working
- ✅ No 500 errors

### 1.3 Database Connection
```bash
node scripts/checkDatabase.js
```
**Expected:**
- ✅ MongoDB connected
- ✅ All collections present
- ✅ Indexes created

### 1.4 Build Verification
**Desktop:**
```bash
cd UnlistedHub-USM/frontend
npm run build
```
**Mobile:**
```bash
cd nlistplanet-mobile/frontend
npm run build
```
**Expected:**
- ✅ No compilation errors
- ✅ Build size < 300KB (gzipped)
- ✅ All assets bundled

---

## Phase 2: Authentication & User Management 👤

### 2.1 User Registration (Desktop)
**Test Cases:**

| Test | Steps | Expected Result |
|------|-------|----------------|
| Valid Registration | 1. Open `/register`<br>2. Fill: username, email, password, fullName<br>3. Submit | ✅ Success toast<br>✅ Redirect to dashboard<br>✅ JWT token in localStorage |
| Duplicate Username | 1. Register with existing username | ❌ Error: "Username already exists" |
| Weak Password | 1. Use password < 6 chars | ❌ Validation error |
| Invalid Email | 1. Use malformed email | ❌ Email validation error |
| Referral Code | 1. Register with valid referral code<br>2. Check referrer's count | ✅ Referral tracked<br>✅ Counter incremented |

### 2.2 User Login (Desktop + Mobile)
**Test Cases:**

| Test | Steps | Expected Result |
|------|-------|----------------|
| Valid Login | 1. Open `/login`<br>2. Enter credentials<br>3. Submit | ✅ Redirect to dashboard<br>✅ User data loaded<br>✅ Token stored |
| Invalid Password | 1. Wrong password | ❌ Error: "Invalid credentials" |
| Non-existent User | 1. Unknown username | ❌ Error: "User not found" |
| Banned User | 1. Login as banned user | ❌ Error: "Account suspended" |

### 2.3 Auto-Logout
**Test:**
1. Login successfully
2. Manually expire/corrupt token in localStorage
3. Make any API call
4. **Expected:** ✅ Auto-logout, redirect to `/login`

### 2.4 Profile Management
**Test Cases:**

| Test | Steps | Expected Result |
|------|-------|----------------|
| View Profile | Desktop: Click profile in sidebar<br>Mobile: Navigate to Profile tab | ✅ Display: username, email, fullName, joinDate, KYC status |
| Update Profile | 1. Click Edit<br>2. Change fullName<br>3. Save | ✅ Success toast<br>✅ Updated display |
| Change Password | 1. Enter old password<br>2. Enter new password<br>3. Submit | ✅ Password updated<br>✅ Re-login required |

---

## Phase 3: Core Features Testing 🎯

### 3.1 Create Listing (SELL)
**Desktop:**
1. Dashboard → Click "Create Listing" in sidebar
2. Select **SELL**
3. Choose company: **Zepto**
4. Quantity: **100**
5. Price per share: **₹850**
6. Submit

**Mobile:**
1. Bottom nav → Click **Post** (center button with +)
2. Follow same steps

**Expected Results:**
- ✅ Listing appears in "My Posts"
- ✅ Shows in Marketplace (for other users)
- ✅ Status: **Active**
- ✅ Banner shows "NEW LISTING: Zepto 🔴 SELL @ ₹850"

### 3.2 Create Listing (BUY)
**Same as above, select BUY type**

**Expected:**
- ✅ Shows "🟢 BUY" badge
- ✅ Correct buyer/seller logic

### 3.3 Place Bid (on SELL listing)
**As Buyer:**
1. Go to Marketplace
2. Find a SELL listing
3. Click "Place Bid"
4. Enter quantity: **50** (less than or equal to listing quantity)
5. Enter bid price: **₹840** (your offer)
6. Submit

**Expected:**
- ✅ Bid sent notification to seller
- ✅ Bid shows in "My Bids" tab
- ✅ Status: **Pending**
- ✅ Push notification to seller (if FCM enabled)

### 3.4 Counter Offer (Max 4 rounds)
**As Seller:**
1. Go to Notifications
2. See "New Bid Received"
3. Click "Counter Offer"
4. Enter new price: **₹845**
5. Submit

**Expected:**
- ✅ Bid status: **Countered**
- ✅ Counter count: 1/4
- ✅ Notification to buyer
- ✅ Buyer can accept or counter again

**Test Full Negotiation:**
- Round 1: Buyer bids ₹840 → Seller counters ₹845
- Round 2: Buyer counters ₹842 → Seller counters ₹844
- Round 3: Buyer counters ₹843 → Seller accepts
- **Expected:** ✅ Both parties get confirmation codes

### 3.5 Accept Bid/Offer
**Test:**
1. Seller accepts buyer's bid
2. **Expected:**
   - ✅ Status: **Pending Confirmation**
   - ✅ Both receive unique 6-digit codes
   - ✅ Codes displayed in Notifications
   - ✅ Can't accept other bids on same listing

### 3.6 Confirm Deal (Both Parties)
**Test:**
1. Buyer enters seller's code
2. Seller enters buyer's code
3. Both confirm

**Expected:**
- ✅ Deal status: **Confirmed**
- ✅ Listing removed from marketplace
- ✅ Moves to "History" tab
- ✅ Admin sees in "Final Deals" panel
- ✅ Success notifications sent

### 3.7 Reject Bid/Offer
**Test:**
1. Seller clicks "Reject" on bid
2. **Expected:**
   - ✅ Bid status: **Rejected**
   - ✅ Buyer notified
   - ✅ Listing remains active

### 3.8 Cancel Listing
**Test:**
1. Go to "My Posts"
2. Click "Cancel" on active listing
3. Confirm

**Expected:**
- ✅ Listing removed from marketplace
- ✅ All pending bids auto-rejected
- ✅ Notification sent to bidders

---

## Phase 4: Admin Panel Testing 🛡️

### 4.1 Admin Login
**Test:**
```bash
# Create admin account first
node scripts/createAdmin.js
```
**Username:** admin  
**Password:** (set during script)

**Login & Expected:**
- ✅ Sidebar shows "Admin" badge
- ✅ Admin/User toggle visible
- ✅ Access to Admin Panel tabs

### 4.2 User Management
**Test Cases:**

| Action | Steps | Expected |
|--------|-------|----------|
| View Users | Admin Panel → Users | ✅ List all users<br>✅ Search, filter working |
| Ban User | Click Ban on user → Confirm | ✅ User banned<br>✅ Auto-logout on next request |
| Unban User | Click Unban | ✅ User can login again |
| View as User | Click "View Dashboard" | ✅ See user's exact view<br>✅ Yellow banner showing |
| Promote to Admin | Click Make Admin | ✅ User gets admin role |

### 4.3 Listings Management
**Test:**
1. Admin Panel → Listings
2. **Expected:**
   - ✅ See ALL listings (all users)
   - ✅ Filter by status, type, user
   - ✅ Delete listing option
   - ✅ Mark as sold/cancelled

### 4.4 Transactions Management
**Test:**
1. Admin Panel → Transactions
2. **Expected:**
   - ✅ All completed deals
   - ✅ Buyer, seller details
   - ✅ Amount, quantity
   - ✅ Timestamps

### 4.5 Final Deals (Admin Completion)
**Test:**
1. Admin Panel → Final Deals
2. See deal with status "Confirmed"
3. Click "Mark as Completed"
4. Enter offline transaction details
5. Submit

**Expected:**
- ✅ Deal status: **Completed**
- ✅ Moves to transaction history
- ✅ Both parties notified

### 4.6 Company Management
**Test Cases:**

| Action | Steps | Expected |
|--------|-------|----------|
| Add Company | Click Add → Fill details → Submit | ✅ Company added<br>✅ Visible in dropdown |
| Edit Company | Click Edit → Update logo/details | ✅ Changes saved |
| Verify Company | Click Verify | ✅ Status: Verified<br>✅ Shows in marketplace |
| Delete Company | Click Delete (if no listings) | ✅ Company removed |

### 4.7 News Management
**Test:**
1. Admin Panel → News/Blog
2. Click "Add News"
3. Fill: title, content, category
4. Upload image (optional)
5. Publish

**Expected:**
- ✅ News visible on homepage
- ✅ Auto-categorized (if AI enabled)
- ✅ Hindi translation available (if OpenAI configured)

### 4.8 Platform Settings
**Test:**
1. Admin Panel → Settings
2. Update platform fee: **2%** → **2.5%**
3. Save

**Expected:**
- ✅ New fee applied to future listings
- ✅ Old listings unaffected

---

## Phase 5: UI/UX & Responsiveness 📱

### 5.1 Desktop Responsiveness
**Test Breakpoints:**
- **1920x1080** (Full HD)
- **1366x768** (Laptop)
- **1024x768** (Tablet landscape)

**Check:**
- ✅ Sidebar visible on all sizes
- ✅ Cards don't overflow
- ✅ Modals centered
- ✅ Tables scrollable

### 5.2 Mobile Responsiveness (PWA)
**Test on:**
- iPhone 12/13 (390x844)
- Samsung Galaxy S21 (360x800)
- iPad (768x1024)

**Check:**
- ✅ Bottom nav visible (not hidden)
- ✅ Tap targets ≥ 44px
- ✅ Text readable (≥16px)
- ✅ No horizontal scroll
- ✅ Safe area respected (notch/home indicator)

### 5.3 Dark Mode (Mobile)
**Test:**
1. Mobile → Profile → Settings
2. Toggle dark mode

**Expected:**
- ✅ All components switch to dark theme
- ✅ Text remains readable
- ✅ Contrast ratio >4.5:1

### 5.4 Modern UI Components
**Desktop - Test All Classes:**
- `.btn-modern` (primary, secondary, outline)
- `.card-modern` (hover effects)
- `.input-modern` (focus states)
- `.badge-modern` (success, warning, danger)
- `.modal-modern` (animations)

**Mobile - Test Touch:**
- `.btn-modern-mobile` (44px min tap)
- `.card-modern-mobile` (touch feedback)
- `.bottom-sheet-modern` (swipe handle)
- `.fab-mobile` (floating action button)

---

## Phase 6: Security & Performance 🔒

### 6.1 Authentication Security
**Test Cases:**

| Attack | Test | Expected Defense |
|--------|------|------------------|
| JWT Tampering | Modify token in localStorage | ❌ 401 Unauthorized<br>✅ Auto-logout |
| Expired Token | Wait 24h or manually expire | ❌ 401 Unauthorized<br>✅ Re-login required |
| Missing Token | Remove from localStorage | ❌ Redirect to login |
| SQL Injection | Username: `admin' OR '1'='1` | ✅ Sanitized by mongo-sanitize |
| XSS Attack | Input: `<script>alert('xss')</script>` | ✅ Escaped by xss-clean |

### 6.2 Rate Limiting
**Test:**
```bash
# Send 100 requests rapidly
for ($i=1; $i -le 100; $i++) {
  curl http://localhost:5000/api/health
}
```
**Expected:**
- ✅ First 100 succeed
- ✅ After 100: 429 Too Many Requests
- ✅ Retry after 15 minutes

### 6.3 CORS Protection
**Test:**
```bash
curl -H "Origin: http://evil.com" http://localhost:5000/api/health
```
**Expected:**
- ❌ CORS error
- ✅ Only allowed origins pass

### 6.4 Input Validation
**Test Cases:**

| Field | Invalid Input | Expected |
|-------|---------------|----------|
| Email | `notanemail` | ❌ Validation error |
| Password | `12345` (too short) | ❌ Min 6 chars required |
| Price | `-100` (negative) | ❌ Must be positive |
| Quantity | `0` | ❌ Must be ≥ 1 |
| Username | `user@123` (special chars) | ❌ Alphanumeric only |

### 6.5 Performance Benchmarks
**Test with Lighthouse (Chrome DevTools):**

**Desktop Targets:**
- Performance: **≥ 90**
- Accessibility: **≥ 90**
- Best Practices: **≥ 90**
- SEO: **≥ 80**

**Mobile PWA Targets:**
- Performance: **≥ 85**
- PWA: **✅ Installable**
- Offline: **✅ Service worker active**

**Backend Response Times:**
```bash
# Test API latency
node scripts/quickTest.js
```
**Expected:** All endpoints < 200ms

---

## Phase 7: Edge Cases & Error Handling ⚠️

### 7.1 Network Failures
**Test:**
1. Disable internet mid-action
2. Try to create listing

**Expected:**
- ✅ Error toast: "Network error"
- ✅ No data corruption
- ✅ Retry option available

### 7.2 Concurrent Actions
**Test:**
1. Open 2 browser tabs
2. Tab 1: Accept bid
3. Tab 2: Try to accept same bid

**Expected:**
- ✅ Tab 2 gets error: "Bid already accepted"
- ✅ No duplicate confirmations

### 7.3 Empty States
**Test:**
- Dashboard with 0 listings
- Marketplace with 0 active listings
- Notifications with 0 unread

**Expected:**
- ✅ Empty state message shown
- ✅ Call-to-action button
- ✅ No blank screens

### 7.4 Large Data Sets
**Test:**
```bash
# Create 1000 test listings
node scripts/generateTestData.js
```
**Expected:**
- ✅ Pagination working
- ✅ No lag in UI
- ✅ Search/filter responsive

### 7.5 Image Upload Failures
**Test:**
1. Upload 10MB+ image (exceeds limit)
2. Upload invalid file type

**Expected:**
- ❌ Error: "File too large" (if limit exceeded)
- ❌ Error: "Invalid file type" (if not image)
- ✅ Clear error messages

---

## Phase 8: Production Deployment Verification 🚀

### 8.1 Vercel Deployment (Frontend)
**Desktop:**
1. Push to `main` branch (nlistplanet-usm repo)
2. Check Vercel dashboard
3. Wait for build completion
4. Visit: https://nlistplanet.vercel.app

**Mobile:**
1. Push to `main` branch (nlistplanet-mobile repo)
2. Check Vercel dashboard
3. Wait for build completion
4. Visit: https://nlistplanet-mobile.vercel.app

**Expected:**
- ✅ Build successful (green checkmark)
- ✅ No 404 errors
- ✅ All assets loaded
- ✅ API calls working (to Render backend)

### 8.2 Render Deployment (Backend)
**Check:**
1. Render dashboard → nlistplanet-backend
2. Status: **Live**
3. Last deploy: Recent
4. Logs: No critical errors

**Test Health:**
```bash
curl https://nlistplanet-backend.onrender.com/api/health
```
**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-23T...",
  "newsScheduler": "running"
}
```

### 8.3 Environment Variables (Production)
**Verify on Render:**
- ✅ `MONGODB_URI` - production database
- ✅ `JWT_SECRET` - secure 32+ chars
- ✅ `CORS_ORIGINS` - includes Vercel URLs
- ✅ `FRONTEND_URL` - points to Vercel
- ✅ `FIREBASE_SERVICE_ACCOUNT` - valid JSON
- ✅ `OPENAI_API_KEY` - (optional but recommended)

### 8.4 SSL & Security Headers
**Test:**
```bash
curl -I https://nlistplanet.vercel.app
```
**Expected Headers:**
- ✅ `Strict-Transport-Security: max-age=31536000`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `Content-Security-Policy: ...`

### 8.5 PWA Installation (Mobile)
**Test on Mobile:**
1. Visit mobile URL in Chrome/Safari
2. Look for "Add to Home Screen" prompt
3. Install

**Expected:**
- ✅ Icon appears on home screen
- ✅ Opens in standalone mode (no browser chrome)
- ✅ Splash screen shows
- ✅ Works offline (cached pages)

### 8.6 Push Notifications (Production)
**Test:**
```bash
# From backend server
node test-push-notification.js <username>
```
**Expected:**
- ✅ Notification arrives on desktop (if browser allows)
- ✅ Notification arrives on mobile (if installed)
- ✅ Click opens relevant page

---

## 🎯 Critical Path Testing (Smoke Test)

**Run this quick test after each deployment:**

### Desktop Flow (5 mins)
1. ✅ Register new user → Success
2. ✅ Create SELL listing → Appears in marketplace
3. ✅ Login as different user → See listing
4. ✅ Place bid → Seller gets notification
5. ✅ Seller accepts → Both get confirmation codes
6. ✅ Logout → Auto-clears token

### Mobile Flow (5 mins)
1. ✅ Login → Bottom nav visible
2. ✅ Click Post → Create listing
3. ✅ Go to Activity → See notifications
4. ✅ Profile → Settings accessible
5. ✅ Send Query → Admin gets notification

### Admin Flow (3 mins)
1. ✅ Login as admin → Toggle visible
2. ✅ Switch to Admin mode → See admin tabs
3. ✅ Users → Ban/unban works
4. ✅ Listings → See all users' listings

---

## 📊 Testing Metrics & Success Criteria

### Acceptance Criteria
| Category | Metric | Target | Status |
|----------|--------|--------|--------|
| **API Uptime** | 99.9% availability | ✅ Pass | [ ] |
| **Response Time** | <200ms avg | ✅ Pass | [ ] |
| **Build Success** | 100% deployments | ✅ Pass | [ ] |
| **Error Rate** | <0.1% | ✅ Pass | [ ] |
| **Lighthouse Score** | ≥85 mobile, ≥90 desktop | ✅ Pass | [ ] |
| **Security Headers** | All present | ✅ Pass | [ ] |
| **CORS** | Only allowed origins | ✅ Pass | [ ] |
| **Authentication** | 0 bypass attempts | ✅ Pass | [ ] |

---

## 🐛 Bug Tracking Template

**When you find a bug, document:**

```markdown
### Bug #001: [Title]
**Severity:** Critical / High / Medium / Low
**Environment:** Desktop / Mobile / Backend
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** 
**Actual:** 
**Screenshot:** (if applicable)
**Fix Priority:** Immediate / Next Release / Backlog
```

---

## ✅ Final Checklist Before Production

- [ ] All Phase 1-8 tests passed
- [ ] No critical bugs open
- [ ] Environment variables verified
- [ ] SSL certificates valid
- [ ] Backup strategy in place
- [ ] Monitoring set up (Render logs, Vercel analytics)
- [ ] Support email/phone number configured
- [ ] Privacy policy & terms updated
- [ ] Admin account credentials secured
- [ ] Database backup scheduled

---

## 🚀 Ready to Launch!

**Once all tests pass, you can confidently deploy to production.**

**Support:** If any test fails, check logs:
- Backend: Render dashboard → Logs
- Frontend: Browser DevTools → Console
- Database: MongoDB Atlas → Monitoring

**Happy Testing! 🎉**
