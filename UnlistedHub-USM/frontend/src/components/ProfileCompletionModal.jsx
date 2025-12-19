import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileCompletionModal = ({ onComplete }) => {
  const { completeProfile, verifyProfileOtp } = useAuth();
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await completeProfile(formData.fullName, formData.phone);
    
    setLoading(false);

    if (result.success) {
      setStep(2);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await verifyProfileOtp(otp);
    
    setLoading(false);

    if (result.success) {
      onComplete();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600 mb-6">
              Please provide your details to continue
            </p>

            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="10-digit mobile number"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send you an OTP to verify your number
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Mobile Number
            </h2>
            <p className="text-gray-600 mb-6">
              Enter the 6-digit OTP sent to {formData.phone}
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  OTP *
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  minLength={6}
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmitDetails}
                disabled={loading}
                className="w-full text-sm text-primary-600 hover:text-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
