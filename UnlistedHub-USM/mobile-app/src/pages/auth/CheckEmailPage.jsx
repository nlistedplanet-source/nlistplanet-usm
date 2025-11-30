import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { haptic } from '../../utils/helpers';

const CheckEmailPage = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    haptic.light();
    navigate('/login');
  };

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
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>

        {/* Tips */}
        <div className="bg-white rounded-2xl p-5 shadow-mobile mb-8 text-left">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Didn't receive the email?
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Check your spam or junk folder</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Make sure you entered the correct email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Wait a few minutes and refresh your inbox</span>
            </li>
          </ul>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <span>Continue to Login</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default CheckEmailPage;
