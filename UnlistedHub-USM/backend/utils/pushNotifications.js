// Conditional import - firebase-admin may not be installed 
let admin = null;
let adminImportError = null;

try {
  admin = (await import('firebase-admin')).default;
} catch (error) {
  adminImportError = error;
  console.warn('⚠️ firebase-admin not installed. Push notifications disabled.');
}

import Notification from '../models/Notification.js';

// Initialize Firebase Admin SDK (if not already initialized)
let firebaseInitialized = false;
let initializationAttempted = false;

const initializeFirebase = () => {
  // Only try once
  if (initializationAttempted) return firebaseInitialized;
  initializationAttempted = true;
  
  if (firebaseInitialized || !admin) {
    if (!admin) console.warn('⚠️ Firebase Admin SDK not loaded (admin is null)');
    return firebaseInitialized;
  }
  
  try {
    // Check if Firebase credentials are available
    let firebaseCredentials = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (firebaseCredentials) {
      console.log('🔑 Found FIREBASE_SERVICE_ACCOUNT, attempting initialization...');
      // Remove surrounding quotes if present (dotenv quirk)
      if (firebaseCredentials.startsWith("'") && firebaseCredentials.endsWith("'")) {
        firebaseCredentials = firebaseCredentials.slice(1, -1);
      }
      if (firebaseCredentials.startsWith('"') && firebaseCredentials.endsWith('"')) {
        firebaseCredentials = firebaseCredentials.slice(1, -1);
      }
      
      try {
        const serviceAccount = JSON.parse(firebaseCredentials);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message);
        console.error('Value starts with:', firebaseCredentials.substring(0, 20));
      }
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT environment variable is MISSING');
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
  }
};

// Initialize on module load (delayed to ensure dotenv is loaded)
setTimeout(() => {
  initializeFirebase();
}, 100);

/**
 * Send push notification to a user's device(s)
 * @param {string} userId - User ID to send notification to
 * @param {object} payload - Notification payload
 * @returns {Promise<object>} Result of notification send
 */
export const sendPushNotification = async (userId, payload) => {
  try {
    // Lazy initialization - ensure Firebase is ready
    initializeFirebase();
    
    if (!admin || !firebaseInitialized) {
      const reason = !admin ? 'firebase_admin_not_loaded' : 'firebase_not_initialized';
      console.log(`📱 Push notification skipped (${reason})`);
      return { 
        success: false, 
        reason: reason,
        details: !process.env.FIREBASE_SERVICE_ACCOUNT ? 'FIREBASE_SERVICE_ACCOUNT is missing' : 'Initialization failed'
      };
    }

    // Get user's FCM tokens from User model
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId).select('fcmTokens');
    
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log(`📱 No FCM tokens found for user ${userId}`);
      return { success: false, reason: 'no_tokens' };
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.message,
      },
      data: {
        type: payload.type,
        // Ensure all data values are strings (FCM requirement)
        ...Object.keys(payload.data || {}).reduce((acc, key) => {
          acc[key] = payload.data[key]?.toString() || '';
          return acc;
        }, {}),
        actionUrl: payload.data?.actionUrl || '/',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'nlistplanet_notifications',
          visibility: 'public',
          priority: 'max',
          vibrateTimings: ['0s', '0.5s', '0.2s', '0.5s'],
          notificationCount: 1,
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          }
        }
      },
      webpush: {
        fcm_options: {
          link: payload.data?.actionUrl || '/'
        },
        notification: {
          icon: '/Logo.png',
          badge: '/Logo.png',
          image: payload.data?.imageUrl || undefined,
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200],
          timestamp: Date.now(),
          renotify: true,
          tag: payload.type || 'default',
          silent: false,
          dir: 'ltr',
          lang: 'en'
        }
      },
      tokens: user.fcmTokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Remove invalid tokens
    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        invalidTokens.push(user.fcmTokens[idx]);
        console.log(`❌ Failed to send to token: ${resp.error?.message}`);
      }
    });

    // Clean up invalid tokens
    if (invalidTokens.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: { $in: invalidTokens } }
      });
    }

    console.log(`✅ Push notification sent: ${response.successCount}/${user.fcmTokens.length} delivered`);
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokens
    };

  } catch (error) {
    console.error('❌ Push notification error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Create in-app notification and send push notification
 * @param {string} userId - User ID to notify
 * @param {object} notificationData - Notification data
 * @returns {Promise<object>} Created notification
 */
export const createAndSendNotification = async (userId, notificationData) => {
  try {
    // Create in-app notification
    const notification = await Notification.create({
      userId,
      ...notificationData
    });

    // Send push notification (non-blocking)
    await sendPushNotification(userId, {
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      data: notificationData.data || {}
    }).catch(err => {
      console.error('Push notification failed:', err);
    });

    return notification;
  } catch (error) {
    console.error('❌ Notification creation failed:', error.message);
    throw error;
  }
};

/**
 * Notification templates for different actions
 */
export const NotificationTemplates = {
  NEW_BID: (fromUser, amount, quantity, companyName) => ({
    type: 'new_bid',
    title: '🎯 New Bid Received!',
    message: `${fromUser} placed a bid of ₹${amount} for ${quantity} shares of ${companyName}`,
    data: { fromUser, amount, quantity, companyName }
  }),

  NEW_OFFER: (fromUser, amount, quantity, companyName) => ({
    type: 'new_offer',
    title: '📈 New Offer Received!',
    message: `${fromUser} made an offer of ₹${amount} for ${quantity} shares of ${companyName}`,
    data: { fromUser, amount, quantity, companyName }
  }),

  BID_ACCEPTED: (companyName, amount, quantity) => ({
    type: 'bid_accepted',
    title: '✅ Bid Accepted!',
    message: `Your bid of ₹${amount} for ${quantity} shares of ${companyName} has been accepted!`,
    data: { amount, quantity, companyName }
  }),

  OFFER_ACCEPTED: (companyName, amount, quantity) => ({
    type: 'offer_accepted',
    title: '✅ Offer Accepted!',
    message: `Your offer of ₹${amount} for ${quantity} shares of ${companyName} has been accepted!`,
    data: { amount, quantity, companyName }
  }),

  BID_REJECTED: (companyName, amount, quantity) => ({
    type: 'bid_rejected',
    title: '❌ Bid Rejected',
    message: `Your bid of ₹${amount} for ${quantity} shares of ${companyName} was rejected`,
    data: { amount, quantity, companyName }
  }),

  OFFER_REJECTED: (companyName, amount, quantity) => ({
    type: 'offer_rejected',
    title: '❌ Offer Rejected',
    message: `Your offer of ₹${amount} for ${quantity} shares of ${companyName} was rejected`,
    data: { amount, quantity, companyName }
  }),

  COUNTER_OFFER: (fromUser, amount, quantity, companyName) => ({
    type: 'counter_offer',
    title: '🔄 Counter Offer Received!',
    message: `${fromUser} sent a counter offer of ₹${amount} for ${quantity} shares of ${companyName}`,
    data: { fromUser, amount, quantity, companyName }
  }),

  BID_COUNTERED: (fromUser, amount, quantity, companyName) => ({
    type: 'bid_countered',
    title: '🔄 Bid Countered!',
    message: `${fromUser} countered your bid with ₹${amount} for ${quantity} shares of ${companyName}`,
    data: { fromUser, amount, quantity, companyName }
  }),

  DEAL_CONFIRMED: (companyName, amount, quantity) => ({
    type: 'deal_confirmed',
    title: '🎉 Deal Confirmed!',
    message: `Deal confirmed for ${quantity} shares of ${companyName} at ₹${amount}. Check confirmation codes!`,
    data: { amount, quantity, companyName }
  }),

  CONFIRMATION_REQUIRED: (companyName, amount, quantity) => ({
    type: 'confirmation_required',
    title: '⏳ Action Required!',
    message: `Please confirm your deal for ${quantity} shares of ${companyName} at ₹${amount}`,
    data: { amount, quantity, companyName }
  }),

  USER_QUERY: (username, subject, category) => ({
    type: 'user_query',
    title: `📩 New Query from @${username}`,
    message: `[${category.toUpperCase()}] ${subject}`,
    data: { username, subject, category }
  })
};

export default {
  sendPushNotification,
  createAndSendNotification,
  NotificationTemplates
};
