import React, { useState } from 'react';
import { User, Mail, Phone, Edit2, Key, LogOut, Save, FileText, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfileTab = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user.username,
    fullName: user.fullName,
    phone: user.phone
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await updateProfile(profileData);
    if (success) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const success = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (success) {
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-dark-900 mb-6">Profile Settings</h2>

      {/* Profile Card */}
      <div className="card-mobile mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-700 font-bold text-3xl">
                {user.username[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-dark-900">@{user.username}</h3>
            <p className="text-sm text-dark-600">{user.email}</p>
            <p className="text-xs text-dark-500 mt-1">User ID: {user._id?.slice(-8).toUpperCase()}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role === 'admin' ? 'Admin' : 'User'}
              </span>
              {user.kycStatus === 'approved' && (
                <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                  <Shield size={12} />
                  KYC Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="input-mobile"
                required
                minLength="3"
                maxLength="20"
                pattern="[a-zA-Z0-9_]+"
                title="Only letters, numbers and underscore allowed"
              />
              <p className="text-xs text-dark-500 mt-1">You can change your username anytime</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="input-mobile"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="input-mobile"
                required
                maxLength="10"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-mobile btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setProfileData({
                    username: user.username,
                    fullName: user.fullName,
                    phone: user.phone
                  });
                }}
                className="btn-mobile btn-secondary px-6"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg">
              <User size={20} className="text-dark-500" />
              <div className="flex-1">
                <p className="text-xs text-dark-500">Username</p>
                <p className="font-semibold text-dark-900">@{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg">
              <FileText size={20} className="text-dark-500" />
              <div className="flex-1">
                <p className="text-xs text-dark-500">User ID (Non-editable)</p>
                <p className="font-semibold text-dark-900 font-mono">{user._id?.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg">
              <User size={20} className="text-dark-500" />
              <div>
                <p className="text-xs text-dark-500">Full Name</p>
                <p className="font-semibold text-dark-900">{user.fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg">
              <Mail size={20} className="text-dark-500" />
              <div>
                <p className="text-xs text-dark-500">Email</p>
                <p className="font-semibold text-dark-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg">
              <Phone size={20} className="text-dark-500" />
              <div>
                <p className="text-xs text-dark-500">Phone</p>
                <p className="font-semibold text-dark-900">{user.phone}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full btn-mobile btn-secondary flex items-center justify-center gap-2"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Account Stats */}
      <div className="card-mobile mb-6">
        <h3 className="font-bold text-dark-900 mb-4">Account Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-dark-50 rounded-lg">
            <p className="text-2xl font-bold text-primary-600">{user.totalReferrals || 0}</p>
            <p className="text-sm text-dark-600 mt-1">Referrals</p>
          </div>
          <div className="text-center p-3 bg-dark-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">₹{user.totalEarnings || 0}</p>
            <p className="text-sm text-dark-600 mt-1">Earnings</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => setShowKYCModal(true)}
          className="w-full card-mobile flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Shield size={20} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-dark-900">KYC Verification</p>
            <p className="text-xs text-dark-500">
              {user.kycStatus === 'approved' ? 'Verified ✓' : 
               user.kycStatus === 'pending' ? 'Under Review' : 
               'Complete your KYC'}
            </p>
          </div>
        </button>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full card-mobile flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Key size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-dark-900">Change Password</p>
            <p className="text-xs text-dark-500">Update your account password</p>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="w-full card-mobile flex items-center gap-3 text-left hover:bg-red-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <LogOut size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-600">Logout</p>
            <p className="text-xs text-dark-500">Sign out of your account</p>
          </div>
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowPasswordModal(false)} />
          <div className="bottom-sheet p-6">
            <h3 className="text-2xl font-bold text-dark-900 mb-6">Change Password</h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-mobile"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-mobile"
                  required
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input-mobile"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-mobile btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Key size={18} />
                      Change Password
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn-mobile btn-secondary px-6"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* KYC Verification Modal */}
      {showKYCModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowKYCModal(false)} />
          <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
            <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto md:max-w-2xl md:w-full md:mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-dark-900">KYC Verification</h3>
                <button 
                  onClick={() => setShowKYCModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* KYC Status */}
              {user.kycStatus === 'approved' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Shield size={24} className="text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">KYC Verified ✓</p>
                      <p className="text-sm text-green-700">Your account is fully verified</p>
                    </div>
                  </div>
                </div>
              ) : user.kycStatus === 'pending' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Shield size={24} className="text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-900">Under Review</p>
                      <p className="text-sm text-yellow-700">Your KYC documents are being verified by admin</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Shield size={24} className="text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">Complete Your KYC</p>
                      <p className="text-sm text-blue-700">Upload required documents to verify your identity</p>
                    </div>
                  </div>
                </div>
              )}

              {/* KYC Form - Only show if not approved */}
              {user.kycStatus !== 'approved' && (
                <div className="space-y-6">
                  {/* Step 1: PAN Card */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h4 className="font-bold text-dark-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                      PAN Card
                    </h4>
                    <p className="text-sm text-dark-600 mb-4">Upload your PAN card. We'll extract: Name, DOB, PAN No, Father's Name</p>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>

                  {/* Step 2: Aadhaar Card */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h4 className="font-bold text-dark-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                      Aadhaar Card (Masked)
                    </h4>
                    <p className="text-sm text-dark-600 mb-2">Upload masked Aadhaar. We'll extract: Address, Last 4 digits</p>
                    <p className="text-xs text-orange-600 mb-4">⚠️ System will auto-mask if you upload unmasked Aadhaar</p>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-xs text-dark-500 mt-2">✓ Name must match with PAN card</p>
                  </div>

                  {/* Step 3: Bank Document */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h4 className="font-bold text-dark-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                      Bank Document (Cheque/Passbook)
                    </h4>
                    <p className="text-sm text-dark-600 mb-4">Upload cancelled cheque or bank passbook. We'll extract: Account holder name, Account number, IFSC, MICR, Branch</p>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-xs text-dark-500 mt-2">✓ Account holder name must match with PAN</p>
                  </div>

                  {/* Step 4: CDSL Statement */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h4 className="font-bold text-dark-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
                      CDSL/NSDL Statement (CLM Copy)
                    </h4>
                    <p className="text-sm text-dark-600 mb-4">Upload CDSL statement. We'll extract: DP ID</p>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-xs text-dark-500 mt-2">✓ Name must match with PAN</p>
                  </div>

                  {/* Validation Info */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-amber-900 mb-2">📋 Validation Rules:</p>
                    <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                      <li>PAN name must match with Aadhaar name</li>
                      <li>PAN name must match with Bank account holder name</li>
                      <li>PAN name must match with CDSL statement name</li>
                      <li>If names don't match, KYC will be sent to admin for manual approval</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    disabled={user.kycStatus === 'pending'}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Shield size={20} />
                    {user.kycStatus === 'pending' ? 'Submitted - Under Review' : 'Submit KYC Documents'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileTab;