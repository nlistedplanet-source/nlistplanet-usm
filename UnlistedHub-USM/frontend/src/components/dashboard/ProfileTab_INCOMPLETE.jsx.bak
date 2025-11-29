import React, { useState } from 'react';
import { User, Mail, Phone, Edit2, Key, LogOut, Shield, Shuffle, Calendar, MapPin, Briefcase, Building, Users, CreditCard, FileText, CheckCircle, XCircle, AlertCircle, Bell, Palette, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-dark-900">Profile Settings</h2>
        <button
          onClick={() => setShowKYCModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold flex items-center gap-2"
        >
          <Edit2 size={16} />
          Edit Profile
        </button>
      </div>

      {/* User Information Card - Horizontal 2-Column Grid */}
      <div className="card-mobile mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-dark-900 flex items-center gap-2">
            <User size={20} className="text-purple-600" />
            User Information
          </h3>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            user.kycStatus === 'approved' ? 'bg-green-100 text-green-700' :
            user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            user.kycStatus === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {user.kycStatus === 'approved' ? ' KYC Verified' :
             user.kycStatus === 'pending' ? ' Under Review' :
             user.kycStatus === 'rejected' ? ' KYC Rejected' :
             ' KYC Pending'}
          </span>
        </div>

        {/* Grid Layout - 2 Columns on Desktop, 1 on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
