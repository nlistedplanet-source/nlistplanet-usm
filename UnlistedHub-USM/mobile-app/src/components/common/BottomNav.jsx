import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, PlusCircle, Bell, User } from 'lucide-react';
import { notificationsAPI } from '../../utils/api';
import { haptic } from '../../utils/helpers';
import CreateListingModal from '../modals/CreateListingModal';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch unread notifications
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await notificationsAPI.getAll({ limit: 1 });
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Every 30s
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: TrendingUp, label: 'Market', path: '/marketplace' },
    { icon: PlusCircle, label: 'Post', path: '/create', highlight: true },
    { icon: Bell, label: 'Activity', path: '/activity', badge: unreadCount },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    haptic.light();
    
    if (path === '/create') {
      setShowCreateModal(true);
    } else {
      navigate(path);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    navigate('/marketplace'); // Navigate to marketplace after creating listing
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-all relative touch-feedback ${
                item.highlight 
                  ? 'text-primary-600' 
                  : active 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-500'
              }`}
              style={{ minHeight: '64px' }}
            >
              <div className="relative">
                <Icon 
                  size={item.highlight ? 28 : 24} 
                  strokeWidth={active || item.highlight ? 2.5 : 2}
                  className={item.highlight && !active ? 'animate-pulse' : ''}
                />
                {item.badge > 0 && (
                  <span className="badge animate-scale-in">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1.5 ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>

    {/* Create Listing Modal */}
    <CreateListingModal 
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onSuccess={handleCreateSuccess}
    />
    </>
  );
};

export default BottomNav;
