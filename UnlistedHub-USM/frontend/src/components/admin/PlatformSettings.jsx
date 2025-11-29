import React, { useState, useEffect } from 'react';
import { Settings, Save, DollarSign, Users, Bell, Shield, TrendingUp, Clock, Mail, Phone, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';

const PlatformSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platformFeePercentage: 2,
    boostFeeAmount: 500,
    boostDurationDays: 7,
    maxListingsPerUser: 10,
    listingExpiryDays: 30,
    referralCommissionPercentage: 1,
    maintenanceMode: false,
    maintenanceMessage: '',
    supportEmail: '',
    contactPhone: '',
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    minTradeAmount: 1000,
    maxTradeAmount: 10000000
  });

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      setSettings(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch settings');
      console.error('Fetch settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle input change
  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save settings
  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Save settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="text-gray-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          </div>
          <p className="text-sm text-gray-600">Configure platform fees, limits, and general settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Platform Fees Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={18} className="text-green-600" />
            <h2 className="text-base font-bold text-gray-900">Platform Fees</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Platform Fee (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.platformFeePercentage}
                onChange={(e) => handleChange('platformFeePercentage', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-0.5">Fee charged on each transaction</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Boost Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={settings.boostFeeAmount}
                onChange={(e) => handleChange('boostFeeAmount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-0.5">Fee to boost a listing</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Boost Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.boostDurationDays}
                onChange={(e) => handleChange('boostDurationDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-0.5">How long boost lasts</p>
            </div>
          </div>
        </div>

        {/* Listing Limits Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Listing Limits</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max Listings Per User
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maxListingsPerUser}
                onChange={(e) => handleChange('maxListingsPerUser', parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-0.5">Maximum active listings allowed</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Listing Expiry (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.listingExpiryDays}
                onChange={(e) => handleChange('listingExpiryDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-0.5">Days before listing expires</p>
            </div>
          </div>
        </div>

        {/* Trading Limits Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-purple-600" />
            <h2 className="text-base font-bold text-gray-900">Trading Limits</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Minimum Trade Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={settings.minTradeAmount}
                onChange={(e) => handleChange('minTradeAmount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-0.5">Minimum transaction value</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Maximum Trade Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={settings.maxTradeAmount}
                onChange={(e) => handleChange('maxTradeAmount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-0.5">Maximum transaction value</p>
            </div>
          </div>
        </div>

        {/* Referral Settings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-orange-600" />
            <h2 className="text-base font-bold text-gray-900">Referral Program</h2>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Referral Commission (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.referralCommissionPercentage}
              onChange={(e) => handleChange('referralCommissionPercentage', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-0.5">Commission earned by referrer on platform fees</p>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Phone size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900">Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Mail size={12} className="inline mr-1" />
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="support@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Phone size={12} className="inline mr-1" />
                Contact Phone
              </label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+91 1234567890"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-yellow-600" />
            <h2 className="text-base font-bold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotificationsEnabled}
                onChange={(e) => handleChange('emailNotificationsEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Email Notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotificationsEnabled}
                onChange={(e) => handleChange('smsNotificationsEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable SMS Notifications</span>
            </label>
          </div>
        </div>

        {/* Maintenance Mode Section */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="text-base font-bold text-gray-900">Maintenance Mode</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-semibold text-red-700">Enable Maintenance Mode</span>
            </label>
            {settings.maintenanceMode && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Maintenance Message
                </label>
                <textarea
                  value={settings.maintenanceMessage}
                  onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Platform is under maintenance..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-sm"
          >
            <Save size={16} />
            {saving ? 'Saving Changes...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
