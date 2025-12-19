# Push Notifications System - Complete Implementation Guide

## Overview
Real-time push notification system using Firebase Cloud Messaging (FCM) for bid, counter offer, accept, and reject actions. Users receive instant notifications on their devices whenever someone interacts with their listings.

---

## Architecture

### Backend Components
1. **pushNotifications.js** - Core FCM integration utility
2. **User.js** - FCM token storage and preferences
3. **notifications.js** - Token management API endpoints
4. **listings.js** - All bid/offer/deal notifications now send push

### Push Notification Flow
```
User Action (bid/accept/reject) 
  → Backend creates in-app notification
  → Backend sends FCM push notification
  → User's device receives instant notification
  → User clicks notification → Opens app at actionUrl
```

---

## Backend Implementation

### 1. Push Notification Utility (`backend/utils/pushNotifications.js`)

**Purpose:** Central push notification management using Firebase Admin SDK

**Key Functions:**
- `initializeFirebase()` - Initializes Firebase Admin with service account
- `sendPushNotification(userId, payload)` - Sends FCM push to user's devices
- `createAndSendNotification(userId, data)` - Creates in-app + sends push (non-blocking)
- `NotificationTemplates` - Predefined message templates for all notification types

**Notification Templates:**
```javascript
NotificationTemplates.NEW_BID(username, price, quantity, companyName)
NotificationTemplates.NEW_OFFER(username, price, quantity, companyName)
NotificationTemplates.BID_ACCEPTED(price, quantity, companyName)
NotificationTemplates.OFFER_ACCEPTED(price, quantity, companyName)
NotificationTemplates.BID_REJECTED(price, quantity, companyName)
NotificationTemplates.OFFER_REJECTED(price, quantity, companyName)
NotificationTemplates.COUNTER_OFFER(username, price, quantity, companyName)
NotificationTemplates.BID_COUNTERED(username, price, quantity, companyName)
NotificationTemplates.DEAL_CONFIRMED(companyName, price, quantity)
NotificationTemplates.CONFIRMATION_REQUIRED(username, price, quantity, companyName)
```

**Features:**
- Multi-device support (sends to all registered tokens)
- Automatic invalid token cleanup
- Graceful fallback if Firebase not configured
- Android/iOS specific payload formatting
- Non-blocking sends (failures don't block notification creation)

**Usage Pattern:**
```javascript
// Old pattern (in-app only)
await Notification.create({
  userId: targetUserId,
  type: 'new_bid',
  title: 'New Bid',
  message: 'Someone bid on your listing',
  data: {...}
});

// New pattern (in-app + push)
await createAndSendNotification(targetUserId, {
  ...NotificationTemplates.NEW_BID(username, price, quantity, company),
  data: {
    ...template.data,
    listingId: listing._id.toString(),
    bidId: bid._id.toString()
  },
  actionUrl: `/dashboard/bids`
});
```

### 2. User Model Updates (`backend/models/User.js`)

**New Fields:**
```javascript
// FCM token storage (multiple devices per user)
fcmTokens: {
  type: [String],
  default: []
}

// Notification preferences
notificationPreferences: {
  pushEnabled: { type: Boolean, default: true },
  emailEnabled: { type: Boolean, default: true },
  bidNotifications: { type: Boolean, default: true },
  offerNotifications: { type: Boolean, default: true },
  dealNotifications: { type: Boolean, default: true }
}
```

### 3. Notification API Endpoints (`backend/routes/notifications.js`)

**New Endpoints:**

#### Register Device for Push Notifications
```
POST /api/notifications/register-device
Body: { fcmToken: "device_token_here" }
```
- Adds FCM token to user's fcmTokens array
- Uses $addToSet to prevent duplicates
- Called when user logs in or enables push notifications

#### Unregister Device
```
POST /api/notifications/unregister-device
Body: { fcmToken: "device_token_here" }
```
- Removes FCM token from user's array
- Called when user logs out or disables notifications

#### Update Notification Preferences
```
PUT /api/notifications/preferences
Body: {
  pushEnabled: true,
  bidNotifications: false,
  offerNotifications: true,
  dealNotifications: true
}
```
- Updates user's notification preferences
- Partial updates supported (only send changed fields)

#### Get Notification Preferences
```
GET /api/notifications/preferences
Response: {
  success: true,
  preferences: {
    pushEnabled: true,
    emailEnabled: true,
    bidNotifications: true,
    offerNotifications: true,
    dealNotifications: true
  }
}
```

### 4. Listings Routes Updates (`backend/routes/listings.js`)

**All notification points now send push notifications:**

1. **New Bid/Offer** - When someone places a bid or offer
2. **Bid/Offer Accepted** - When owner accepts a bid/offer
3. **Bid/Offer Rejected** - When owner rejects a bid/offer
4. **Counter Offer** - When either party sends a counter offer
5. **Deal Confirmed** - When deal is fully confirmed (both parties accepted)
6. **Confirmation Required** - When first party accepts, second party needs to confirm
7. **Seller Confirmation** - When seller confirms the deal (verification codes generated)
8. **Deal Rejected** - When seller rejects after buyer accepted
9. **Sold Externally** - When listing is marked as sold elsewhere (all pending bids rejected)
10. **Listing Cancelled** - When owner cancels listing (all pending bids rejected)

**Pattern Applied to All Notifications:**
- Import `createAndSendNotification` and `NotificationTemplates`
- Replace `Notification.create()` with `createAndSendNotification()`
- Use predefined templates from `NotificationTemplates`
- Add `actionUrl` for deep linking (e.g., `/dashboard/bids`)
- Fetch company details for accurate company names
- Convert ObjectIds to strings in data payload

---

## Firebase Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "UnlistedHub" or "NListPlanet"
3. Enable Cloud Messaging (FCM)

### 2. Generate Service Account
1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file (keep secure, never commit!)

### 3. Backend Environment Variable
Add to `.env` file:
```env
FIREBASE_SERVICE_ACCOUNT='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}'
```

**Note:** The entire JSON should be on one line, or use proper JSON escaping. Alternatively, store as base64:
```env
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64_encoded_json>
```

### 4. Deployment (Render)
- Add environment variable in Render dashboard
- For large JSON files, use Render's secret files feature
- System gracefully degrades if Firebase not configured (only in-app notifications)

---

## Frontend Implementation

### Desktop Frontend (`UnlistedHub-USM/frontend`)

#### 1. Install Firebase SDK
```bash
cd UnlistedHub-USM/frontend
npm install firebase
```

#### 2. Create Firebase Config (`src/config/firebase.js`)
```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
```

#### 3. Update AuthContext (`src/context/AuthContext.js`)
```javascript
import { messaging, getToken, onMessage } from '../config/firebase';
import api from '../utils/api';

// Inside AuthContext component

// Register FCM token on login
useEffect(() => {
  if (user && messaging) {
    registerFCMToken();
  }
}, [user]);

const registerFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console → Cloud Messaging → Web Push certificates
      });
      
      if (token) {
        // Register token with backend
        await api.post('/notifications/register-device', { fcmToken: token });
        console.log('FCM token registered');
      }
    }
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
};

// Listen for foreground messages
useEffect(() => {
  if (messaging) {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      
      // Show browser notification
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: payload.data?.listingId || 'notification',
        data: payload.data
      });
    });

    return () => unsubscribe();
  }
}, [messaging]);

// Unregister token on logout
const logout = async () => {
  try {
    if (user && messaging) {
      const token = await getToken(messaging);
      if (token) {
        await api.post('/notifications/unregister-device', { fcmToken: token });
      }
    }
    // ... existing logout logic
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

#### 4. Create Service Worker (`public/firebase-messaging-sw.js`)
```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: payload.data?.listingId || 'notification',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const actionUrl = event.notification.data?.actionUrl || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if app is already open
        for (let client of windowClients) {
          if (client.url.includes(actionUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(actionUrl);
        }
      })
  );
});
```

### Mobile Frontend (`nlistplanet-mobile/frontend`)

**Implementation identical to desktop, with same 4 steps above.**

**Additional Notes:**
- Mobile PWA benefits from native-like push notifications
- Use haptic feedback when notification received (already implemented)
- Consider notification sound preferences
- Test on both Android and iOS devices

---

## Testing

### 1. Backend Testing
```bash
cd UnlistedHub-USM/backend

# Test push notification utility
node -e "
const { createAndSendNotification, NotificationTemplates } = require('./utils/pushNotifications.js');
createAndSendNotification('USER_ID_HERE', {
  ...NotificationTemplates.NEW_BID('TestUser', 1000, 10, 'Zepto'),
  actionUrl: '/dashboard/bids'
});
"
```

### 2. Frontend Testing

#### Test Token Registration
1. Open browser DevTools → Console
2. Login to app
3. Check console for "FCM token registered"
4. Verify token in MongoDB User document (fcmTokens array)

#### Test Foreground Notifications
1. Keep app open in browser
2. Place a bid from another account
3. Should see browser notification appear
4. Click notification → Should navigate to actionUrl

#### Test Background Notifications
1. Close app or switch to another tab
2. Place a bid from another account
3. Should receive system notification
4. Click notification → Should open app at actionUrl

#### Test Multi-Device
1. Login on desktop browser
2. Login on mobile PWA
3. Check User document → Should have 2 tokens in fcmTokens array
4. Place bid → Both devices should receive notification

### 3. Notification Flow Testing

**Test Matrix:**

| Action | Recipient | Template | Expected Result |
|--------|-----------|----------|-----------------|
| User A places bid on User B's listing | User B | NEW_BID | User B receives "New bid: ₹X for Y shares of Z" |
| User B accepts User A's bid | User A | BID_ACCEPTED | User A receives "Bid accepted! ₹X for Y shares of Z" |
| User B rejects User A's bid | User A | BID_REJECTED | User A receives "Bid rejected: ₹X for Y shares of Z" |
| User B counters User A's bid | User A | BID_COUNTERED | User A receives "Counter offer from @user: ₹X" |
| User A accepts, User B confirms | Both | DEAL_CONFIRMED | Both receive "Deal confirmed! Check codes" |
| User A accepts, waiting for User B | User B | CONFIRMATION_REQUIRED | User B receives "Confirm deal with @user" |

### 4. Error Handling Testing

**Invalid Token Cleanup:**
1. Register device token
2. Manually delete token from Firebase
3. Send notification
4. Check User document → Invalid token should be removed from fcmTokens array

**Graceful Degradation:**
1. Remove FIREBASE_SERVICE_ACCOUNT from .env
2. Restart backend
3. Place bid → Should still create in-app notification
4. Should NOT crash, only log warning

---

## Notification Preferences

### User Settings Page

Add notification preferences UI to user settings:

```jsx
// Desktop: src/pages/Settings.jsx
// Mobile: src/pages/SettingsPage.jsx

import api from '../utils/api';

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState({
    pushEnabled: true,
    emailEnabled: true,
    bidNotifications: true,
    offerNotifications: true,
    dealNotifications: true
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data.preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreference = async (key, value) => {
    try {
      await api.put('/notifications/preferences', {
        [key]: value
      });
      setPreferences(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notification Settings</h3>
      
      <div className="space-y-2">
        <label className="flex items-center justify-between">
          <span>Push Notifications</span>
          <input
            type="checkbox"
            checked={preferences.pushEnabled}
            onChange={(e) => updatePreference('pushEnabled', e.target.checked)}
          />
        </label>
        
        <label className="flex items-center justify-between">
          <span>Email Notifications</span>
          <input
            type="checkbox"
            checked={preferences.emailEnabled}
            onChange={(e) => updatePreference('emailEnabled', e.target.checked)}
          />
        </label>
        
        <hr />
        
        <label className="flex items-center justify-between">
          <span>Bid Notifications</span>
          <input
            type="checkbox"
            checked={preferences.bidNotifications}
            onChange={(e) => updatePreference('bidNotifications', e.target.checked)}
          />
        </label>
        
        <label className="flex items-center justify-between">
          <span>Offer Notifications</span>
          <input
            type="checkbox"
            checked={preferences.offerNotifications}
            onChange={(e) => updatePreference('offerNotifications', e.target.checked)}
          />
        </label>
        
        <label className="flex items-center justify-between">
          <span>Deal Notifications</span>
          <input
            type="checkbox"
            checked={preferences.dealNotifications}
            onChange={(e) => updatePreference('dealNotifications', e.target.checked)}
          />
        </label>
      </div>
    </div>
  );
};
```

### Preference Enforcement

The backend already respects user preferences in `pushNotifications.js`:

```javascript
// Check user preferences before sending
if (!user.notificationPreferences?.pushEnabled) {
  return; // Push notifications disabled
}

// Check specific notification type preferences
const notifType = data.type;
if (notifType.includes('bid') && !user.notificationPreferences?.bidNotifications) {
  return; // Bid notifications disabled
}
// ... similar checks for offer/deal notifications
```

---

## Security Considerations

### 1. Token Security
- FCM tokens are stored server-side only
- Tokens are device-specific, not user-specific
- Invalid tokens are automatically cleaned up
- Tokens are removed on logout

### 2. Notification Content
- No sensitive data in push payload (prices are OK, verification codes are NOT)
- Use actionUrl for deep linking to view full details
- Templates ensure consistent, safe messaging
- Anonymous usernames used (@trader_xxx)

### 3. Rate Limiting
- Existing rate limiting applies to token registration endpoints
- FCM has built-in rate limits (prevent spam)
- Backend respects user preferences (can disable notifications)

### 4. Privacy
- Users can disable push notifications anytime
- Granular control (bid/offer/deal notifications separately)
- Email notifications separate toggle
- No tracking of notification opens (unless explicitly added)

---

## Monitoring & Analytics

### Backend Logs
Push notification utility logs all sends and failures:
```
✅ Push notification sent to USER_ID_HERE (2 devices)
⚠️ Warning: No FCM tokens found for user USER_ID_HERE
❌ Error: Failed to send to 1 device(s): Invalid token
```

### Metrics to Track
1. **Token Registration Rate** - % of users with registered FCM tokens
2. **Notification Delivery Rate** - % of notifications successfully sent
3. **Invalid Token Rate** - % of tokens that fail (should auto-cleanup)
4. **Notification Click-Through Rate** - % of notifications clicked (requires frontend tracking)
5. **Preference Opt-Out Rate** - % of users who disable notifications

### Firebase Console
- View FCM quota usage
- Monitor message delivery stats
- Track token refresh rates
- Debug failed sends

---

## Troubleshooting

### Issue: Notifications not received on mobile

**Solution:**
1. Check if FCM token registered: `db.users.findOne({ _id: ObjectId("USER_ID") }).fcmTokens`
2. Verify Firebase credentials in backend .env
3. Check service worker registration: DevTools → Application → Service Workers
4. Test notification permission: `Notification.permission` should be "granted"
5. Check mobile browser compatibility (Chrome/Firefox support FCM)

### Issue: Notifications work on desktop but not mobile

**Solution:**
1. Mobile PWA requires HTTPS (localhost OK for testing)
2. Check if service worker installed: Settings → Add to Home Screen
3. Verify firebase-messaging-sw.js is accessible at root
4. Test in Chrome DevTools → Application → Service Workers → "Update on reload"

### Issue: Duplicate notifications

**Solution:**
1. Check fcmTokens array - should only have unique tokens
2. Backend uses $addToSet to prevent duplicates
3. Clear old tokens: Unregister on logout, token refresh

### Issue: Background notifications not working

**Solution:**
1. Service worker must be at root (`/firebase-messaging-sw.js`)
2. Check service worker scope: Should be `/` not `/static/`
3. Verify background message handler in service worker
4. Test: Close app, send notification from another account

### Issue: "Failed to send to X device(s)"

**Solution:**
1. Invalid tokens are automatically removed from database
2. User may have uninstalled app or cleared browser data
3. Token may have expired (Firebase auto-refreshes)
4. Check Firebase Console for quota limits

---

## Future Enhancements

### 1. Notification Sound
Add custom notification sounds for different notification types:
```javascript
// In firebase-messaging-sw.js
const notificationOptions = {
  body: payload.notification.body,
  icon: '/logo192.png',
  sound: '/sounds/notification.mp3', // Custom sound
  vibrate: [200, 100, 200] // Custom vibration pattern
};
```

### 2. Rich Notifications
Add images, action buttons:
```javascript
const notificationOptions = {
  body: payload.notification.body,
  icon: '/logo192.png',
  image: payload.data?.companyLogo, // Company logo
  actions: [
    { action: 'accept', title: 'Accept' },
    { action: 'reject', title: 'Reject' }
  ]
};
```

### 3. Notification Grouping
Group multiple notifications from same listing:
```javascript
const notificationOptions = {
  body: payload.notification.body,
  tag: payload.data?.listingId, // Same tag = replace previous
  renotify: true // Alert user even if tag exists
};
```

### 4. Web Push Analytics
Track notification performance:
```javascript
// Track notification opened
self.addEventListener('notificationclick', (event) => {
  analytics.track('notification_opened', {
    type: event.notification.data?.type,
    listingId: event.notification.data?.listingId
  });
});
```

### 5. Scheduled Notifications
Send digest notifications (e.g., daily summary):
```javascript
// Backend cron job
cron.schedule('0 9 * * *', async () => {
  const usersWithActivity = await getActiveUsers();
  for (const user of usersWithActivity) {
    await sendDailyDigest(user);
  }
});
```

---

## Summary

✅ **Completed:**
- Firebase Admin SDK integration
- FCM token management (register/unregister)
- User notification preferences (push/email/types)
- All 10 notification types in listings.js send push
- Multi-device support (fcmTokens array)
- Automatic invalid token cleanup
- Graceful degradation (works without Firebase)
- Predefined message templates
- Non-blocking sends (failures don't crash app)

📋 **Pending:**
- Frontend FCM SDK setup (desktop + mobile)
- Service worker creation (firebase-messaging-sw.js)
- AuthContext updates (token registration/unregister)
- Settings page UI (notification preferences)
- Firebase project setup & credentials
- Testing on actual devices
- Documentation for deployment team

🎯 **Next Steps:**
1. Create Firebase project and generate service account
2. Add FIREBASE_SERVICE_ACCOUNT to backend .env
3. Implement frontend FCM setup (both desktop and mobile)
4. Create notification preferences UI in settings
5. Test end-to-end on multiple devices
6. Deploy and monitor Firebase Console analytics

---

## Contact & Support

**Documentation Author:** GitHub Copilot  
**Last Updated:** 2025  
**Version:** 1.0.0

For issues or questions:
- Check backend logs for push notification errors
- Verify Firebase Console for delivery stats
- Test with Postman: `POST /api/notifications/register-device`
- Review this guide's Troubleshooting section
