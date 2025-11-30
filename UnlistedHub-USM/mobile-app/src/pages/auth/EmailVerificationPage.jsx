import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { authAPI } from '../../utils/api';
import { haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        haptic.error();
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        haptic.success();
        toast.success('Email verified! You can now login.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
        haptic.error();
        toast.error('Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    haptic.light();
    if (status === 'success') {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col items-center justify-center px-6">
      {/* Icon */}
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-scale-in ${
        status === 'verifying' 
          ? 'bg-gradient-to-br from-gray-400 to-gray-500'
          : status === 'success'
          ? 'bg-gradient-to-br from-green-500 to-green-600'
          : 'bg-gradient-to-br from-red-500 to-red-600'
      }`}>
        {status === 'verifying' ? (
          <Loader className="w-12 h-12 text-white animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle className="w-12 h-12 text-white" />
        ) : (
          <XCircle className="w-12 h-12 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="text-center max-w-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {status === 'verifying' 
            ? 'Verifying Email...'
            : status === 'success'
            ? 'Email Verified!'
            : 'Verification Failed'
          }
        </h1>
        <p className="text-gray-600 leading-relaxed mb-8">
          {message || (status === 'verifying' 
            ? 'Please wait while we verify your email address.'
            : status === 'success'
            ? 'Your email has been successfully verified. You can now login and start trading!'
            : 'We couldn\'t verify your email. The link may have expired or is invalid.'
          )}
        </p>

        {/* Continue Button */}
        {status !== 'verifying' && (
          <button
            onClick={handleContinue}
            className={`w-full px-6 py-3 rounded-xl font-semibold active:scale-95 transition-all duration-200 shadow-lg ${
              status === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {status === 'success' ? 'Continue to Login' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
