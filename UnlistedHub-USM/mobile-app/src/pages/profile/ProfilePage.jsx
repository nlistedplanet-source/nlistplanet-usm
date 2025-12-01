import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail,
  Phone,
  Calendar,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle,
  XCircle,
  Gift,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { BrandLogo } from '../../components/common';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    haptic.medium();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    haptic.success();
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'kyc',
      icon: Shield,
      label: 'KYC Verification',
      description: user?.kycStatus === 'verified' ? 'Verified' : 'Not verified',
      badge: user?.kycStatus === 'verified' ? 'verified' : user?.kycStatus === 'pending' ? 'pending' : null,
      onClick: () => {
        haptic.light();
        navigate('/kyc');
      }
    },
    {
      id: 'referrals',
      icon: Gift,
      label: 'Referrals',
      description: 'Invite friends and earn',
      onClick: () => {
        haptic.light();
        navigate('/referrals');
      }
    },
    {
      id: 'settings',
      icon: Bell,
      label: 'Settings',
      description: 'App preferences and notifications',
      onClick: () => {
        haptic.light();
        navigate('/settings');
      }
    },
    {
      id: 'privacy',
      icon: FileText,
      label: 'Privacy Policy',
      description: 'View privacy terms',
      onClick: () => {
        haptic.light();
        toast('Opening Privacy Policy...', { icon: '📄' });
      }
    },
    {
      id: 'terms',
      icon: FileText,
      label: 'Terms of Service',
      description: 'View terms and conditions',
      onClick: () => {
        haptic.light();
        toast('Opening Terms of Service...', { icon: '📋' });
      }
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help with your account',
      onClick: () => {
        haptic.light();
        toast('Support: support@nlistplanet.com', { icon: '💬' });
      }
    },
  ];

  return (
    <div className="min-h-screen-nav bg-gray-50 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 pt-safe pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar with Logo Overlay */}
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-primary-700">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1">
              <BrandLogo size={28} className="rounded-full shadow-md" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              {user?.fullName || 'User'}
            </h1>
            <p className="text-primary-100 text-sm">@{user?.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{user?.stats?.activePosts || 0}</p>
            <p className="text-primary-100 text-xs mt-1">Active Posts</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{user?.stats?.completedTrades || 0}</p>
            <p className="text-primary-100 text-xs mt-1">Completed</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{user?.stats?.referrals || 0}</p>
            <p className="text-primary-100 text-xs mt-1">Referrals</p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="px-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Account Information</h2>
        <div className="bg-white rounded-2xl shadow-mobile overflow-hidden">
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={Phone} label="Phone" value={user?.phone || 'Not provided'} />
          <InfoRow 
            icon={Calendar} 
            label="Member Since" 
            value={formatDate(user?.createdAt)} 
          />
          <InfoRow 
            icon={Shield} 
            label="KYC Status" 
            value={
              <div className="flex items-center gap-2">
                {user?.kycStatus === 'verified' ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-green-600 font-semibold">Verified</span>
                  </>
                ) : user?.kycStatus === 'pending' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-yellow-600 font-semibold">Pending</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-600" />
                    <span className="text-red-600 font-semibold">Not Verified</span>
                  </>
                )}
              </div>
            }
            isLast
          />
        </div>
      </div>

      {/* Settings & Actions */}
      <div className="px-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Settings & Support</h2>
        <div className="bg-white rounded-2xl shadow-mobile overflow-hidden">
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              description={item.description}
              badge={item.badge}
              onClick={() => {
                haptic.light();
                item.onClick();
              }}
              isLast={index === menuItems.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-6 mt-6 mb-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 rounded-2xl p-4 font-semibold flex items-center justify-center gap-3 touch-feedback border-2 border-red-100"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Logout Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  haptic.light();
                  setShowLogoutConfirm(false);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold touch-feedback"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold touch-feedback"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Info Row Component
const InfoRow = ({ icon: Icon, label, value, isLast }) => (
  <div className={`flex items-center gap-4 p-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon size={20} className="text-gray-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-900 font-medium truncate">{value}</p>
    </div>
  </div>
);

// Menu Item Component
const MenuItem = ({ icon: Icon, label, description, badge, onClick, isLast }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 text-left touch-feedback ${
      !isLast ? 'border-b border-gray-100' : ''
    }`}
  >
    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon size={20} className="text-primary-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    {badge && (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        badge === 'verified' 
          ? 'bg-green-50 text-green-700' 
          : 'bg-yellow-50 text-yellow-700'
      }`}>
        {badge}
      </span>
    )}
    <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
  </button>
);

export default ProfilePage;
