import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Key, LogOut, MapPin, Building2, CreditCard, Users, X, Check, Shuffle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfileTab = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  const [profileData, setProfileData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    accountType: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    nomineeName: '',
    nomineeRelationship: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sync with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        country: user.country || 'India',
        accountType: user.bankAccount?.accountType || '',
        accountNumber: user.bankAccount?.accountNumber || '',
        ifsc: user.bankAccount?.ifsc || '',
        bankName: user.bankAccount?.bankName || '',
        nomineeName: user.nominee?.name || '',
        nomineeRelationship: user.nominee?.relationship || ''
      });
    }
  }, [user]);

  // Auto-format DOB with slashes
  const handleDOBChange = (value) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5) {
      cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5, 9);
    }
    setProfileData({ ...profileData, dob: cleaned });
  };

  // Generate random username
  const generateUsername = () => {
    const adjectives = ['cool', 'smart', 'fast', 'wise', 'bold', 'brave', 'swift', 'sharp'];
    const nouns = ['tiger', 'eagle', 'shark', 'wolf', 'lion', 'hawk', 'bear', 'fox'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999);
    const newUsername = `${randomAdj}${randomNoun}${randomNum}`;
    setProfileData({ ...profileData, username: newUsername });
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await updateProfile(profileData);
      if (success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-purple-600 text-3xl font-bold">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.fullName || 'User'}</h2>
              <p className="text-purple-100">@{user.username}</p>
              <p className="text-sm text-purple-200">User ID: {user.userId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            )}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Key size={18} />
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Edit Mode */}
      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  // Reset to user data
                  setProfileData({
                    username: user.username || '',
                    fullName: user.fullName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    dob: user.dob || '',
                    gender: user.gender || '',
                    addressLine1: user.addressLine1 || '',
                    addressLine2: user.addressLine2 || '',
                    city: user.city || '',
                    state: user.state || '',
                    pincode: user.pincode || '',
                    country: user.country || 'India',
                    accountType: user.bankAccount?.accountType || '',
                    accountNumber: user.bankAccount?.accountNumber || '',
                    ifsc: user.bankAccount?.ifsc || '',
                    bankName: user.bankAccount?.bankName || '',
                    nomineeName: user.nominee?.name || '',
                    nomineeRelationship: user.nominee?.relationship || ''
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-purple-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profileData.username}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={generateUsername}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      title="Generate new username"
                    >
                      <Shuffle size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setProfileData({ ...profileData, phone: value });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength="10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={profileData.dob}
                    onChange={(e) => handleDOBChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    maxLength="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-green-600" />
                Address Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={profileData.addressLine1}
                    onChange={(e) => setProfileData({ ...profileData, addressLine1: e.target.value })}
                    placeholder="House/Flat No, Building Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={profileData.addressLine2}
                    onChange={(e) => setProfileData({ ...profileData, addressLine2: e.target.value })}
                    placeholder="Street, Area, Locality"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={profileData.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setProfileData({ ...profileData, pincode: value });
                      }
                    }}
                    maxLength="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-blue-600" />
                Bank Account Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    value={profileData.accountType}
                    onChange={(e) => setProfileData({ ...profileData, accountType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={profileData.accountNumber}
                    onChange={(e) => setProfileData({ ...profileData, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={profileData.ifsc}
                    onChange={(e) => setProfileData({ ...profileData, ifsc: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={profileData.bankName}
                    onChange={(e) => setProfileData({ ...profileData, bankName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Nominee Details */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-orange-600" />
                Nominee Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Name</label>
                  <input
                    type="text"
                    value={profileData.nomineeName}
                    onChange={(e) => setProfileData({ ...profileData, nomineeName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={profileData.nomineeRelationship}
                    onChange={(e) => setProfileData({ ...profileData, nomineeRelationship: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'personal'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setActiveTab('bank')}
                className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'bank'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Bank & Finance
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'documents'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                CLM & Documents
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField icon={<Mail size={16} />} label="Email" value={user.email} />
                <InfoField icon={<Phone size={16} />} label="Mobile" value={user.phone} />
                <InfoField icon={<User size={16} />} label="Date of Birth" value={user.dob || '—'} />
                <InfoField icon={<User size={16} />} label="Gender" value={user.gender || '—'} />
                <InfoField icon={<MapPin size={16} />} label="Address Line 1" value={user.addressLine1 || '—'} />
                <InfoField icon={<MapPin size={16} />} label="Address Line 2" value={user.addressLine2 || '—'} />
                <InfoField icon={<Building2 size={16} />} label="City" value={user.city || '—'} />
                <InfoField icon={<Building2 size={16} />} label="State" value={user.state || '—'} />
                <InfoField icon={<MapPin size={16} />} label="Pincode" value={user.pincode || '—'} />
                <InfoField icon={<Building2 size={16} />} label="Country" value={user.country || 'India'} />
              </div>
            )}

            {/* Bank Tab */}
            {activeTab === 'bank' && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Bank Account</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <InfoField icon={<CreditCard size={16} />} label="Account Type" value={user.bankAccount?.accountType || '—'} />
                  <InfoField icon={<CreditCard size={16} />} label="Account Number" value={user.bankAccount?.accountNumber || '—'} />
                  <InfoField icon={<Building2 size={16} />} label="IFSC Code" value={user.bankAccount?.ifsc || '—'} />
                  <InfoField icon={<Building2 size={16} />} label="Bank Name" value={user.bankAccount?.bankName || '—'} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Nominee</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField icon={<Users size={16} />} label="Nominee Name" value={user.nominee?.name || '—'} />
                  <InfoField icon={<Users size={16} />} label="Relationship" value={user.nominee?.relationship || '—'} />
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="text-center py-12">
                <p className="text-gray-500">CLM & Documents section coming soon...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  minLength="6"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl p-6 text-center shadow-md">
          <p className="text-4xl font-bold text-purple-600">{user.referralCount || 0}</p>
          <p className="text-gray-600 mt-2">Referrals</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-md">
          <p className="text-4xl font-bold text-green-600">₹{user.earnings || 0}</p>
          <p className="text-gray-600 mt-2">Earnings</p>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying info fields
const InfoField = ({ icon, label, value }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

export default ProfileTab;
