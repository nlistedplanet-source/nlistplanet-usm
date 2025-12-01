import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Bell,
  Shield,
  FileText,
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Vibrate
} from 'lucide-react';
import { haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [theme, setTheme] = useState('light');

  const handleNotificationToggle = () => {
    haptic.light();
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
  };

  const handleHapticToggle = () => {
    if (hapticEnabled) {
      haptic.light();
    }
    setHapticEnabled(!hapticEnabled);
    toast.success(`Haptic feedback ${!hapticEnabled ? 'enabled' : 'disabled'}`);
  };

  const handleThemeChange = () => {
    haptic.light();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    toast('Dark mode coming soon!', { icon: '🌙' });
  };

  const navigateToPage = (path) => {
    haptic.light();
    navigate(path);
  };

  const SettingItem = ({ icon: Icon, title, subtitle, onClick, rightElement }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors touch-feedback"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-gray-900">{title}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {rightElement || <ChevronRight className="w-5 h-5 text-gray-400" />}
    </button>
  );

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-primary-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 pt-safe pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                haptic.light();
                navigate(-1);
              }}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center touch-feedback"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6">
        {/* App Preferences */}
        <div className="bg-white rounded-2xl shadow-mobile mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">App Preferences</h2>
          </div>

          <SettingItem
            icon={Bell}
            title="Notifications"
            subtitle="Receive updates about your trades"
            onClick={handleNotificationToggle}
            rightElement={<ToggleSwitch enabled={notificationsEnabled} onToggle={handleNotificationToggle} />}
          />

          <div className="border-t border-gray-100">
            <SettingItem
              icon={Vibrate}
              title="Haptic Feedback"
              subtitle="Vibration on button taps"
              onClick={handleHapticToggle}
              rightElement={<ToggleSwitch enabled={hapticEnabled} onToggle={handleHapticToggle} />}
            />
          </div>

          <div className="border-t border-gray-100">
            <SettingItem
              icon={theme === 'light' ? Moon : Sun}
              title="Dark Mode"
              subtitle="Coming soon"
              onClick={handleThemeChange}
              rightElement={
                <span className="text-sm text-gray-400 font-semibold">Soon</span>
              }
            />
          </div>

          <div className="border-t border-gray-100">
            <SettingItem
              icon={Globe}
              title="Language"
              subtitle="English (US)"
              onClick={() => toast('More languages coming soon!', { icon: '🌍' })}
            />
          </div>
        </div>

        {/* Legal & Support */}
        <div className="bg-white rounded-2xl shadow-mobile mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Legal & Support</h2>
          </div>

          <SettingItem
            icon={Shield}
            title="Privacy Policy"
            subtitle="How we handle your data"
            onClick={() => toast('Opening Privacy Policy...', { icon: '📄' })}
          />

          <div className="border-t border-gray-100">
            <SettingItem
              icon={FileText}
              title="Terms of Service"
              subtitle="Platform terms and conditions"
              onClick={() => toast('Opening Terms of Service...', { icon: '📋' })}
            />
          </div>

          <div className="border-t border-gray-100">
            <SettingItem
              icon={HelpCircle}
              title="Help & Support"
              subtitle="Get help with your account"
              onClick={() => toast('Support: support@nlistplanet.com', { icon: '💬' })}
            />
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-2xl shadow-mobile p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-bold text-primary-700">NP</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">NlistPlanet Mobile</h3>
          <p className="text-sm text-gray-500 mb-1">Version 1.0.0</p>
          <p className="text-xs text-gray-400">© 2025 NlistPlanet. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
