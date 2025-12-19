# 🔥 Firebase Google OAuth Error Fix - Vercel Deployment

## ❌ Current Issue
```
FirebaseError: Firebase: Error (auth/api-key-not-valid, please-pass-a-valid-api-key)
```

**Reason:** Firebase environment variables missing from Vercel deployment.

---

## ✅ Solution - Add Firebase Env Vars to Vercel

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Select your project: **nlistplanet-mobile** (or desktop project)
3. Click **Settings** tab

### Step 2: Add Environment Variables
Go to **Settings → Environment Variables** and add these:

#### Mobile Frontend (nlistplanet-mobile)
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyA7jdJrLTnfOcECcmQyrZDL5iEH97zOoJ8
REACT_APP_FIREBASE_AUTH_DOMAIN=nlistplanet.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=nlistplanet
REACT_APP_FIREBASE_STORAGE_BUCKET=nlistplanet.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=630890625828
REACT_APP_FIREBASE_APP_ID=1:630890625828:web:21e2c38082dd7ac8b851b1
REACT_APP_FIREBASE_VAPID_KEY=BA1cPlr8LOVkTbtsxMV06mNMAMLwEd0Kj9LLaGGLEACgNxZcGlyzHLkHs68oZ_OucDPWM_zbzdEf7rPNbdmf-7I
```

**Important:** For each variable:
- Click **"Add New"**
- Enter **Name** (e.g., `REACT_APP_FIREBASE_API_KEY`)
- Enter **Value** (e.g., `AIzaSyA7...`)
- Select environments: **Production**, **Preview**, **Development** (all 3)
- Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Find latest deployment
3. Click **⋮** menu → **Redeploy**
4. Check "Use existing Build Cache" → Click **Redeploy**

---

## 🧪 Test After Deployment

1. Wait 2-3 minutes for deployment to complete
2. Open site: https://mobile.nlistplanet.com/register
3. Click **"Continue with Google"**
4. Google OAuth popup should open ✅

---

## 📋 Environment Variables Checklist

### Mobile Frontend (nlistplanet-mobile)
- [ ] REACT_APP_FIREBASE_API_KEY
- [ ] REACT_APP_FIREBASE_AUTH_DOMAIN
- [ ] REACT_APP_FIREBASE_PROJECT_ID
- [ ] REACT_APP_FIREBASE_STORAGE_BUCKET
- [ ] REACT_APP_FIREBASE_MESSAGING_SENDER_ID
- [ ] REACT_APP_FIREBASE_APP_ID
- [ ] REACT_APP_FIREBASE_VAPID_KEY

### Desktop Frontend (UnlistedHub-USM)
- [ ] Same as mobile (if using Google OAuth)

---

## 🔐 Security Note

These Firebase keys are **safe to expose** in frontend code because:
- Firebase has domain restrictions (only your domains can use them)
- Real security is in Firebase Security Rules (backend)
- API key is not a secret—it's meant for client-side use

---

## 🚨 If Still Not Working

**Check Firebase Console:**
1. Go to: https://console.firebase.google.com/
2. Select project: **nlistplanet**
3. Go to **Authentication → Settings → Authorized domains**
4. Add these domains if missing:
   - `localhost`
   - `mobile.nlistplanet.com`
   - `nlistplanet.com`
   - `*.vercel.app` (for preview deployments)

**Enable Google Sign-in:**
1. Firebase Console → **Authentication → Sign-in method**
2. Enable **Google** provider
3. Add authorized redirect URIs

---

## 📝 Local Development

Local `.env` files already updated with Firebase config:
- ✅ `nlistplanet-mobile/frontend/.env.development`
- ✅ `nlistplanet-mobile/frontend/.env.production`
- ✅ `UnlistedHub-USM/frontend/.env.production`

**To test locally:**
```bash
cd nlistplanet-mobile/frontend
npm start
# or
cd UnlistedHub-USM/frontend
npm start
```

Google OAuth should work immediately on localhost:3000/3001 ✅

---

## 🎯 Quick Vercel CLI Method (Alternative)

If you have Vercel CLI installed:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
cd nlistplanet-mobile/frontend
vercel link

# Add env vars
vercel env add REACT_APP_FIREBASE_API_KEY production
vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN production
vercel env add REACT_APP_FIREBASE_PROJECT_ID production
vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET production
vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID production
vercel env add REACT_APP_FIREBASE_APP_ID production
vercel env add REACT_APP_FIREBASE_VAPID_KEY production

# Redeploy
vercel --prod
```

---

## ✅ Expected Result

After fix, Console should show:
```
✅ Firebase initialized successfully
✅ Google sign-in working
```

No more `auth/api-key-not-valid` errors! 🎉
