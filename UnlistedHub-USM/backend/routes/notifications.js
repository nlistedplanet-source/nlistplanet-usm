import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });

    const total = await Notification.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/clear-all
// @desc    Delete all notifications for user
// @access  Private
router.post('/clear-all', protect, async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });

    res.json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/register-device
// @desc    Register FCM token for push notifications
// @access  Private
router.post('/register-device', protect, async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    const User = (await import('../models/User.js')).default;
    
    // Add token if not already exists
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { fcmTokens: fcmToken } },
      { new: true, select: 'fcmTokens' }
    );

    res.json({
      success: true,
      message: 'Device registered for push notifications',
      data: { tokenCount: user.fcmTokens.length }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/test-push
// @desc    Send a test push notification to the current user
// @access  Private
router.post('/test-push', protect, async (req, res, next) => {
  try {
    const { sendPushNotification } = await import('../utils/pushNotifications.js');
    const User = (await import('../models/User.js')).default;
    
    const user = await User.findById(req.user._id).select('fcmTokens');
    
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No registered devices found. Please allow notifications and try again.'
      });
    }

    const notificationData = {
      type: 'test',
      title: '🔔 Test Notification',
      message: 'This is a test notification to verify your device is correctly registered. ' + new Date().toLocaleTimeString(),
      data: { actionUrl: '/' }
    };

    const result = await sendPushNotification(req.user._id, notificationData);

    if (!result.success) {
      let errorMessage = `Failed to send notification: ${result.reason || 'Unknown error'}`;
      if (result.details) {
        errorMessage += ` (${result.details})`;
      }
      return res.status(500).json({
        success: false,
        message: errorMessage
      });
    }

    res.json({
      success: true,
      message: 'Test notification sent'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/unregister-device
// @desc    Remove FCM token (logout from device)
// @access  Private
router.post('/unregister-device', protect, async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    const User = (await import('../models/User.js')).default;
    
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { fcmTokens: fcmToken } }
    );

    res.json({
      success: true,
      message: 'Device unregistered from push notifications'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.put('/preferences', protect, async (req, res, next) => {
  try {
    const { 
      pushEnabled, 
      emailEnabled, 
      bidNotifications, 
      offerNotifications, 
      dealNotifications 
    } = req.body;

    const User = (await import('../models/User.js')).default;
    
    const updateData = {};
    if (typeof pushEnabled === 'boolean') updateData['notificationPreferences.pushEnabled'] = pushEnabled;
    if (typeof emailEnabled === 'boolean') updateData['notificationPreferences.emailEnabled'] = emailEnabled;
    if (typeof bidNotifications === 'boolean') updateData['notificationPreferences.bidNotifications'] = bidNotifications;
    if (typeof offerNotifications === 'boolean') updateData['notificationPreferences.offerNotifications'] = offerNotifications;
    if (typeof dealNotifications === 'boolean') updateData['notificationPreferences.dealNotifications'] = dealNotifications;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, select: 'notificationPreferences' }
    );

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: user.notificationPreferences
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/preferences
// @desc    Get notification preferences
// @access  Private
router.get('/preferences', protect, async (req, res, next) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user._id).select('notificationPreferences');

    res.json({
      success: true,
      data: user.notificationPreferences || {
        pushEnabled: true,
        emailEnabled: true,
        bidNotifications: true,
        offerNotifications: true,
        dealNotifications: true
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
