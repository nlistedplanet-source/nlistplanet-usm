import React, { useState } from 'react';
import { User, Mail, Phone, Edit2, Key, LogOut, Shield, Save, Bell, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

// Standalone ProfileTab for Preview - No AuthContext dependency
const ProfileTabPreview = ({ mockUser }) => {
  // Helper function to format date as DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: mockUser?.username || '',
    fullName: mockUser?.fullName || '',
    phone: mockUser?.phone || ''
  });
  const [generatedUsername, setGeneratedUsername] = useState(mockUser?.username || '');
  const [currentStep, setCurrentStep] = useState(1);
  const [activeInfoTab, setActiveInfoTab] = useState('personal'); // New state for info tabs
  const [kycDocuments, setKycDocuments] = useState({
    pan: { file: null, preview: null, extracted: null },
    aadhaar: { file: null, preview: null, extracted: null },
    bank: { file: null, preview: null, extracted: null },
    demat: { file: null, preview: null, extracted: null }
  });

  const user = mockUser;

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Profile updated! (Preview Mode)');
      setIsEditing(false);
      setLoading(false);
    }, 1000);
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
    setTimeout(() => {
      toast.success('Password changed! (Preview Mode)');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
    }, 1000);
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
      setKycDocuments(prev => ({
        ...prev,
        [docType]: { file, preview: reader.result, extracted: null }
      }));
      toast.success(`${docType.toUpperCase()} uploaded successfully`);
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmitKYC = async () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('KYC submitted! (Preview Mode)');
      setCurrentStep(1);
      setKycDocuments({
        pan: { file: null, preview: null, extracted: null },
        aadhaar: { file: null, preview: null, extracted: null },
        bank: { file: null, preview: null, extracted: null },
        demat: { file: null, preview: null, extracted: null }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div>
      {/* Profile Card */}
      <div className="card-mobile mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-bold text-3xl">
              {user.username[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-dark-900">@{user.username}</h3>
            <p className="text-sm text-dark-600">{user.email}</p>
            <p className="text-xs text-dark-500 mt-1">User ID: {user.userId}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
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
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 flex items-center gap-1 mb-4"
          >
            <Edit2 size={12} />
            Edit Profile
          </button>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    currentStep === step ? 'bg-purple-600 text-white' : 
                    currentStep > step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? '✓' : step}
                  </div>
                  {step < 4 && <div className={`w-12 h-1 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}`} />}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input-mobile"
                    required
                    maxLength="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={profileData.dob || ''}
                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={profileData.addressLine2 || ''}
                    onChange={(e) => setProfileData({ ...profileData, addressLine2: e.target.value })}
                    className="input-mobile"
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">State</label>
                    <input
                      type="text"
                      value={profileData.state || ''}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                      className="input-mobile"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">Pincode</label>
                    <input
                      type="text"
                      value={profileData.pincode || ''}
                      onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                      className="input-mobile"
                      maxLength="6"
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

            {/* Step 4: Demat & Documents */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Demat Account & Documents</h4>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">DP ID</label>
                  <input
                    type="text"
                    value={profileData.dpId || ''}
                    onChange={(e) => setProfileData({ ...profileData, dpId: e.target.value })}
                    className="input-mobile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 mb-2">Client ID</label>
                  <input
                    type="text"
                    value={profileData.clientId || ''}
                    onChange={(e) => setProfileData({ ...profileData, clientId: e.target.value })}
                    className="input-mobile"
                  />
                </div>
                <hr className="my-4" />
                <h5 className="font-semibold text-gray-800">Upload Documents</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">PAN Card</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload('pan', e)}
                      accept="image/*,.pdf"
                      className="input-mobile"
                    />
                    {kycDocuments.pan.preview && (
                      <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">Aadhaar Card</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload('aadhaar', e)}
                      accept="image/*,.pdf"
                      className="input-mobile"
                    />
                    {kycDocuments.aadhaar.preview && (
                      <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">Bank Proof</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload('bank', e)}
                      accept="image/*,.pdf"
                      className="input-mobile"
                    />
                    {kycDocuments.bank.preview && (
                      <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">CLM Copy (Optional)</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload('demat', e)}
                      accept="image/*,.pdf"
                      className="input-mobile"
                    />
                    {kycDocuments.demat.preview && (
                      <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                    )}
                  </div>
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
              {currentStep < 4 ? (
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold flex items-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} />Save All</>}
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
                      <p className="font-semibold text-gray-900 font-mono">{user.userId || '—'}</p>
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
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Documents</h5>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">PAN Card</p>
                          {kycDocuments.pan.preview ? (
                            <p className="text-xs text-green-600">✓ Uploaded</p>
                          ) : (
                            <p className="text-xs text-red-600">❌ Not Uploaded</p>
                          )}
                        </div>
                        {kycDocuments.pan.preview && (
                          <button
                            onClick={() => window.open(kycDocuments.pan.preview, '_blank')}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700"
                          >
                            View Document
                          </button>
                        )}
                      </div>
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
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Documents</h5>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Address Proof (Aadhaar)</p>
                          {kycDocuments.aadhaar.preview ? (
                            <p className="text-xs text-green-600">✓ Uploaded</p>
                          ) : (
                            <p className="text-xs text-red-600">❌ Not Uploaded</p>
                          )}
                        </div>
                        {kycDocuments.aadhaar.preview && (
                          <button
                            onClick={() => window.open(kycDocuments.aadhaar.preview, '_blank')}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700"
                          >
                            View Document
                          </button>
                        )}
                      </div>
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
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Documents</h5>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Bank Proof</p>
                          {kycDocuments.bank.preview ? (
                            <p className="text-xs text-green-600">✓ Uploaded</p>
                          ) : (
                            <p className="text-xs text-red-600">❌ Not Uploaded</p>
                          )}
                        </div>
                        {kycDocuments.bank.preview && (
                          <button
                            onClick={() => window.open(kycDocuments.bank.preview, '_blank')}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700"
                          >
                            View Document
                          </button>
                        )}
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
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Documents</h5>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">CLM Copy (Optional)</p>
                          {kycDocuments.demat.preview ? (
                            <p className="text-xs text-green-600">✓ Uploaded</p>
                          ) : (
                            <p className="text-xs text-orange-600">⚠️ Not Uploaded</p>
                          )}
                        </div>
                        {kycDocuments.demat.preview && (
                          <button
                            onClick={() => window.open(kycDocuments.demat.preview, '_blank')}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700"
                          >
                            View Document
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Account Stats - 4 Column Grid */}
      <div className="card-mobile mb-6">
        <h3 className="font-bold text-dark-900 mb-4">📊 Account Stats</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{user.totalReferrals || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Referrals</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">₹{user.totalEarnings || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Earnings</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-xs text-gray-600 mt-1">Active Posts</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600">₹0</p>
            <p className="text-xs text-gray-600 mt-1">Portfolio</p>
          </div>
        </div>
      </div>

      {/* Security & Settings - 3 Column Grid */}
      <div className="card-mobile mb-6">
        <h3 className="font-bold text-dark-900 mb-4">🔐 Security & Settings</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
          >
            <Key size={24} className="text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-blue-900">Change Password</p>
            <p className="text-xs text-blue-700 mt-1">Update password</p>
          </button>
          <button
            onClick={() => toast.info('Notifications (Coming Soon)')}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <Bell size={24} className="text-green-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-green-900">Notifications</p>
            <p className="text-xs text-green-700 mt-1">Email & push alerts</p>
          </button>
          <button
            onClick={() => toast.info('Theme Settings (Coming Soon)')}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
          >
            <Palette size={24} className="text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-purple-900">Theme Settings</p>
            <p className="text-xs text-purple-700 mt-1">Light/Dark mode</p>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => toast.info('Logout (Preview Mode)')}
        className="w-full card-mobile bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-3 py-4"
      >
        <LogOut size={20} className="text-red-600" />
        <p className="font-semibold text-red-600">Logout from Account</p>
      </button>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowPasswordModal(false)} />
          <div className="fixed inset-4 z-50 bg-white rounded-2xl p-6 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md">
            <h3 className="text-2xl font-bold text-dark-900 mb-6">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-mobile"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">New Password</label>
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
                <label className="block text-sm font-semibold text-dark-700 mb-2">Confirm New Password</label>
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
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Key size={18} />Change Password</>}
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

export default ProfileTabPreview;
