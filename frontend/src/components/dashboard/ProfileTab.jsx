import React, { useState } from 'react';
import { User, Mail, Phone, Edit2, Key, LogOut, Shield, Shuffle, Calendar, MapPin, Briefcase, Building, Users, CreditCard, FileText, CheckCircle, XCircle, AlertCircle, Bell, Palette, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { kycAPI } from '../../utils/api';

const ProfileTab = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

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

  const getDocumentStatusIcon = (docStatus) => {
    switch (docStatus) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'pending':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <XCircle size={16} className="text-gray-400" />;
    }
  };

  const getDocumentStatusText = (docStatus) => {
    switch (docStatus) {
      case 'approved':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Uploaded';
    }
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
            <p className="text-xs text-dark-500 mt-1">User ID: {user.userId || user._id?.slice(-8).toUpperCase()}</p>
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedUsername}
                  readOnly
                  className="input-mobile flex-1 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={handleShuffleUsername}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold"
                >
                  🔄 Shuffle
                </button>
              </div>
              <p className="text-xs text-dark-500 mt-1">Click shuffle to generate new username suggestions</p>
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={16} />
                    Save
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setGeneratedUsername(user.username);
                  setProfileData({
                    username: user.username,
                    fullName: user.fullName,
                    phone: user.phone
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold"
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
                <p className="font-semibold text-dark-900 font-mono">{user.userId || user._id?.slice(-8).toUpperCase()}</p>
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

      {/* KYC Verification Section - Inline */}
      <div className="card-mobile mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-dark-900 flex items-center gap-2">
            <Shield size={20} className="text-purple-600" />
            KYC Verification
          </h3>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            user.kycStatus === 'approved' ? 'bg-green-100 text-green-700' :
            user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {user.kycStatus === 'approved' ? 'Verified ✓' :
             user.kycStatus === 'pending' ? 'Under Review' :
             'Not Started'}
          </span>
        </div>

        {/* KYC Status Banner */}
        {user.kycStatus === 'approved' ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-green-600" />
              <div>
                <p className="font-semibold text-green-900">KYC Verified ✓</p>
                <p className="text-sm text-green-700">Your account is fully verified</p>
              </div>
            </div>
          </div>
        ) : user.kycStatus === 'pending' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">Under Review</p>
                <p className="text-sm text-yellow-700">Your KYC documents are being verified by admin</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
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
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-dark-900">Step {currentStep} of 4</span>
                <span className="text-xs text-dark-600">{Math.round((currentStep / 4) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Step 1: PAN Card */}
            {currentStep === 1 && (
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-dark-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                  PAN Card
                </h4>
                <p className="text-sm text-dark-600 mb-4">Upload your PAN card. We'll extract: Name, DOB, PAN No, Father's Name</p>
                
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload('pan', e)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-4"
                />

                {/* Preview */}
                {kycDocuments.pan.preview && (
                  <div className="mt-4 space-y-3">
                    <img src={kycDocuments.pan.preview} alt="PAN Preview" className="w-full h-48 object-cover rounded-lg border" />
                    
                    {/* Extracted Data */}
                    {kycDocuments.pan.extracted && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-green-900 mb-2">✓ Data Extracted:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-dark-600">Name:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.pan.extracted.name}</p>
                          </div>
                          <div>
                            <span className="text-dark-600">DOB:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.pan.extracted.dob}</p>
                          </div>
                          <div>
                            <span className="text-dark-600">PAN No:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.pan.extracted.panNo}</p>
                          </div>
                          <div>
                            <span className="text-dark-600">Father's Name:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.pan.extracted.fatherName}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Aadhaar Card */}
            {currentStep === 2 && (
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-dark-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Aadhaar Card (Masked)
                </h4>
                <p className="text-sm text-dark-600 mb-2">Upload masked Aadhaar. We'll extract: Address, Last 4 digits</p>
                <p className="text-xs text-orange-600 mb-4">⚠️ System will auto-mask if you upload unmasked Aadhaar</p>
                
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload('aadhaar', e)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-4"
                />
                <p className="text-xs text-dark-500 mb-4">✓ Name must match with PAN card</p>

                {/* Preview */}
                {kycDocuments.aadhaar.preview && (
                  <div className="mt-4 space-y-3">
                    <img src={kycDocuments.aadhaar.preview} alt="Aadhaar Preview" className="w-full h-48 object-cover rounded-lg border" />
                    
                    {/* Extracted Data */}
                    {kycDocuments.aadhaar.extracted && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-green-900 mb-2">✓ Data Extracted:</p>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-dark-600">Address:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.aadhaar.extracted.address}</p>
                          </div>
                          <div>
                            <span className="text-dark-600">Last 4 Digits:</span>
                            <p className="font-semibold text-dark-900">XXXX-XXXX-{kycDocuments.aadhaar.extracted.last4Digits}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Bank Document */}
            {currentStep === 3 && (
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-dark-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Bank Document (Cheque/Passbook)
                </h4>
                <p className="text-sm text-dark-600 mb-4">Upload cancelled cheque or bank passbook. We'll extract: Account holder name, Account number, IFSC, MICR, Branch</p>
                
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload('bank', e)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-4"
                />
                <p className="text-xs text-dark-500 mb-4">✓ Account holder name must match with PAN</p>

                {/* Preview */}
                {kycDocuments.bank.preview && (
                  <div className="mt-4 space-y-3">
                    <img src={kycDocuments.bank.preview} alt="Bank Preview" className="w-full h-48 object-cover rounded-lg border" />
                    
                    {/* Extracted Data */}
                    {kycDocuments.bank.extracted && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-green-900 mb-2">✓ Data Extracted:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-dark-600">Account Holder:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.bank.extracted.accountHolder}</p>
                          </div>
                          <div>
                            <span className="text-dark-600">Account No:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.bank.extracted.accountNo}</p>
                          </div>
                          <div>
                            <span className="text-dark-600">IFSC:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.bank.extracted.ifsc}</p>
                          </div>
                          <div>
                            <span className="text-dark-600">Branch:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.bank.extracted.branch}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: CDSL Statement */}
            {currentStep === 4 && (
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-dark-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
                  CDSL/NSDL Statement (CLM Copy)
                </h4>
                <p className="text-sm text-dark-600 mb-4">Upload CDSL statement. We'll extract: DP ID</p>
                
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload('demat', e)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-4"
                />
                <p className="text-xs text-dark-500 mb-4">✓ Name must match with PAN</p>

                {/* Preview */}
                {kycDocuments.demat.preview && (
                  <div className="mt-4 space-y-3">
                    <img src={kycDocuments.demat.preview} alt="CDSL Preview" className="w-full h-48 object-cover rounded-lg border" />
                    
                    {/* Extracted Data */}
                    {kycDocuments.demat.extracted && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-green-900 mb-2">✓ Data Extracted:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-dark-600">DP ID:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.demat.extracted.dpId}</p>
                          </div>
                          <div>
                            <span className="text-dark-600">Name:</span>
                            <p className="font-semibold text-dark-900">{kycDocuments.demat.extracted.name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Validation Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                  <p className="text-sm font-semibold text-amber-900 mb-2">📋 Validation Rules:</p>
                  <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                    <li>PAN name must match with Aadhaar name</li>
                    <li>PAN name must match with Bank account holder name</li>
                    <li>PAN name must match with CDSL statement name</li>
                    <li>If names don't match, KYC will be sent to admin for manual approval</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="flex-1 px-4 py-2 bg-gray-100 text-dark-900 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Save & Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitKYC}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield size={20} />
                      Submit KYC Documents
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* KYC Edit Modal */}
      {showKYCModal && (
        <KYCEditModal 
          user={user} 
          onClose={() => setShowKYCModal(false)}
          onSuccess={() => {
            setShowKYCModal(false);
            toast.success('Profile updated successfully!');
            window.location.reload(); // Reload to get updated user data
          }}
        />
      )}

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

    </div>
  );
};

// KYC Edit Modal Component
const KYCEditModal = ({ user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    userId: user.userId || user._id?.slice(-8).toUpperCase() || '',
    username: user.username || '',
    dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    gender: user.gender || '',
    addressLine1: user.address?.line1 || '',
    addressLine2: user.address?.line2 || '',
    addressLine3: user.address?.line3 || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    pincode: user.address?.pincode || '',
    country: user.address?.country || 'India',
    incomeRange: user.workIncome?.incomeRange || '',
    sourceOfWealth: user.workIncome?.sourceOfWealth || '',
    accountType: user.bankAccount?.accountType || '',
    accountNumber: user.bankAccount?.accountNumber || '',
    ifsc: user.bankAccount?.ifsc || '',
    bankName: user.bankAccount?.bankName || '',
    branch: user.bankAccount?.branch || '',
    nomineeName: user.nominee?.name || '',
    nomineeRelationship: user.nominee?.relationship || '',
    nomineeDob: user.nominee?.dob ? new Date(user.nominee.dob).toISOString().split('T')[0] : '',
    nomineeMobile: user.nominee?.mobile || '',
    nomineeSharePercentage: user.nominee?.sharePercentage || 100,
    nomineeCopyAddress: user.nominee?.copyAddress || false,
    dpId: user.dematAccount?.dpId || '',
    clientId: user.dematAccount?.clientId || '',
    agreeTerms: false
  });

  const [documents, setDocuments] = useState({
    pan: { file: null, preview: user.kycDocuments?.pan?.url || null },
    aadhaar: { file: null, preview: user.kycDocuments?.aadhaar?.url || null },
    bankProof: { file: null, preview: user.kycDocuments?.bankProof?.url || null },
    cdslStatement: { file: null, preview: user.kycDocuments?.cdslStatement?.url || null }
  });

  const generateRandomUsername = () => {
    const adjectives = ['Cool', 'Smart', 'Fast', 'Wise', 'Bold', 'Bright', 'Swift', 'Quick', 'Sharp', 'Epic'];
    const nouns = ['Tiger', 'Eagle', 'Shark', 'Wolf', 'Lion', 'Hawk', 'Bear', 'Fox', 'Panda', 'Dragon'];
    const randomNum = Math.floor(Math.random() * 999);
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdj}${randomNoun}${randomNum}`;
  };

  const handleShuffleUsername = () => {
    setFormData({ ...formData, username: generateRandomUsername() });
  };

  const handleFileUpload = (docType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments(prev => ({
        ...prev,
        [docType]: { file, preview: reader.result }
      }));
      toast.success(`${docType.toUpperCase()} uploaded`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !formData.agreeTerms) {
      toast.error('Please confirm that all information is accurate');
      return;
    }

    setLoading(true);
    try {
      const kycData = {
        fullName: formData.fullName,
        username: formData.username,
        dob: formData.dob,
        gender: formData.gender,
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          line3: formData.addressLine3,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country
        },
        workIncome: {
          incomeRange: formData.incomeRange,
          sourceOfWealth: formData.sourceOfWealth
        },
        bankAccount: {
          accountType: formData.accountType,
          accountNumber: formData.accountNumber,
          ifsc: formData.ifsc,
          bankName: formData.bankName,
          branch: formData.branch
        },
        nominee: {
          name: formData.nomineeName,
          relationship: formData.nomineeRelationship,
          dob: formData.nomineeDob,
          mobile: formData.nomineeMobile,
          sharePercentage: formData.nomineeSharePercentage,
          copyAddress: formData.nomineeCopyAddress
        },
        dematAccount: {
          dpId: formData.dpId,
          clientId: formData.clientId
        },
        documents: {
          pan: documents.pan.preview,
          aadhaar: documents.aadhaar.preview,
          bankProof: documents.bankProof.preview,
          cdslStatement: documents.cdslStatement.preview
        }
      };

      if (isDraft) {
        await kycAPI.saveDraft(kycData);
        toast.success('Draft saved successfully!');
      } else {
        await kycAPI.submitKYC(kycData);
        toast.success('KYC submitted for verification!');
        onSuccess();
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-4 z-50 bg-white rounded-2xl overflow-hidden flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600">
          <h3 className="text-2xl font-bold text-white">Complete Your KYC</h3>
          <p className="text-sm text-purple-100 mt-1">Fill all details and upload required documents</p>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Rest of the form sections will be abbreviated for space */}
            <div className="text-center p-8">
              <p className="text-dark-600">KYC Form implementation in progress...</p>
              <p className="text-sm text-dark-500 mt-2">Basic Info, Address, Work & Income, Bank, Nominee, Demat, Documents sections</p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Shield size={18} />
                Submit for Review
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileTab;