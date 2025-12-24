import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Edit2, Key, LogOut, MapPin, Building2, CreditCard, Users, X, Shuffle, Camera, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProfileTab = () => {
  const { user, logout, updateProfile, changePassword, refreshUser } = useAuth();
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

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [kycDocuments, setKycDocuments] = useState({
    pan: null,
    aadhar: null,
    cancelledCheque: null,
    cml: null
  });
  
  const [uploadingDoc, setUploadingDoc] = useState(false);

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
      
      if (user.profileImage) {
        setProfileImagePreview(user.profileImage);
      }
      
      if (user.kycDocuments) {
        setKycDocuments({
          pan: user.kycDocuments.pan || null,
          aadhar: user.kycDocuments.aadhar || null,
          cancelledCheque: user.kycDocuments.cancelledCheque || null,
          cml: user.kycDocuments.cml || null
        });
      }
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

  const generateUsername = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/generate-username`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setProfileData({ ...profileData, username: response.data.username });
      toast.success('New username generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate username');
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycDocumentUpload = async (docType, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload only JPG, PNG, or PDF files');
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('docType', docType);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/kyc/upload-document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setKycDocuments(prev => ({
        ...prev,
        [docType]: response.data.url
      }));

      toast.success(`${docType.toUpperCase()} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload profile image first if changed
      if (profileImage) {
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        const imageResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/upload-profile-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        // Update preview with new image URL immediately
        setProfileImagePreview(imageResponse.data.imageUrl);
      }
      
      // Update profile data
      const success = await updateProfile(profileData);
      if (success) {
        // Refresh user data to update sidebar and all components
        await refreshUser();
        
        setIsEditing(false);
        setProfileImage(null);
        toast.success('✅ Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
      {/* Clean Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-6 text-white">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-purple-600 text-4xl font-bold overflow-hidden ring-4 ring-white/30">
              {profileImagePreview || user.profileImage ? (
                <img 
                  src={profileImagePreview || user.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                user.fullName?.charAt(0) || 'U'
              )}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white text-purple-600 rounded-full p-2.5 shadow-lg hover:bg-purple-50 transition-all hover:scale-110"
              >
                <Camera size={18} />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">{user.fullName || 'User'}</h2>
            <p className="text-purple-100 text-lg mb-1">@{user.username}</p>
            <p className="text-sm text-purple-200">User ID: {user.userId}</p>
            
            {/* Account Stats Inline */}
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-2xl font-bold">{user.referralCount || 0}</p>
                <p className="text-purple-200 text-sm">Referrals</p>
              </div>
              <div>
                <p className="text-2xl font-bold">₹{user.earnings || 0}</p>
                <p className="text-purple-200 text-sm">Earnings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Always Tabbed */}
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
              Documents
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <form onSubmit={handleUpdateProfile}>
          <div className="p-6 min-h-[400px]">
            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div>
                {isEditing ? (
                  <div className="space-y-6">
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
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField icon={<User size={16} />} label="Full Name" value={user.fullName} />
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
              </div>
            )}

            {/* Bank Tab */}
            {activeTab === 'bank' && (
              <div>
                {isEditing ? (
                  <div className="space-y-6">
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
                ) : (
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
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 mb-4">KYC Documents</h4>
                
                <KycDocumentCard
                  title="PAN Card"
                  docType="pan"
                  document={kycDocuments.pan}
                  onUpload={handleKycDocumentUpload}
                  uploading={uploadingDoc}
                  icon={<FileText size={20} className="text-blue-600" />}
                />
                
                <KycDocumentCard
                  title="Aadhar Card"
                  docType="aadhar"
                  document={kycDocuments.aadhar}
                  onUpload={handleKycDocumentUpload}
                  uploading={uploadingDoc}
                  icon={<FileText size={20} className="text-green-600" />}
                />
                
                <KycDocumentCard
                  title="Cancelled Cheque"
                  docType="cancelledCheque"
                  document={kycDocuments.cancelledCheque}
                  onUpload={handleKycDocumentUpload}
                  uploading={uploadingDoc}
                  icon={<CreditCard size={20} className="text-purple-600" />}
                />
                
                <KycDocumentCard
                  title="CML (Client Master List)"
                  docType="cml"
                  document={kycDocuments.cml}
                  onUpload={handleKycDocumentUpload}
                  uploading={uploadingDoc}
                  icon={<FileText size={20} className="text-orange-600" />}
                  optional
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please upload clear, readable documents. Accepted formats: JPG, PNG, PDF (Max 10MB each)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  <Key size={18} />
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
              
              {isEditing ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
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
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

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
    </div>
  );
};

// Helper component for displaying info fields
const InfoField = ({ icon, label, value }) => (
  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

// KYC Document Upload Card Component
const KycDocumentCard = ({ title, docType, document, onUpload, uploading, icon, optional = false }) => {
  const fileInputRef = useRef(null);
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(docType, file);
    }
    e.target.value = '';
  };
  
  const isPDF = document && document.toLowerCase().endsWith('.pdf');
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            {icon}
          </div>
          <div>
            <h5 className="font-semibold text-gray-900">
              {title}
              {optional && <span className="text-xs text-gray-500 ml-2">(Optional)</span>}
            </h5>
            <p className="text-sm text-gray-600">
              {document ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={14} />
                  Uploaded {isPDF && '(PDF)'}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-600">
                  <XCircle size={14} />
                  Not uploaded
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {document && (
            <a
              href={document}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isPDF ? 'Download' : 'View'}
            </a>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : document ? 'Replace' : 'Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
