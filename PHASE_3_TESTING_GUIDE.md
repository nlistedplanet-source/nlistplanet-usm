# 🎯 Phase 3: Core Features Testing Guide

**Testing Focus:** Listings, Bids, Offers, Negotiations, Deal Completion

---

## 📝 Pre-Requisites

**2 Test Accounts Required:**

### Account 1: Seller (@seller001)
```
Username: seller001
Email: seller001@gmail.com
Password: seller123
Full Name: Seller User
```

### Account 2: Buyer (@buyer001)
```
Username: buyer001
Email: buyer001@gmail.com
Password: buyer123
Full Name: Buyer User
```

**Setup:**
1. Register both accounts (manually or using Phase 2 tests)
2. Open 2 browser windows:
   - Window 1: Login as `seller001`
   - Window 2: Login as `buyer001` (incognito mode)

---

## 🔴 Test 3.1: Create SELL Listing

### **Seller Account (@seller001)**

**Steps:**
1. Dashboard pe jao
2. Sidebar me "Create Listing" button click karo **YA** center me big "Post New Listing" card
3. Listing Type: **SELL** select karo (red badge)
4. Company select karo dropdown se:
   - Company: **Zepto**
   - (Agar Zepto nahi hai to koi bhi verified company choose karo)
5. Details fill karo:
   ```
   Quantity: 100 shares
   Price per Share: ₹850
   ```
6. Submit/Post button click karo

**✅ Expected Results:**
- ✅ Success toast: "Listing created successfully!"
- ✅ Redirect to Dashboard
- ✅ "My Posts" tab me listing dikhe:
  ```
  🔴 SELL
  Company: Zepto
  Quantity: 100 shares
  Price: ₹850/share
  Total: ₹85,000
  Status: Active
  ```
- ✅ Green banner top pe scroll kare:
  ```
  🆕 NEW LISTING: Zepto 🔴 SELL @ ₹850
  ```
- ✅ Delete/Cancel button visible

**❌ If Failed:**
- Check console (F12) for errors
- Check backend terminal for API errors
- Verify company dropdown has verified companies

---

## 🟢 Test 3.2: Create BUY Listing

### **Buyer Account (@buyer001)**

**Steps:**
1. Same process as above
2. Listing Type: **BUY** select karo (green badge)
3. Details:
   ```
   Company: Swiggy
   Quantity: 50 shares
   Price per Share: ₹400
   ```
4. Submit

**✅ Expected Results:**
- ✅ Success toast
- ✅ "My Posts" me listing:
  ```
  🟢 BUY
  Company: Swiggy
  Quantity: 50 shares
  Price: ₹400/share
  Total: ₹20,000
  Status: Active
  ```
- ✅ Banner me dikhe: "🆕 NEW LISTING: Swiggy 🟢 BUY @ ₹400"

---

## 💰 Test 3.3: View Marketplace Listings

### **Both Accounts**

**Steps:**
1. Sidebar me "Marketplace" click karo
2. Filter check karo:
   - All Listings
   - SELL Listings only
   - BUY Listings only
3. Search box me company name type karo: "Zepto"

**✅ Expected Results:**
- ✅ Seller001 ke Zepto SELL listing dikhe
- ✅ Buyer001 ke Swiggy BUY listing dikhe
- ✅ Filters kaam kare (SELL/BUY toggle)
- ✅ Search box se filter ho
- ✅ Card me details:
  ```
  Posted by: @seller001 (for Zepto listing)
  Company logo visible
  Price, Quantity, Total amount
  "Place Bid" button (agar tumhara listing nahi hai)
  ```
- ✅ Apna khud ka listing me "Place Bid" button NAHI dikhe (can't bid on own listing)

---

## 📩 Test 3.4: Place Bid (Buyer on Seller's SELL listing)

### **Buyer Account (@buyer001)**

**Steps:**
1. Marketplace me Seller001 ka Zepto SELL listing find karo
2. "Place Bid" button click karo
3. Modal open hoga, fill karo:
   ```
   Quantity: 50 shares (listing me 100 hai, so <= 100)
   Your Bid Price: ₹840/share (seller ki price ₹850 se kam offer kar rahe)
   ```
4. Calculate dekho:
   ```
   Subtotal: 50 × ₹840 = ₹42,000
   Platform Fee (2%): ₹840 (hidden from user, added internally)
   You'll Pay: ₹42,840 (actual amount buyer pays)
   ```
5. "Submit Bid" click karo

**✅ Expected Results:**
- ✅ Success toast: "Bid placed successfully!"
- ✅ Modal close ho
- ✅ "My Bids" tab me bid dikhe:
  ```
  Company: Zepto
  Type: BID on SELL listing
  Quantity: 50 shares
  Your Offer: ₹840/share
  Status: Pending (yellow badge)
  Counter Offers: 0/4
  ```
- ✅ Notification bell pe red dot (1 new notification)

### **Seller Account (@seller001) - Automatic**

**Check:**
1. Notification bell click karo
2. **Expected:**
   ```
   🔔 New Bid Received
   @buyer001 bid ₹840/share for 50 shares on your Zepto listing
   Time: Just now
   Actions: [Accept] [Counter Offer] [Reject]
   ```
3. Push notification bhi aana chahiye (agar FCM enabled hai)

---

## 🔄 Test 3.5: Counter Offer (Round 1)

### **Seller Account (@seller001)**

**Steps:**
1. Notification me "Counter Offer" button click karo
2. Modal open hoga:
   ```
   Buyer's Offer: ₹840/share
   Counter Rounds Used: 0/4
   ```
3. Enter your counter:
   ```
   Your Counter Price: ₹845/share
   Message (optional): "Can you do ₹845? Final price"
   ```
4. Submit

**✅ Expected Results:**
- ✅ Success toast: "Counter offer sent!"
- ✅ Notification me bid status update:
  ```
  Status: Countered (1/4)
  Your Counter: ₹845/share
  ```

### **Buyer Account (@buyer001) - Automatic**

**Check:**
1. Notification bell (red dot)
2. **Expected:**
   ```
   🔔 Counter Offer Received
   @seller001 countered at ₹845/share for Zepto
   Original: ₹840 → Counter: ₹845
   Round: 1/4
   Actions: [Accept] [Counter Back] [Reject]
   ```

---

## 🔄 Test 3.6: Counter Offer (Round 2)

### **Buyer Account (@buyer001)**

**Steps:**
1. Notification me "Counter Back" click karo
2. Enter:
   ```
   Your Counter: ₹842/share
   ```
3. Submit

**✅ Expected:**
- ✅ Status: Countered (2/4)
- ✅ Seller ko notification mile

---

## 🔄 Test 3.7: Counter Offer (Round 3 & 4)

**Continue:**
- Round 3: Seller counters ₹844
- Round 4: Buyer counters ₹843

**✅ Expected:**
- ✅ Round counter increment ho: 3/4, then 4/4
- ✅ After 4 rounds, "Counter Offer" button disable ho ya warning dikhe:
  ```
  ⚠️ Maximum 4 counter rounds reached. Accept or Reject only.
  ```

---

## ✅ Test 3.8: Accept Bid/Offer

### **Seller Account (@seller001)**

**Steps:**
1. Latest notification me (Round 4 ke baad)
2. "Accept" button click karo
3. Confirmation modal:
   ```
   Are you sure you want to accept this bid?
   Final Price: ₹843/share
   Quantity: 50 shares
   Total: ₹42,150
   
   [Cancel] [Confirm Accept]
   ```
4. "Confirm Accept" click karo

**✅ Expected Results:**
- ✅ Success toast: "Bid accepted! Confirmation code generated."
- ✅ Notification me unique 6-digit code dikhe:
  ```
  ✅ Deal Pending Confirmation
  Your Code: 123456
  Share this code with @buyer001
  
  Status: Pending Confirmation (both parties must confirm)
  ```
- ✅ "My Posts" me listing status:
  ```
  Status: Negotiating (orange badge)
  ```

### **Buyer Account (@buyer001) - Automatic**

**Check:**
1. Notification:
   ```
   ✅ Your Bid Accepted!
   @seller001 accepted your bid at ₹843/share
   Your Code: 654321
   Share this code with @seller001
   
   Status: Pending Confirmation
   ```

---

## 🔐 Test 3.9: Confirm Deal (Both Parties)

### **Step 1: Buyer Confirms First**

**Buyer Account (@buyer001):**
1. Notification me "Enter Seller's Code" field dikhe
2. Enter seller's code: `123456` (jo seller ko mila)
3. "Confirm Deal" button click karo

**✅ Expected:**
- ✅ Success toast: "Your confirmation recorded. Waiting for seller confirmation."
- ✅ Status update: 
  ```
  Status: Pending Seller Confirmation (buyer confirmed ✅)
  ```

### **Step 2: Seller Confirms**

**Seller Account (@seller001):**
1. Enter buyer's code: `654321`
2. "Confirm Deal" click karo

**✅ Expected Results (Both Accounts):**
- ✅ Success toast: "Deal confirmed! Admin will complete the transaction."
- ✅ Notification:
  ```
  🎉 Deal Confirmed!
  Both parties confirmed the deal.
  Admin will now complete the offline transaction.
  
  Deal Summary:
  Company: Zepto
  Quantity: 50 shares
  Final Price: ₹843/share
  Total: ₹42,150
  Buyer: @buyer001
  Seller: @seller001
  
  Status: Confirmed (waiting for admin)
  ```
- ✅ "My Posts" (seller):
  ```
  Status: Deal Pending (blue badge)
  ```
- ✅ "My Bids" (buyer):
  ```
  Status: Confirmed (green badge)
  ```
- ✅ Listing ab marketplace se gayab ho jaye (not visible to others)

---

## ❌ Test 3.10: Reject Bid

### **Setup New Test:**
1. Seller creates new SELL listing (Zepto, 100 shares @ ₹850)
2. Buyer places bid (₹840/share)

### **Seller Account:**

**Steps:**
1. Notification me new bid dikhe
2. "Reject" button click karo
3. Confirmation:
   ```
   Are you sure you want to reject this bid?
   [Cancel] [Reject Bid]
   ```
4. Confirm

**✅ Expected Results:**
- ✅ Success toast: "Bid rejected"
- ✅ Bid status:
  ```
  Status: Rejected (red badge)
  ```
- ✅ Buyer ko notification:
  ```
  ❌ Bid Rejected
  @seller001 rejected your bid on Zepto listing
  ```
- ✅ Listing remains Active in marketplace (others can still bid)

---

## 🗑️ Test 3.11: Cancel Listing

### **Seller Account (@seller001)**

**Steps:**
1. "My Posts" tab me active listing find karo
2. "Cancel" ya "Delete" button click karo
3. Confirmation modal:
   ```
   Cancel this listing?
   All pending bids will be automatically rejected.
   [Keep] [Cancel Listing]
   ```
4. Confirm

**✅ Expected Results:**
- ✅ Success toast: "Listing cancelled"
- ✅ Listing gayab ho "My Posts" se
- ✅ Marketplace se bhi remove ho
- ✅ Agar pending bids the, unko notifications mile:
  ```
  ℹ️ Listing Cancelled
  @seller001 cancelled the Zepto listing you bid on.
  Your bid status: Cancelled
  ```

---

## 📊 Test 3.12: History Tab Check

### **Both Accounts**

**Steps:**
1. Dashboard sidebar → "History" tab click karo
2. Check all completed/cancelled deals

**✅ Expected Display:**
- ✅ Confirmed deal dikhe (Zepto 50 shares @ ₹843)
- ✅ Details:
  ```
  Date: [Today's date]
  Company: Zepto
  Quantity: 50 shares
  Price: ₹843/share
  Total: ₹42,150
  Counterparty: @buyer001 (for seller) / @seller001 (for buyer)
  Status: Completed by Admin (agar admin ne complete kiya) / Confirmed (agar pending)
  ```
- ✅ Rejected/Cancelled bids bhi dikhe with timestamps

---

## 🔢 Test 3.13: Platform Fee Calculation

### **Hidden Fee Test (CRITICAL)**

**Important:** Users ko fee percentage NAHI dikhna chahiye, sirf net price.

### **Test for SELL Listing:**

**Seller Posts:**
```
Company: Zepto
Quantity: 100 shares
Price: ₹850/share
```

**Buyer Bids:**
```
Quantity: 100 shares
Bid Price: ₹850/share (accepts seller's price)
```

**Expected Fee Calculation (BACKEND):**
```
Buyer Pays: ₹850 × 100 = ₹85,000
Platform Fee (2%): ₹85,000 × 0.02 = ₹1,700 (charged to buyer on SELL)
Buyer Total: ₹85,000 + ₹1,700 = ₹86,700

Seller Receives: ₹85,000 (exact amount)
```

**UI Display (User Should See):**
- Seller sees: "You'll receive ₹85,000"
- Buyer sees: "You'll pay ₹86,700" (fee included, but NOT shown separately)
- **NO mention of "2%" anywhere**

### **Test for BUY Listing:**

**Buyer Posts:**
```
Company: Swiggy
Quantity: 50 shares
Price: ₹400/share
```

**Seller Accepts:**

**Expected Fee Calculation:**
```
Buyer Pays: ₹400 × 50 = ₹20,000 (exact amount)
Seller Receives: ₹20,000 - (₹20,000 × 0.02) = ₹19,600
Platform Fee (2%): ₹400 (charged to seller on BUY)
```

**UI Display:**
- Buyer sees: "You'll pay ₹20,000"
- Seller sees: "You'll receive ₹19,600" (fee deducted, but NOT shown separately)

**❌ FAIL if:**
- UI me "2%" ya "Platform Fee: ₹1700" explicitly dikhe
- Prices mismatch ho (buyer/seller ko wrong amounts dikhe)

---

## 🎯 Phase 3 Testing Checklist

```
[ ] 3.1: Create SELL Listing - PASS/FAIL
[ ] 3.2: Create BUY Listing - PASS/FAIL
[ ] 3.3: View Marketplace - PASS/FAIL
[ ] 3.4: Place Bid - PASS/FAIL
[ ] 3.5: Counter Offer Round 1 - PASS/FAIL
[ ] 3.6: Counter Offer Round 2 - PASS/FAIL
[ ] 3.7: Counter Offer Rounds 3-4 - PASS/FAIL
[ ] 3.8: Accept Bid - PASS/FAIL
[ ] 3.9: Confirm Deal (Both Parties) - PASS/FAIL
[ ] 3.10: Reject Bid - PASS/FAIL
[ ] 3.11: Cancel Listing - PASS/FAIL
[ ] 3.12: History Tab - PASS/FAIL
[ ] 3.13: Platform Fee Hidden - PASS/FAIL
```

---

## 🐛 Common Issues to Watch For

### Issue 1: Bid Not Appearing
**Symptoms:** Bid submit hoti hai but "My Bids" me nahi dikhti
**Check:**
- Console errors (F12)
- Backend terminal logs
- API response status (Network tab)

### Issue 2: Notifications Not Working
**Symptoms:** Seller ko bid notification nahi aati
**Check:**
- Notification bell icon pe red dot hai ya nahi
- Notification API call successful (Network tab)
- Backend route `/api/notifications` working

### Issue 3: Counter Offer Limit Not Enforced
**Symptoms:** 4 rounds ke baad bhi counter offer ho jate hain
**Check:**
- Backend validation (`models/Listing.js` - bidSchema)
- Frontend UI disabled state

### Issue 4: Confirmation Codes Not Generated
**Symptoms:** Accept karne ke baad codes nahi dikhte
**Check:**
- Backend response me codes hain (`sellerConfirmCode`, `buyerConfirmCode`)
- Frontend properly display kar raha

### Issue 5: Fee Calculation Wrong
**Symptoms:** Buyer/Seller ko wrong amounts dikhe
**Check:**
- `utils/helpers.js` - `getNetPriceForUser()` function
- Backend `models/Listing.js` - bidSchema me fee calculation
- Console.log kar ke actual calculations dekho

---

## 📝 Testing Notes Template

**Date:** _______  
**Tester:** _______

**Test Results:**

| Test ID | Test Name | Status | Notes | Screenshot |
|---------|-----------|--------|-------|------------|
| 3.1 | Create SELL | PASS/FAIL | | |
| 3.2 | Create BUY | PASS/FAIL | | |
| 3.3 | Marketplace View | PASS/FAIL | | |
| 3.4 | Place Bid | PASS/FAIL | | |
| 3.5-3.7 | Counter Offers | PASS/FAIL | | |
| 3.8 | Accept Bid | PASS/FAIL | | |
| 3.9 | Confirm Deal | PASS/FAIL | | |
| 3.10 | Reject Bid | PASS/FAIL | | |
| 3.11 | Cancel Listing | PASS/FAIL | | |
| 3.12 | History Tab | PASS/FAIL | | |
| 3.13 | Fee Hidden | PASS/FAIL | | |

**Critical Bugs Found:** _______

**Overall Phase 3 Status:** PASS / FAIL / PARTIAL

---

## ✅ Success Criteria

Phase 3 passes if:
- ✅ All 13 tests PASS
- ✅ No console errors during any operation
- ✅ Notifications work properly
- ✅ Fee calculation accurate (hidden from users)
- ✅ Deal workflow complete (bid → counter → accept → confirm)
- ✅ UI responsive and toast messages clear

**Good luck testing! 🚀**
