import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Phone, Eye, EyeOff, UserPlus, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateUsername, validateEmail, validatePhone } from '../utils/helpers';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    referredBy: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    // Username is optional, validate only if provided
    if (formData.username && formData.username.trim() !== '' && !validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters, lowercase letters, numbers, and underscores only';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Password validation: 5+ characters
    if (formData.password.length < 5) {
      newErrors.password = 'Password must be at least 5 characters';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password must be less than 128 characters';
    }

    if (!formData.fullName || formData.fullName.length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits required)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const result = await register(formData);

    if (result.success) {
      // Redirect to check email page with email and username
      navigate('/check-email', { 
        state: { 
          email: result.email, 
          username: result.username 
        } 
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
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
          <img src="/images/logos/herolaptop.png" alt="Illustration" className="w-full max-w-xs mx-auto drop-shadow-xl" />
          <h2 className="text-3xl font-bold text-gray-800">Join Nlist Planet</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Create an account to access India's trusted unlisted marketplace. List, bid and manage your portfolio with ease.</p>
        </motion.div>
      </motion.div>

      {/* Form Section - 40% */}
      <div className="w-full lg:w-[40%] mx-auto flex flex-col justify-center px-6 py-12">
        <style>{`
          .floating-label-wrap { position: relative; }
          .floating-label-wrap input::placeholder { color: transparent; }
          .floating-label { position:absolute; left:3rem; top:50%; transform:translateY(-50%); font-size:0.8rem; color:#6b7280; pointer-events:none; transition:all .2s ease; z-index:1; }
          .floating-label-no-icon { left:1rem; }
          .floating-with-icon { padding-left:3rem; }
          .floating-label-wrap input:focus + .floating-label,
          .floating-label-wrap input:not(:placeholder-shown) + .floating-label { top:0.45rem; font-size:0.60rem; font-weight:600; letter-spacing:.5px; color:#059669; background:#fff; padding:0 4px; border-radius:4px; }
          .floating-label-wrap:focus-within .input-icon { color: #10b981 !important; }
          .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); }
        `}</style>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get started</h1>
          <p className="text-gray-500">Create your account to start trading</p>
        </motion.div>
        {/* Register Form */}
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="glass-card rounded-2xl p-6 space-y-3 max-h-[75vh] overflow-y-auto"
        >
          <div className="space-y-3">
            {/* Full Name */}
            <div className="floating-label-wrap">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className={`w-full px-4 py-3 bg-white border-2 ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200`}
                required
              />
              <label className="floating-label floating-label-no-icon">Full Name</label>
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="floating-label-wrap">
              <Mail className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email"
                className={`w-full px-4 py-3 floating-with-icon bg-white border-2 ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200`}
                required
              />
              <label className="floating-label">Email</label>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="floating-label-wrap">
              <Phone className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={20} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className={`w-full px-4 py-3 floating-with-icon bg-white border-2 ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200`}
                maxLength="10"
                required
              />
              <label className="floating-label">Phone Number</label>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="floating-label-wrap">
              <Lock className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 5 characters"
                className={`w-full px-4 py-3 floating-with-icon pr-12 bg-white border-2 ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200`}
                required
              />
              <label className="floating-label">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Referral Code (Optional) */}
            <div className="floating-label-wrap">
              <Gift className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={20} />
              <input
                type="text"
                name="referredBy"
                value={formData.referredBy}
                onChange={handleChange}
                placeholder="Enter referral code"
                className="w-full px-4 py-3 floating-with-icon bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
              />
              <label className="floating-label">Referral Code (Optional)</label>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-base bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-dark-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="block w-full py-3 rounded-xl font-semibold text-base bg-white text-emerald-600 border-2 border-emerald-500 hover:bg-emerald-50 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 shadow-sm hover:shadow-md text-center"
          >
            Login Instead
          </Link>
        </motion.form>
      </div>
    </div>
  );
};

export default RegisterPage;
