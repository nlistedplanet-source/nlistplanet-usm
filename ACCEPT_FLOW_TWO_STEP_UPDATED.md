# ✅ Accept Button Flow - Two-Step Process (UPDATED)

## 🎯 New Flow: Buyer → Seller → RM Verification

### **STEP 1: Seller Creates Listing**
Amit creates SELL listing → Active in marketplace

---

### **STEP 2: Buyer Accepts Offer**
Priya clicks "Accept" → Deal status: `pending_seller_confirmation`

**Priya's Card Shows:**
```
╔════════════════════════════════════════╗
║  🏢 Zerodha - 100 shares               ║
║  ────────────────────────────────────  ║
║  ✅ You accepted @ ₹6,63,000/share     ║
║  💰 Total: ₹6,63,00,000                ║
║  ────────────────────────────────────  ║
║  Status: ⏳ Waiting Seller Acceptance  ║
║  Seller: @amit_trader                  ║
╚════════════════════════════════════════╝
```

---

### **STEP 3: Seller Sees Acceptance Request**

**Amit's Card Shows:**
```
╔═══════════════════════════════════════════════════════╗
║  🔔 NEW ACCEPTANCE REQUEST                            ║
║  ───────────────────────────────────────────────────  ║
║  🏢 Zerodha - 100 shares                              ║
║  👤 @priya_investor wants to buy                      ║
║  💰 Your Price: ₹6,37,000/share (fees adjusted)       ║
║  📊 Total you'll receive: ₹6,37,00,000                ║
║  ───────────────────────────────────────────────────  ║
║  [✅ Accept] [❌ Reject]                              ║
╚═══════════════════════════════════════════════════════╝
```

**Note:** Buyer pays line REMOVED as requested

---

### **STEP 4: Seller Accepts → Generates Codes**

**Both Users See Confirmed Status with Verification Codes**

**Priya's Card (Buyer):**
```
╔═══════════════════════════════════════════════════════╗
║  🎉 CONFIRMED TRANSACTION                             ║
║  ───────────────────────────────────────────────────  ║
║  🏢 Zerodha - 100 shares                              ║
║  💰 Total Amount: ₹6,63,00,000                        ║
║  👤 Seller: @amit_trader                              ║
║  ───────────────────────────────────────────────────  ║
║  📋 YOUR VERIFICATION CODES                           ║
║  ───────────────────────────────────────────────────  ║
║  🔹 Your Code: BUY-7382                               ║
║     (Share this with RM when they call)               ║
║                                                       ║
║  🔹 RM Code: ADM-2164                                 ║
║     (Ask RM for this code to verify them)             ║
║  ───────────────────────────────────────────────────  ║
║  📝 NEXT STEPS:                                       ║
║  1. Company Representative (RM) will call you         ║
║     within 24 hours                                   ║
║  2. RM will ask for your code (BUY-7382)              ║
║  3. You ask RM for their code (ADM-2164)              ║
║  4. After verification, transfer                      ║
║     ₹6,63,00,000 + STT to company account             ║
║  5. Shares will be transferred to your demat          ║
║  ───────────────────────────────────────────────────  ║
║  Status: ✅ Confirmed - Waiting RM Call               ║
╚═══════════════════════════════════════════════════════╝
```

**Amit's Card (Seller):**
```
╔═══════════════════════════════════════════════════════╗
║  ✅ CONFIRMED SALE                                    ║
║  ───────────────────────────────────────────────────  ║
║  🏢 Zerodha - 100 shares                              ║
║  💰 You'll Receive: ₹6,37,00,000                      ║
║  👤 Buyer: @priya_investor                            ║
║  ───────────────────────────────────────────────────  ║
║  📋 YOUR VERIFICATION CODES                           ║
║  ───────────────────────────────────────────────────  ║
║  🔹 Your Code: SEL-4951                               ║
║     (Share this with RM when they call)               ║
║                                                       ║
║  🔹 RM Code: ADM-2164                                 ║
║     (Ask RM for this code to verify them)             ║
║  ───────────────────────────────────────────────────  ║
║  📝 NEXT STEPS:                                       ║
║  1. Company Representative (RM) will call you         ║
║     within 24 hours                                   ║
║  2. RM will ask for your code (SEL-4951)              ║
║  3. You ask RM for their code (ADM-2164)              ║
║  4. After verification, transfer 100 shares           ║
║  5. You'll receive ₹6,37,00,000 in your account       ║
║  ───────────────────────────────────────────────────  ║
║  Status: ✅ Confirmed - Waiting RM Call               ║
╚═══════════════════════════════════════════════════════╝
```

**Changes Made:**
- ✅ "Admin" changed to "Company Representative (RM)"
- ✅ "Admin" changed to "RM" in verification steps
- ✅ Step 4: "transfer amount + STT to company account"

---

### **STEP 5: Admin Dashboard - Completed Tab**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  🎯 CONFIRMED TRANSACTIONS - PENDING COMPLETION                           ║
║  ───────────────────────────────────────────────────────────────────────  ║
║  Transaction ID: TXN-001                                                  ║
║  Company: Zerodha | Quantity: 100 shares | Amount: ₹66,30,000            ║
║  Confirmed: 10 minutes ago                                                ║
║  ───────────────────────────────────────────────────────────────────────  ║
║  👤 SELLER (Amit)                    👤 BUYER (Priya)                     ║
║  ───────────────────────────────────────────────────────────────────────  ║
║  Username: @amit_trader              Username: @priya_investor            ║
║  Name: Amit Kumar Singh              Name: Priya Sharma                   ║
║  Phone: +91 98765 43210              Phone: +91 98123 45678               ║
║  Email: amit@email.com               Email: priya@email.com               ║
║  Receives: ₹6,37,00,000              Pays: ₹6,63,00,000 + STT            ║
║                                                                           ║
║  🔑 Seller Code: SEL-4951            🔑 Buyer Code: BUY-7382              ║
║  🔑 RM Code: ADM-2164 (Your code to verify with users)                    ║
║  ───────────────────────────────────────────────────────────────────────  ║
║  📞 VERIFICATION PROCESS:                                                 ║
║  1. Call seller - Ask for SEL-4951 - Share ADM-2164                       ║
║  2. Call buyer - Ask for BUY-7382 - Share ADM-2164                        ║
║  3. Verify both identities match                                          ║
║  4. Confirm buyer transfers amount + STT to company account               ║
║  5. Confirm seller transfers shares to buyer's demat                      ║
║  ───────────────────────────────────────────────────────────────────────  ║
║  💰 Platform Fee: ₹13,00,000 (2%)                                         ║
║  ───────────────────────────────────────────────────────────────────────  ║
║  [📞 Mark Calls Complete] [✅ Mark as SOLD]                              ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Changes Made:**
- ✅ Added seller's original name (Name: Amit Kumar Singh)
- ✅ Shows both username and full name
- ✅ Updated step 4 to include "+ STT to company account"

---

### **STEP 6: RM Calls Users**

**Call 1: RM → Amit (Seller)**
```
RM:    "Hello, this is RM from NlistPlanet calling about your 
        Zerodha listing transaction."

RM:    "Can you please share your verification code?"

Amit:  "SEL-4951"

RM:    ✅ "Correct! Now please ask me for the RM code."

Amit:  "What's your RM verification code?"

RM:    "ADM-2164"

Amit:  ✅ "Verified! That's correct."

RM:    "Great! Please transfer 100 Zerodha shares to buyer's 
        demat account. Details will be sent via email."
```

**Call 2: RM → Priya (Buyer)**
```
RM:    "Hello, this is RM from NlistPlanet calling about your 
        Zerodha purchase transaction."

RM:    "Can you please share your verification code?"

Priya: "BUY-7382"

RM:    ✅ "Correct! Now please ask me for the RM code."

Priya: "What's your RM verification code?"

RM:    "ADM-2164"

Priya: ✅ "Verified! That's correct."

RM:    "Perfect! Please transfer ₹6,63,00,000 + STT to 
        company account. Bank details will be sent via email."
```

---

### **STEP 7: After Transfer, Admin Marks SOLD**

Admin clicks "✅ Mark as SOLD"

**Both Users See SOLD Stamp:**
```
╔═══════════════════════════════════════════════════════╗
║                  🎊 SOLD 🎊                           ║
║  ───────────────────────────────────────────────────  ║
║  🏢 Zerodha - 100 shares                              ║
║  💰 Amount: ₹6,63,00,000                              ║
║  ✅ Transaction Completed Successfully                ║
║  📅 Completed: 12 Dec 2025, 2:30 PM                   ║
║  ───────────────────────────────────────────────────  ║
║  [📄 Download Invoice] [⭐ Rate Experience]           ║
╚═══════════════════════════════════════════════════════╝
```

**Moves to: Listing History → Completed Tab**

---

## 🎯 Status Flow Summary

```
1. active
   ↓ (Buyer accepts)
2. pending_seller_confirmation
   ↓ (Seller accepts)
3. confirmed (codes generated)
   ↓ (RM verifies + marks sold)
4. sold
```

---

## 💾 API Endpoints

| Step | Endpoint | Who Calls | Status Change |
|------|----------|-----------|---------------|
| Buyer Accept | `PUT /listings/:id/bids/:bidId/accept` | Buyer | → `pending_seller_confirmation` |
| Seller Confirm | `PUT /listings/:id/deals/:dealId/confirm` | Seller | → `confirmed` |
| Seller Reject | `PUT /listings/:id/deals/:dealId/reject` | Seller | → `rejected_by_seller` |
| Mark Sold | `PUT /admin/deals/:id/mark-sold` | Admin/RM | → `sold` |

---

**Last Updated:** Dec 12, 2025  
**All requested changes implemented!** ✅
