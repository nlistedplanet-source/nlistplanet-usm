import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package,
  Send,
  Inbox,
  Bell,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { haptic } from '../../utils/helpers';

const ActivityPage = () => {
  const navigate = useNavigate();

  const activitySections = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View all your notifications and updates',
      icon: Bell,
      iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconColor: 'text-orange-700',
      path: '/notifications',
    },
    {
      id: 'my-posts',
      title: 'My Posts',
      description: 'View and manage your active listings',
      icon: Package,
      iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconColor: 'text-purple-700',
      path: '/my-posts',
    },
    {
      id: 'bids',
      title: 'My Bids',
      description: 'Track bids and offers you have sent',
      icon: Send,
      iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconColor: 'text-blue-700',
      path: '/bids',
    },
    {
      id: 'offers',
      title: 'Offers Received',
      description: 'Review and manage offers on your posts',
      icon: Inbox,
      iconBg: 'bg-gradient-to-br from-green-50 to-green-100',
      iconColor: 'text-green-700',
      path: '/offers',
    },
  ];

  const handleCardClick = (path) => {
    haptic.light();
    navigate(path);
  };

  return (
    <div className="min-h-screen-nav bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-6 pt-safe pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
          <p className="text-gray-500 mt-1">Manage your trading activities</p>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="px-6 pt-6 space-y-4">
        {activitySections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => handleCardClick(section.path)}
              className="w-full bg-white rounded-2xl p-5 shadow-mobile active:scale-98 transition-transform text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${section.iconBg}`}>
                  <Icon className={`w-7 h-7 ${section.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats (Optional - can be populated with real data later) */}
      <div className="px-6 mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-mobile">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Bell className="w-5 h-5 text-orange-700" />
            </div>
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-1">Unread</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-mobile">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Package className="w-5 h-5 text-purple-700" />
            </div>
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-1">Posts</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-mobile">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Send className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-1">Bids</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-mobile">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Inbox className="w-5 h-5 text-green-700" />
            </div>
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-1">Offers</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 mt-8">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Start Trading</h3>
              <p className="text-sm text-white/90">Browse the marketplace to find shares</p>
            </div>
          </div>
          <button
            onClick={() => {
              haptic.medium();
              navigate('/marketplace');
            }}
            className="w-full bg-white text-primary-700 rounded-xl py-3 px-6 font-semibold mt-4 hover:bg-white/90 transition-colors touch-feedback"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
