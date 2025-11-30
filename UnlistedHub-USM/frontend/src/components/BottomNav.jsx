import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  PlusCircle, 
  Bell, 
  Menu,
  X,
  Package,
  Send,
  Inbox,
  Gift,
  User,
  Briefcase,
  ChevronRight,
  LogOut,
  Settings,
  Users,
  Building2,
  ShoppingCart,
  BarChart3,
  Radio,
  Shield
} from 'lucide-react';
import { notificationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsAPI.getAll({ limit: 1 });
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setShowMenu(false);
  }, [location]);

  const mainNavItems = [
    { icon: Home, label: 'Home', path: '/dashboard?tab=overview' },
    { icon: TrendingUp, label: 'Market', path: '/dashboard?tab=marketplace' },
    { icon: PlusCircle, label: 'Post', path: '/dashboard?tab=posts', highlight: true },
    { icon: Bell, label: 'Activity', path: '/dashboard?tab=notifications', badge: unreadCount },
    { icon: Menu, label: 'Menu', action: 'menu' },
  ];

  const menuItems = [
    { 
      title: 'Trading',
      items: [
        { icon: Briefcase, label: 'Portfolio', path: '/dashboard?tab=portfolio' },
        { icon: Package, label: 'My Posts', path: '/dashboard?tab=posts' },
        { icon: Send, label: 'My Bids/Offers', path: '/dashboard?tab=my-bids-offers' },
        { icon: Inbox, label: 'Received Bids', path: '/dashboard?tab=received-bids-offers' },
      ]
    },
    { 
      title: 'Account',
      items: [
        { icon: Gift, label: 'Referrals', path: '/dashboard?tab=referrals' },
        { icon: User, label: 'Profile', path: '/dashboard?tab=profile' },
      ]
    }
  ];

  // Add admin menu section if user is admin
  if (user?.role === 'admin') {
    menuItems.push({
      title: 'Admin Panel',
      items: [
        { icon: Users, label: 'Users', path: '/dashboard?tab=admin-users' },
        { icon: ShoppingCart, label: 'Listings', path: '/dashboard?tab=admin-listings' },
        { icon: BarChart3, label: 'Transactions', path: '/dashboard?tab=admin-transactions' },
        { icon: Building2, label: 'Companies', path: '/dashboard?tab=admin-companies' },
        { icon: Radio, label: 'Ads', path: '/dashboard?tab=admin-ads' },
        { icon: Gift, label: 'Referral Tracking', path: '/dashboard?tab=admin-referrals' },
        { icon: BarChart3, label: 'Reports', path: '/dashboard?tab=admin-reports' },
        { icon: Shield, label: 'Settings', path: '/dashboard?tab=admin-settings' },
      ]
    });
  }

  const getCurrentTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
  };

  const isActive = (path) => {
    if (!path) return false;
    const params = new URLSearchParams(path.split('?')[1]);
    const targetTab = params.get('tab');
    const currentTab = getCurrentTab();
    return targetTab === currentTab;
  };

  const handleNavClick = (item) => {
    if (item.action === 'menu') {
      setShowMenu(true);
    } else {
      navigate(item.path);
    }
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom block md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={index}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center flex-1 py-2 rounded-lg transition-all relative ${
                  item.highlight 
                    ? 'text-purple-600' 
                    : active 
                    ? 'text-purple-600' 
                    : 'text-gray-500'
                }`}
                style={{ minHeight: '60px' }}
              >
                <div className="relative">
                  <Icon 
                    size={item.highlight ? 28 : 24} 
                    strokeWidth={active ? 2.5 : 2}
                    className={item.highlight ? 'animate-pulse' : ''}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-semibold">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 ${active ? 'font-semibold' : 'font-normal'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Full-Screen Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 z-50 block md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden animate-slideUp">
            {/* Menu Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <p className="text-sm text-gray-500">@{user?.username || 'User'}</p>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] pb-4">
              {menuItems.map((section, sectionIndex) => (
                <div key={sectionIndex} className="px-4 py-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      
                      return (
                        <button
                          key={itemIndex}
                          onClick={() => handleMenuItemClick(item.path)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            active 
                              ? 'bg-purple-50 text-purple-600' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                          <span className={`flex-1 text-left ${active ? 'font-semibold' : 'font-medium'}`}>
                            {item.label}
                          </span>
                          <ChevronRight size={18} className="text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Logout Button */}
              <div className="px-4 py-3 border-t border-gray-200 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium"
                >
                  <LogOut size={20} />
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;
