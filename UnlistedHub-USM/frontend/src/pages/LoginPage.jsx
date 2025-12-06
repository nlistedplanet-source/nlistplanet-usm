import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, RefreshCw, Edit3, X, Phone, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import signinHero from '../assets/signin_hero.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, resendVerification, updateEmail, updatePhone } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [unverifiedPhone, setUnverifiedPhone] = useState('');
  const [unverifiedUserId, setUnverifiedUserId] = useState('');
  const [modalView, setModalView] = useState('main'); // 'main', 'updateEmail', 'updatePhone', 'otp'
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else if (result.isUnverified) {
      // Store user details for verification
      setUnverifiedEmail(result.email || '');
      setUnverifiedPhone(result.phone || '');
      setUnverifiedUserId(result.userId || '');
      setModalView('main');
      setShowVerifyModal(true);
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const result = await resendVerification(unverifiedEmail);
      if (result.success) {
        toast.success('OTP sent to your email and mobile!');
        setModalView('otp');
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    }
    setResendLoading(false);
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    
    setVerifyLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://nlistplanet-usm-v8dc.onrender.com/api'}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail, otp: otpCode })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Account verified! Please login.');
        setShowVerifyModal(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Verification failed');
    }
    setVerifyLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast.error('Please enter new email');
      return;
    }
    
    setResendLoading(true);
    try {
      const result = await updateEmail(unverifiedEmail, newEmail);
      if (result.success) {
        setUnverifiedEmail(result.email || newEmail);
        setNewEmail('');
        setModalView('otp');
        toast.success('Email updated! OTP sent to new email.');
      }
    } catch (error) {
      toast.error('Failed to update email');
    }
    setResendLoading(false);
  };

  const handleUpdatePhone = async () => {
    if (!newPhone || newPhone.length < 10) {
      toast.error('Please enter valid phone number');
      return;
    }
    
    setResendLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://nlistplanet-usm-v8dc.onrender.com/api'}/auth/update-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail, phone: newPhone })
      });
      const data = await response.json();
      
      if (data.success) {
        setUnverifiedPhone(newPhone);
        setNewPhone('');
        setModalView('otp');
        toast.success('Phone updated! OTP sent to new number.');
      } else {
        toast.error(data.message || 'Failed to update phone');
      }
    } catch (error) {
      toast.error('Failed to update phone');
    }
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Verification Modal - OTP Based */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Shield className="text-purple-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {modalView === 'main' && 'Verify Your Account'}
                  {modalView === 'otp' && 'Enter OTP'}
                  {modalView === 'updateEmail' && 'Update Email'}
                  {modalView === 'updatePhone' && 'Update Mobile'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {modalView === 'main' && 'Complete verification to continue'}
                  {modalView === 'otp' && 'Enter the 6-digit code sent to you'}
                  {modalView === 'updateEmail' && 'Enter your new email address'}
                  {modalView === 'updatePhone' && 'Enter your new mobile number'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowVerifyModal(false);
                  setModalView('main');
                  setOtp(['', '', '', '', '', '']);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main View */}
            {modalView === 'main' && (
              <>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-purple-800">
                    <strong>Email:</strong> {unverifiedEmail || 'Not set'}<br />
                    <strong>Mobile:</strong> {unverifiedPhone ? `******${unverifiedPhone.slice(-4)}` : 'Not set'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={resendLoading ? 'animate-spin' : ''} />
                    {resendLoading ? 'Sending OTP...' : 'Send OTP (Email + SMS)'}
                  </button>

                  <button
                    onClick={() => setModalView('updateEmail')}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Mail size={18} />
                    Change Email Address
                  </button>

                  <button
                    onClick={() => setModalView('updatePhone')}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Phone size={18} />
                    Change Mobile Number
                  </button>

                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {/* OTP View */}
            {modalView === 'otp' && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800 text-center">
                    OTP sent to <strong>{unverifiedEmail}</strong>
                    {unverifiedPhone && <> & <strong>******{unverifiedPhone.slice(-4)}</strong></>}
                  </p>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleVerifyOTP}
                    disabled={verifyLoading || otp.join('').length !== 6}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleResendOTP}
                      disabled={resendLoading}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      {resendLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                    <button
                      onClick={() => setModalView('main')}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Update Email View */}
            {modalView === 'updateEmail' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Email
                  </label>
                  <input
                    type="email"
                    value={unverifiedEmail}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleUpdateEmail}
                    disabled={resendLoading || !newEmail}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {resendLoading ? 'Updating...' : 'Update & Send OTP'}
                  </button>

                  <button
                    onClick={() => {
                      setModalView('main');
                      setNewEmail('');
                    }}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {/* Update Phone View */}
            {modalView === 'updatePhone' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Mobile
                  </label>
                  <input
                    type="text"
                    value={unverifiedPhone ? `******${unverifiedPhone.slice(-4)}` : 'Not set'}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Mobile Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleUpdatePhone}
                    disabled={resendLoading || newPhone.length !== 10}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {resendLoading ? 'Updating...' : 'Update & Send OTP'}
                  </button>

                  <button
                    onClick={() => {
                      setModalView('main');
                      setNewPhone('');
                    }}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Illustration Section - 60% */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[60%] items-center justify-center bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 relative overflow-hidden"
      >
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-gradient-to-tr from-cyan-400/30 to-emerald-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-300/20 to-cyan-300/20 rounded-full blur-2xl" />
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="relative z-10 max-w-sm text-center space-y-6 px-8"
        >
          <img src={signinHero} alt="Sign In Illustration" className="w-full max-w-xs mx-auto drop-shadow-xl" />
          <h2 className="text-3xl font-bold text-gray-800">Trade Smarter</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Access India's trusted unlisted marketplace. Monitor bids, manage your holdings and discover emerging opportunities.</p>
        </motion.div>
      </motion.div>

      {/* Form Section - 40% */}
      <div className="w-full lg:w-[40%] mx-auto flex flex-col justify-center px-6 py-12">
        <style>{`
          .floating-label-wrap { position: relative; }
          .floating-label-wrap input::placeholder { color: transparent; }
          .floating-label { position:absolute; left:3rem; top:50%; transform:translateY(-50%); font-size:0.8rem; color:#6b7280; pointer-events:none; transition:all .2s ease; z-index:1; }
          .floating-label-wrap input:focus + .floating-label,
          .floating-label-wrap input:not(:placeholder-shown) + .floating-label { top:0.45rem; left:3rem; font-size:0.60rem; font-weight:600; letter-spacing:.5px; color:#059669; background:#fff; padding:0 4px; border-radius:4px; }
          .floating-label-wrap:focus-within .input-icon { color: #10b981 !important; }
          .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); }
        `}</style>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to continue to your account</p>
        </motion.div>
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="glass-card rounded-2xl p-8 space-y-6"
        >
          <div className="space-y-5">
            {/* Username / Email */}
            <div className="floating-label-wrap">
              <Mail className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username or Email"
                className="w-full px-4 py-3.5 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                required
              />
              <label className="floating-label" htmlFor="username">Username or Email</label>
            </div>
            {/* Password */}
            <div className="floating-label-wrap">
              <Lock className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3.5 pl-12 pr-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                required
              />
              <label className="floating-label" htmlFor="password">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-base bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New to Nlist Planet?</span>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link 
              to="/register" 
              className="w-full py-3 rounded-xl font-semibold text-base bg-white text-emerald-600 border-2 border-emerald-500 hover:bg-emerald-50 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              Create account →
            </Link>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default LoginPage;
