import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw,
  Bell,
  BellOff,
  Trash2,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { notificationsAPI } from '../../utils/api';
import { timeAgo, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // all, unread, trading, system
  const [swipedId, setSwipedId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    await fetchNotifications();
    setRefreshing(false);
    haptic.success();
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      haptic.light();
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      haptic.medium();
      await notificationsAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setSwipedId(null);
      haptic.success();
    } catch (error) {
      haptic.error();
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    haptic.light();

    // Navigate based on notification type
    if (notification.type === 'bid_received' || notification.type === 'bid_accepted') {
      navigate('/offers');
    } else if (notification.type === 'bid_rejected') {
      navigate('/bids');
    } else if (notification.link) {
      navigate(notification.link);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.read;
    if (activeFilter === 'trading') {
      return ['bid_received', 'bid_accepted', 'bid_rejected', 'trade_completed'].includes(notification.type);
    }
    if (activeFilter === 'system') {
      return ['system', 'announcement', 'kyc_update'].includes(notification.type);
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const FilterButton = ({ value, label, count }) => (
    <button
      onClick={() => {
        haptic.light();
        setActiveFilter(value);
      }}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        activeFilter === value
          ? 'bg-primary-600 text-white shadow-lg'
          : 'bg-white text-gray-700 border border-gray-200'
      }`}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen-nav flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen-nav bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-6 pt-safe pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="px-3 py-2 bg-primary-50 text-primary-600 rounded-xl font-semibold text-sm hover:bg-primary-100 transition-colors touch-feedback flex items-center gap-1"
                >
                  <Check size={14} />
                  Mark all
                </button>
              )}
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center touch-feedback"
              >
                <RefreshCw className={`w-5 h-5 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-6 px-6">
            <FilterButton value="all" label="All" count={notifications.length} />
            <FilterButton value="unread" label="Unread" count={unreadCount} />
            <FilterButton 
              value="trading" 
              label="Trading" 
              count={notifications.filter(n => ['bid_received', 'bid_accepted', 'bid_rejected', 'trade_completed'].includes(n.type)).length}
            />
            <FilterButton 
              value="system" 
              label="System" 
              count={notifications.filter(n => ['system', 'announcement', 'kyc_update'].includes(n.type)).length}
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-6 pt-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-500">
              {activeFilter === 'all' 
                ? "You're all caught up!"
                : `No ${activeFilter} notifications found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onDelete={() => deleteNotification(notification._id)}
                isSwiped={swipedId === notification._id}
                onSwipe={(id) => setSwipedId(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Notification Card with Swipe-to-Delete
const NotificationCard = ({ notification, onClick, onDelete, isSwiped, onSwipe }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [offset, setOffset] = useState(0);
  const cardRef = useRef(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart !== null) {
      const distance = touchStart - e.targetTouches[0].clientX;
      if (distance > 0 && distance < 100) {
        setOffset(distance);
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe) {
      setOffset(80);
      onSwipe(notification._id);
      haptic.light();
    } else {
      setOffset(0);
      onSwipe(null);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    if (!isSwiped && offset > 0) {
      setOffset(0);
    }
  }, [isSwiped, offset]);

  const getNotificationIcon = () => {
    const iconProps = { size: 20 };
    
    switch (notification.type) {
      case 'bid_received':
        return <TrendingUp {...iconProps} className="text-blue-600" />;
      case 'bid_accepted':
        return <CheckCircle {...iconProps} className="text-green-600" />;
      case 'bid_rejected':
        return <XCircle {...iconProps} className="text-red-600" />;
      case 'trade_completed':
        return <CheckCircle {...iconProps} className="text-green-600" />;
      case 'listing_created':
        return <Package {...iconProps} className="text-purple-600" />;
      case 'system':
      case 'announcement':
        return <Bell {...iconProps} className="text-gray-600" />;
      case 'kyc_update':
        return <AlertCircle {...iconProps} className="text-orange-600" />;
      default:
        return <Bell {...iconProps} className="text-gray-600" />;
    }
  };

  const getIconBgColor = () => {
    switch (notification.type) {
      case 'bid_received':
        return 'bg-blue-100';
      case 'bid_accepted':
      case 'trade_completed':
        return 'bg-green-100';
      case 'bid_rejected':
        return 'bg-red-100';
      case 'listing_created':
        return 'bg-purple-100';
      case 'kyc_update':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete Button (revealed on swipe) */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-600 flex items-center justify-center rounded-r-2xl">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <Trash2 className="w-5 h-5 text-white mb-1" />
          <span className="text-xs text-white font-semibold">Delete</span>
        </button>
      </div>

      {/* Notification Card */}
      <div
        ref={cardRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={onClick}
        className={`bg-white rounded-2xl p-4 shadow-mobile cursor-pointer transition-transform ${
          !notification.read ? 'border-l-4 border-primary-600' : ''
        }`}
        style={{
          transform: `translateX(-${offset}px)`,
          transition: touchStart ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBgColor()}`}>
            {getNotificationIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className={`font-semibold text-gray-900 text-sm ${!notification.read ? 'font-bold' : ''}`}>
                {notification.title}
              </h3>
              {!notification.read && (
                <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 ml-2 mt-1.5" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(notification.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
