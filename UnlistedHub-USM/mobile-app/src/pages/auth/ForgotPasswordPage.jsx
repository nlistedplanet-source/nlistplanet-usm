import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader } from 'lucide-react';
import { authAPI } from '../../utils/api';
import { isValidEmail, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      haptic.error();
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email address');
      haptic.error();
      return;
    }

    setLoading(true);
    setError('');
    haptic.medium();

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      haptic.success();
      toast.success('Reset link sent to your email!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link';
      setError(message);
      haptic.error();
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col items-center justify-center px-6">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-scale-in">
          <Mail className="w-12 h-12 text-white" />
        </div>

        {/* Content */}
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            We've sent a password reset link to <span className="font-semibold">{email}</span>. 
            Please check your inbox and follow the instructions.
          </p>

          {/* Back Button */}
          <Link
            to="/login"
            className="btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-gray-600 mb-6 touch-feedback"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Login</span>
        </Link>

        <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
        <p className="text-gray-600">No worries! Enter your email and we'll send you reset instructions.</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="you@example.com"
                className={`input-field pl-12 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {error && (
              <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 bg-primary-50 rounded-2xl p-4">
          <p className="text-sm text-primary-900">
            <span className="font-semibold">Note:</span> The reset link will expire in 1 hour. 
            If you don't see the email, check your spam folder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
