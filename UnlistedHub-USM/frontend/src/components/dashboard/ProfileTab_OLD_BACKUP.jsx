import React, { useState } from 'react';
import { User, Mail, Phone, Edit2, Key, LogOut, Shield, Shuffle, Calendar, MapPin, Briefcase, Building, Users, CreditCard, FileText, CheckCircle, XCircle, AlertCircle, Bell, Palette, Camera, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ProfileTab Component - Updated Design v2.0
const ProfileTab = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  
  // Helper function to format date as DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  // If no user, show loading or placeholder
  if (!user) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Multi-step form state
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    addressLine1: user?.addressLine1 || '',
    addressLine2: user?.addressLine2 || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    country: user?.country || 'India',
    accountType: user?.bankAccount?.accountType || '',
    accountNumber: user?.bankAccount?.accountNumber || '',
    ifsc: user?.bankAccount?.ifsc || '',
    bankName: user?.bankAccount?.bankName || '',
    nomineeName: user?.nominee?.name || '',
    nomineeRelationship: user?.nominee?.relationship || ''
  });
  const [generatedUsername, setGeneratedUsername] = useState(user?.username || '');
  const [activeInfoTab, setActiveInfoTab] = useState('personal'); // Tab state for display view
  
  // Auto-format DOB with slashes
  const handleDOBChange = (value) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // Auto-add slashes at correct positions
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5) {
      cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5, 9);
    }
    
    setProfileData({ ...profileData, dob: cleaned });
  };
  
  // Sync profileData with user object when user changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        fullName: user.fullName || '',
        phone: user.phone || ''
      });
      setGeneratedUsername(user.username || '');
    }
  }, [user]);

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
  
  // Username shuffle handler
  const generateRandomUsername = () => {
    const adjectives = ['Cool', 'Smart', 'Fast', 'Wise', 'Bold', 'Bright', 'Swift', 'Quick', 'Sharp', 'Epic'];
    const nouns = ['Tiger', 'Eagle', 'Shark', 'Wolf', 'Lion', 'Hawk', 'Bear', 'Fox', 'Panda', 'Dragon'];
    const randomNum = Math.floor(Math.random() * 999);
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdj}${randomNoun}${randomNum}`;
  };

  const handleShuffleUsername = () => {
    setGeneratedUsername(generateRandomUsername());
  };

  // Multi-step navigation
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Profile update handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Only submit if on the final step
    if (currentStep !== 3) {
      console.log('Not on final step, preventing submission');
      return;
    }
    
    setLoading(true);
    try {
      const success = await updateProfile({
        username: generatedUsername,
        fullName: profileData.fullName,
        phone: profileData.phone
      });
      if (success) {
        setIsEditing(false);
        setCurrentStep(1);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
            </div>
          </div>
        </div>

        {/* Profile Information Section Title with KYC Badge */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-bold text-gray-900">Profile Information</h3>
          {user.kycStatus === 'approved' ? (
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
              <Shield size={12} />
              KYC Verified
            </span>
          ) : user.kycStatus === 'pending' ? (
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-700">
              KYC Pending
            </span>
          ) : (
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
              KYC Required
            </span>
          )}
        </div>

        {/* Edit Profile Button Below Badge */}
        {!isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setCurrentStep(1);
            }}
            className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 flex items-center gap-1 mb-4"
          >
            <Edit2 size={12} />
            Edit Profile
          </button>
        )}

        {isEditing ? (
          <form 
            onSubmit={handleUpdateProfile}
            className="space-y-6"
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    currentStep === step ? 'bg-purple-600 text-white' : 
                    currentStep > step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? '✓' : step}
                  </div>
                  {step < 3 && <div className={`w-12 h-1 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Basic Information</h4>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Username</label>
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
                      🔄
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="input-mobile"
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setProfileData({ ...profileData, phone: value });
                      }
                    }}
                    className="input-mobile"
                    required
                    maxLength="10"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input-mobile"
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Date of Birth</label>
                  <input
                    type="text"
                    value={profileData.dob || ''}
                    onChange={(e) => handleDOBChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    maxLength="10"
                    className="input-mobile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Gender</label>
                  <select
                    value={profileData.gender || ''}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="input-mobile"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Address Details</h4>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Address Line 1</label>
                  <input
                    type="text"
                    value={profileData.addressLine1 || ''}
                    onChange={(e) => setProfileData({ ...profileData, addressLine1: e.target.value })}
                    className="input-mobile"
                    placeholder="House/Flat No, Building Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={profileData.addressLine2 || ''}
                    onChange={(e) => setProfileData({ ...profileData, addressLine2: e.target.value })}
                    className="input-mobile"
                    placeholder="Street, Area, Locality"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">City</label>
                    <input
                      type="text"
                      value={profileData.city || ''}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      className="input-mobile"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">State</label>
                    <input
                      type="text"
                      value={profileData.state || ''}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                      className="input-mobile"
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">Pincode</label>
                    <input
                      type="text"
                      value={profileData.pincode || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 6) {
                          setProfileData({ ...profileData, pincode: value });
                        }
                      }}
                      className="input-mobile"
                      maxLength="6"
                      placeholder="6-digit PIN"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={profileData.country || 'India'}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                      className="input-mobile"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Bank & Nominee */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Bank Account & Nominee</h4>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Account Type</label>
                  <select
                    value={profileData.accountType || ''}
                    onChange={(e) => setProfileData({ ...profileData, accountType: e.target.value })}
                    className="input-mobile"
                  >
                    <option value="">Select Type</option>
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={profileData.accountNumber || ''}
                    onChange={(e) => setProfileData({ ...profileData, accountNumber: e.target.value })}
                    className="input-mobile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    value={profileData.ifsc || ''}
                    onChange={(e) => setProfileData({ ...profileData, ifsc: e.target.value })}
                    className="input-mobile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={profileData.bankName || ''}
                    onChange={(e) => setProfileData({ ...profileData, bankName: e.target.value })}
                    className="input-mobile"
                  />
                </div>
                <hr className="my-4" />
                <h5 className="font-semibold text-gray-800">Nominee Details</h5>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Nominee Name</label>
                  <input
                    type="text"
                    value={profileData.nomineeName || ''}
                    onChange={(e) => setProfileData({ ...profileData, nomineeName: e.target.value })}
                    className="input-mobile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Relationship</label>
                  <input
                    type="text"
                    value={profileData.nomineeRelationship || ''}
                    onChange={(e) => setProfileData({ ...profileData, nomineeRelationship: e.target.value })}
                    className="input-mobile"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold"
                >
                  ← Previous
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold flex items-center gap-2"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save All Changes
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentStep(1);
                  setGeneratedUsername(user.username);
                  setProfileData({ username: user.username, fullName: user.fullName, phone: user.phone });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold ml-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Horizontal Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveInfoTab('personal')}
                className={`px-4 py-2 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeInfoTab === 'personal'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setActiveInfoTab('address')}
                className={`px-4 py-2 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeInfoTab === 'address'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Address
              </button>
              <button
                onClick={() => setActiveInfoTab('bank')}
                className={`px-4 py-2 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeInfoTab === 'bank'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Bank & Finance
              </button>
              <button
                onClick={() => setActiveInfoTab('clm')}
                className={`px-4 py-2 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeInfoTab === 'clm'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                CLM & Documents
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {/* Personal Tab */}
              {activeInfoTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900">{user.fullName || '—'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{user.email || '—'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Mobile</p>
                      <p className="font-semibold text-gray-900">{user.phone || '—'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">User ID</p>
                      <p className="font-semibold text-gray-900 font-mono">{user.userId || user._id?.slice(-8).toUpperCase() || '—'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                      <p className="font-semibold text-gray-900">{formatDate(user.dob)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Gender</p>
                      <p className="font-semibold text-gray-900">{user.gender || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Tab */}
              {activeInfoTab === 'address' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="font-semibold text-gray-900">
                        {user.address?.line1 || '—'}
                        {user.address?.line2 && `, ${user.address.line2}`}
                        {user.address?.line3 && `, ${user.address.line3}`}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">City</p>
                      <p className="font-semibold text-gray-900">{user.address?.city || '—'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">State</p>
                      <p className="font-semibold text-gray-900">{user.address?.state || '—'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Pincode</p>
                      <p className="font-semibold text-gray-900">{user.address?.pincode || '—'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Country</p>
                      <p className="font-semibold text-gray-900">{user.address?.country || 'India'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank & Finance Tab */}
              {activeInfoTab === 'bank' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Bank Account</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Account Type</p>
                        <p className="font-semibold text-gray-900">{user.bankAccount?.accountType || '—'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Account Number</p>
                        <p className="font-semibold text-gray-900">{user.bankAccount?.accountNumber || '—'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">IFSC</p>
                        <p className="font-semibold text-gray-900">{user.bankAccount?.ifsc || '—'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                        <p className="font-semibold text-gray-900">{user.bankAccount?.bankName || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Nominee</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Name</p>
                        <p className="font-semibold text-gray-900">{user.nominee?.name || '—'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Relationship</p>
                        <p className="font-semibold text-gray-900">{user.nominee?.relationship || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CLM & Documents Tab */}
              {activeInfoTab === 'clm' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Demat Account</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">DP ID</p>
                        <p className="font-semibold text-gray-900">{user.dematAccount?.dpId || '—'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Client ID</p>
                        <p className="font-semibold text-gray-900">{user.dematAccount?.clientId || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

      {/* KYC Verification Section Removed */}
      
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

export default ProfileTab;
