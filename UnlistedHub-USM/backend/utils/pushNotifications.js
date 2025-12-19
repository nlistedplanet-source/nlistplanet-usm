// Stub file for push notifications when firebase-admin is not available
import Notification from '../models/Notification.js';

console.warn('⚠️ Using push notification stub (firebase-admin not installed)');

/**
 * Send push notification (stub - does nothing)
 */
export const sendPushNotification = async (userId, payload) => {
  console.log('📱 Push notification skipped (firebase-admin not available)');
  return { success: false, reason: 'firebase_not_available' };
};

/**
 * Send push notification to multiple users (stub)
 */
export const sendPushNotificationToMultipleUsers = async (userIds, payload) => {
  console.log('📱 Bulk push notification skipped (firebase-admin not available)');
  return {
    success: false,
    reason: 'firebase_not_available',
    sent: 0,
    failed: userIds.length
  };
};

/**
 * Send push notification for new bid (stub)
 */
export const sendNewBidNotification = async (listing, bid) => {
  console.log('📱 New bid notification skipped');
  return { success: false };
};

/**
 * Send push notification for bid acceptance (stub)
 */
export const sendBidAcceptedNotification = async (listing, bid) => {
  console.log('📱 Bid accepted notification skipped');
  return { success: false };
};

/**
 * Send push notification for deal completion (stub)
 */
export const sendDealCompletedNotification = async (userId, dealData) => {
  console.log('📱 Deal completed notification skipped');
  return { success: false };
};

/**
 * Create in-app notification and send push notification (stub)
 */
export const createAndSendNotification = async (userId, notificationData) => {
  const notification = await Notification.create({
    userId,
    ...notificationData
  });
  console.log('📱 In-app notification created (push notification skipped)');
  return notification;
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
  })
};

export default {
  sendPushNotification,
  sendPushNotificationToMultipleUsers,
  sendNewBidNotification,
  sendBidAcceptedNotification,
  sendDealCompletedNotification,
  createAndSendNotification,
  NotificationTemplates
};
