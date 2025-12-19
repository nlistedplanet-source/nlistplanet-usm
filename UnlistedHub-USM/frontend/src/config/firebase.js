// Firebase SDK loaded via CDN (see index.html)
// Using compat mode for CDN compatibility

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA7jdJrLTnfOcECcmQyrZDL5iEH97zOoJ8",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "nlistplanet.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "nlistplanet",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "nlistplanet.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "630890625828",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:630890625828:web:21e2c38082dd7ac8b851b1"
};

// VAPID key for web push (from Firebase Console → Cloud Messaging → Web Push Certificates)
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY || "BA1cPlr8LOVkTbtsxMV06mNMAMLwEd0Kj9LLaGGLEACgNxZcGlyzHLkHs68oZ_OucDPWM_zbzdEf7rPNbdmf-7I";

let app = null;
let messaging = null;

// Initialize Firebase
try {
  // Wait for CDN-loaded Firebase
  if (window.firebase) {
    app = window.firebase.initializeApp(firebaseConfig);
    
    // Check if messaging is supported in this browser
    if ('Notification' in window && 'serviceWorker' in navigator) {
      messaging = window.firebase.messaging();
    } else {
      console.warn('Push notifications are not supported in this browser');
    }
  } else {
    console.error('Firebase SDK not loaded from CDN');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.warn('Firebase messaging not initialized');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Get FCM token
      const token = await messaging.getToken({
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } else if (permission === 'denied') {
      console.warn('Notification permission denied');
      return null;
    } else {
      console.warn('Notification permission dismissed');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 * @param {Function} callback - Called when message received in foreground
 */
export const onForegroundMessage = (callback) => {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return () => {};
  }

  return messaging.onMessage((payload) => {
    console.log('Foreground message received:', payload);
    
    // Extract notification data
    const { title, body, icon, data } = payload.notification || {};
    const actionUrl = payload.data?.actionUrl;
    
    // Call callback with notification data
    if (callback) {
      callback({
        title,
        body,
        icon,
        data: payload.data,
        actionUrl
      });
    }
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/logo192.png',
        badge: '/logo192.png',
        tag: payload.messageId,
        requireInteraction: true,
        data: { actionUrl }
      });
      
      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        if (actionUrl) {
          window.location.href = actionUrl;
        }
        notification.close();
      };
    }
  });
};

/**
 * Check if notifications are enabled
 * @returns {boolean}
 */
export const areNotificationsEnabled = () => {
  return Notification.permission === 'granted';
};

/**
 * Get current notification permission status
 * @returns {'granted'|'denied'|'default'}
 */
export const getNotificationPermission = () => {
  return Notification.permission;
};

export { messaging };
export default app;
