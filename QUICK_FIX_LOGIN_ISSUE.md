# 🚨 Quick Fix: Mobile Login CORS Error

## Problem:
Mobile app login fail ho raha hai CORS error ke karan.

## Root Cause:
Render pe `CORS_ORIGINS` update kiya but **service restart nahi hua**.

---

## ✅ Solution (2 Minutes):

### Step 1: Render Service Restart
1. **Render Dashboard** kholo: https://dashboard.render.com/
2. **nlistplanet-usm** service select karo
3. Top-right corner mein **"Manual Deploy"** dropdown click karo
4. **"Clear build cache & deploy"** select karo (recommended)
   - Ya simply **"Deploy latest commit"**
5. **Wait 2-3 minutes** for deployment to complete
6. Status "Live" hone tak wait karo

### Step 2: Verify (Mobile App)
1. Mobile app refresh karo (hard refresh: Ctrl + Shift + R)
2. Login try karo
3. Console check karo (F12):
   ```
   🌐 API Base URL: https://nlistplanet-usm-api.onrender.com/api
   ```
4. CORS error nahi aana chahiye

---

## 🔍 Still Not Working?

### Check Console Logs:
Browser console mein check karo:

**Expected (Correct):**
```
🌐 API Base URL: https://nlistplanet-usm-api.onrender.com/api
🔧 Environment: production
[CORS] ✅ Allowed origin: https://mobile.nlistplanet.com
```

**If Wrong:**
```
🌐 API Base URL: http://localhost:5000/api
```
→ Matlab Vercel pe environment variables set nahi hain

---

## 🎯 Backend Logs Check (Render):

Render dashboard mein:
1. **Logs** tab kholo
2. Login attempt ke time pe ye log dikhna chahiye:
   ```
   [CORS] ✅ Allowed origin: https://mobile.nlistplanet.com
   ```

Agar ye dikha:
```
[CORS] ❌ Blocked origin: https://mobile.nlistplanet.com
```
→ Matlab `CORS_ORIGINS` env var properly save nahi hua

---

## ⚡ Emergency Fix:

Agar 5 minutes baad bhi nahi chala:

1. Render pe **Environment** variables pe jao
2. `CORS_ORIGINS` ko **Delete** karo
3. **Save**
4. Service restart hogi
5. Phir se `CORS_ORIGINS` add karo with value:
   ```
   https://nlistplanet.com,https://www.nlistplanet.com,https://mobile.nlistplanet.com
   ```
6. **Save** aur wait for restart

---

## 📝 Verification Checklist:

- [ ] Render service "Live" status dikha raha hai
- [ ] Mobile app console mein correct API URL show ho raha hai
- [ ] Login attempt pe CORS error nahi aa raha
- [ ] Backend logs mein "Allowed origin" dikha raha hai

✅ All checked? Login should work now!
