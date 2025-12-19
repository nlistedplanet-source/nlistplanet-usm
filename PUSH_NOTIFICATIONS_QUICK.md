# 🔔 Push Notifications - Quick Reference

## Backend Complete ✅

### Files Created/Modified
```
✅ backend/utils/pushNotifications.js (NEW - 232 lines)
✅ backend/models/User.js (fcmTokens + preferences)
✅ backend/routes/notifications.js (4 new endpoints)
✅ backend/routes/listings.js (10 notification types updated)
```

### API Endpoints
```
POST   /api/notifications/register-device      # Register FCM token
POST   /api/notifications/unregister-device    # Remove token
GET    /api/notifications/preferences          # Get preferences
PUT    /api/notifications/preferences          # Update preferences
```

### Environment Variable Needed
```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

---

## Frontend Pending 📋

### 4 Steps (Desktop + Mobile)

1️⃣ **Install Firebase**
```bash
npm install firebase
```

2️⃣ **Create `src/config/firebase.js`**
```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const app = initializeApp({
  apiKey: "...",
  projectId: "...",
  // ... config from Firebase Console
});

export const messaging = getMessaging(app);
```

3️⃣ **Update AuthContext**
- Register token on login: `POST /api/notifications/register-device`
- Unregister on logout: `POST /api/notifications/unregister-device`
- Listen to foreground messages: `onMessage(messaging, handler)`

4️⃣ **Create Service Worker `public/firebase-messaging-sw.js`**
```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({ /* config */ });
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo192.png'
  });
});
```

---

## Notification Types (All Active)

| Type | Trigger | Recipient |
|------|---------|-----------|
| NEW_BID | Someone bids | Listing owner |
| NEW_OFFER | Someone offers | Listing owner |
| BID_ACCEPTED | Owner accepts | Bidder |
| OFFER_ACCEPTED | Owner accepts | Offerer |
| BID_REJECTED | Owner rejects | Bidder |
| OFFER_REJECTED | Owner rejects | Offerer |
| BID_COUNTERED | Either counters | Other party |
| CONFIRMATION_REQUIRED | First accepts | Second party |
| DEAL_CONFIRMED | Both accept | Both parties |
| (Sold/Cancelled) | Status change | All bidders |

---

## Testing

### Test Token Registration
```javascript
// Browser Console
await fetch('/api/notifications/register-device', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_JWT' },
  body: JSON.stringify({ fcmToken: 'test_token_123' })
});
```

### Check Tokens in DB
```javascript
// MongoDB
db.users.findOne({ _id: ObjectId("USER_ID") }).fcmTokens
```

### Manual Push Test
```javascript
// Backend (Node.js REPL)
const { createAndSendNotification, NotificationTemplates } = require('./utils/pushNotifications');
await createAndSendNotification('USER_ID', {
  ...NotificationTemplates.NEW_BID('TestUser', 1000, 10, 'Zepto'),
  actionUrl: '/dashboard/bids'
});
```

---

## Key Benefits

🚀 **Real-Time** - Instant notifications (no refresh needed)  
📱 **Multi-Device** - Works across all user devices  
🎯 **Deep Linking** - Opens relevant page on click  
⚙️ **User Control** - Granular notification preferences  
🛡️ **Secure** - No sensitive data in push payload  
🔄 **Reliable** - Auto-cleanup of invalid tokens  

---

## Next Action

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Generate service account JSON
3. Add `FIREBASE_SERVICE_ACCOUNT` to backend `.env`
4. Implement 4 frontend steps (desktop + mobile)
5. Test end-to-end with 2 devices

---

📚 **Full Documentation:** `PUSH_NOTIFICATIONS_COMPLETE.md` (5000+ words)  
📋 **Summary:** `PUSH_NOTIFICATIONS_SUMMARY.md`
