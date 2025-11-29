import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, RefreshCw, Edit3, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import signinHero from '../assets/signin_hero.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, resendVerification, updateEmail } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showUpdateEmail, setShowUpdateEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

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
      // Extract email from username or show modal
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const email = emailPattern.test(formData.username) ? formData.username : '';
      setUnverifiedEmail(email);
      setShowVerifyModal(true);
    }
    
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) {
      return;
    }
    
    setResendLoading(true);
    await resendVerification(unverifiedEmail);
    setResendLoading(false);
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !unverifiedEmail) {
      return;
    }
    
    setResendLoading(true);
    const result = await updateEmail(unverifiedEmail, newEmail);
    if (result.success) {
      setUnverifiedEmail(result.email);
      setNewEmail('');
      setShowUpdateEmail(false);
    }
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Email Not Verified</h3>
                <p className="text-sm text-gray-500 mt-1">Please verify your email to continue</p>
              </div>
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {!showUpdateEmail ? (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    A verification link was sent to: <br />
                    <span className="font-semibold">{unverifiedEmail || 'your registered email'}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading || !unverifiedEmail}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={resendLoading ? 'animate-spin' : ''} />
                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>

                  <button
                    onClick={() => setShowUpdateEmail(true)}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Edit3 size={18} />
                    Update Email Address
                  </button>

                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
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
                    placeholder="Enter your new email"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleUpdateEmail}
                    disabled={resendLoading || !newEmail}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {resendLoading ? 'Updating...' : 'Update & Send Verification'}
                  </button>

                  <button
                    onClick={() => {
                      setShowUpdateEmail(false);
                      setNewEmail('');
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
