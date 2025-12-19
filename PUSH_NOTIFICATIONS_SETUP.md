# 🔔 Push Notifications - Installation & Setup Guide

## ✅ Backend Complete (100%)
Backend FCM integration is fully done. Ab sirf frontend setup karna hai.

---

## 📦 Step 1: Install Firebase SDK

### Desktop (UnlistedHub-USM/frontend)
```powershell
cd UnlistedHub-USM/frontend
npm install firebase
```

### Mobile (nlistplanet-mobile/frontend)
```powershell
cd nlistplanet-mobile/frontend
npm install firebase
```

---

## 🔥 Step 2: Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create New Project**:
   - Name: `UnlistedHub` (or `NListPlanet`)
   - Disable Google Analytics (optional)
   - Click "Create Project"

3. **Enable Cloud Messaging**:
   - Go to Project Settings → Cloud Messaging
   - Enable Cloud Messaging API (if prompted)

---

## 🔑 Step 3: Get Firebase Credentials

### 3.1 Web App Configuration
1. Click **"Add app"** → Select **Web (</> icon)**
2. Register app: "UnlistedHub Web"
3. Copy the `firebaseConfig` object:
```javascript
{
  apiKey: "AIza...",
  authDomain: "unlistedhub.firebaseapp.com",
  projectId: "unlistedhub",
  storageBucket: "unlistedhub.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

### 3.2 VAPID Key (Web Push Certificate)
1. Go to **Project Settings → Cloud Messaging**
2. Scroll to **Web Push Certificates**
3. Click **"Generate key pair"**
4. Copy the **Key pair** value (starts with `B...`)

### 3.3 Service Account (Backend)
1. Go to **Project Settings → Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file

---

## 🛠️ Step 4: Configure Environment Variables

### Desktop Frontend (UnlistedHub-USM/frontend/.env)
```env
# Firebase Web Configuration
REACT_APP_FIREBASE_API_KEY=AIza...your-key
REACT_APP_FIREBASE_AUTH_DOMAIN=unlistedhub.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=unlistedhub
REACT_APP_FIREBASE_STORAGE_BUCKET=unlistedhub.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_VAPID_KEY=BDummy-VAPID-Key...
```

### Mobile Frontend (nlistplanet-mobile/frontend/.env)
```env
# Firebase Web Configuration
REACT_APP_FIREBASE_API_KEY=AIza...your-key
REACT_APP_FIREBASE_AUTH_DOMAIN=nlistplanet.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=nlistplanet
REACT_APP_FIREBASE_STORAGE_BUCKET=nlistplanet.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=987654321
REACT_APP_FIREBASE_APP_ID=1:987654321:web:xyz789
REACT_APP_FIREBASE_VAPID_KEY=BAnother-VAPID-Key...
```

### Backend (UnlistedHub-USM/backend/.env)
```env
# Firebase Service Account (paste entire JSON as single line)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"unlistedhub","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@unlistedhub.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

**Important:** Service account JSON must be on ONE LINE, wrapped in single quotes.

---

## 📝 Step 5: Update Firebase Config Files

### Desktop: Update `src/config/firebase.js`
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;
```

### Desktop: Update `public/firebase-messaging-sw.js`
```javascript
const firebaseConfig = {
  apiKey: "AIza...your-actual-key",
  authDomain: "unlistedhub.firebaseapp.com",
  projectId: "unlistedhub",
  storageBucket: "unlistedhub.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Mobile: Update same files with mobile credentials

---

## 🚀 Step 6: Start Applications

### Backend
```powershell
cd UnlistedHub-USM/backend
npm run dev
# Should see: "Server running on port 5001"
```

### Desktop Frontend
```powershell
cd UnlistedHub-USM/frontend
npm start
# Opens at http://localhost:3000
```

### Mobile Frontend
```powershell
cd nlistplanet-mobile/frontend
npm start
# Opens at http://localhost:3000
```

---

## ✅ Step 7: Test Push Notifications

### 1. Login to Desktop/Mobile
- User ko login karne par automatically permission popup aayega
- "Allow" click karo
- Toast notification: "🔔 Push notifications enabled!"

### 2. Test Notification Flow
1. **User A** logs in (Desktop)
2. **User B** logs in (Mobile)
3. **User B** creates a listing
4. **User A** places bid on User B's listing
5. **User B** should instantly receive:
   - In-app notification (bell icon)
   - Browser/mobile push notification
   - Toast notification if app is open

### 3. Check Console Logs
```javascript
// Should see:
✅ FCM token registered successfully
✅ Notification permission granted
✅ FCM Token: fT...xyz
```

### 4. Test Different Scenarios
- New bid received
- Bid accepted
- Bid rejected
- Counter offer received
- Deal confirmed
- App in background → Click notification → Opens correct page

---

## 🐛 Troubleshooting

### Permission popup nahi aa raha
**Solution:**
1. Check browser console for errors
2. Make sure `.env` variables loaded hai
3. Service worker registered hai check karo:
   - Chrome DevTools → Application → Service Workers
4. Try opening in **Incognito mode** (clean state)

### FCM token null aa raha hai
**Solutions:**
1. VAPID key correct hai check karo
2. Service worker path correct hai: `/firebase-messaging-sw.js`
3. HTTPS required hai (localhost par bhi chalega)
4. Firebase project mein Web Push Certificates enabled hai

### Service worker register nahi ho raha
**Solutions:**
1. `public/firebase-messaging-sw.js` file exist karti hai
2. File mein Firebase config correct hai
3. Browser cache clear karo:
   - Chrome DevTools → Application → Clear storage
4. Service worker unregister karo aur re-register:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

### Backend mein "Firebase not configured" error
**Solutions:**
1. `.env` file mein `FIREBASE_SERVICE_ACCOUNT` hai
2. JSON format correct hai (single line, wrapped in quotes)
3. Private key mein `\n` properly escaped hai
4. Backend restart karo after adding env variable

### Notifications aa rahe hain lekin click pe open nahi ho raha
**Solutions:**
1. Service worker mein `notificationclick` handler check karo
2. `actionUrl` payload mein correctly pass ho raha hai
3. Browser notification permission "granted" hai

---

## 📱 Production Deployment

### Vercel (Frontend)
```bash
# Add environment variables in Vercel dashboard
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_VAPID_KEY=...
```

### Render (Backend)
```bash
# Add secret file or environment variable
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

---

## 🎯 Expected User Flow

1. **User logs in** → Permission popup shows after 2 seconds
2. **User clicks "Allow"** → FCM token registered, toast shows
3. **Someone bids** → Push notification sent immediately
4. **User sees notification**:
   - App open: Toast notification appears
   - App background: Browser/mobile notification
   - Notification icon badge updates
5. **User clicks notification** → Opens relevant page (e.g., /dashboard/bids)

---

## 📊 Monitoring

### Check FCM Tokens in Database
```javascript
// MongoDB
db.users.findOne({ email: "user@example.com" }).fcmTokens
// Should see array of tokens
```

### Test Manual Push
```javascript
// Backend (Node.js)
const { createAndSendNotification, NotificationTemplates } = require('./utils/pushNotifications');

await createAndSendNotification('USER_ID', {
  ...NotificationTemplates.NEW_BID('TestUser', 1000, 10, 'Zepto'),
  actionUrl: '/dashboard/bids'
});
```

---

## 🎉 Success Indicators

✅ Permission popup visible after login  
✅ "Push notifications enabled!" toast appears  
✅ FCM token registered in database  
✅ Notifications arrive instantly  
✅ Click opens correct page  
✅ Works in background  
✅ Multi-device support (same user, 2 devices)  

---

## 📚 Next Steps

1. Install Firebase SDK: `npm install firebase`
2. Create Firebase project & get credentials
3. Add environment variables
4. Update config files with real credentials
5. Test on localhost
6. Deploy to production

**Abhi backend complete hai, frontend ke liye bas Firebase setup karna hai!** 🚀
