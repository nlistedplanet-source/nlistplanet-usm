import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CheckEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';
  const username = location.state?.username || '';

  const handleResendEmail = async () => {
    // TODO: Implement resend verification email endpoint
    alert('Resend verification email feature coming soon!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center space-y-6">
          {/* Email Icon */}
          <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Check Your Email</h2>
            <p className="text-gray-600">
              We've sent a verification link to
            </p>
            <p className="text-blue-600 font-semibold mt-1">{email}</p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Next Steps:</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Open your email inbox</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Click the verification link in the email from NListPlanet</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>You'll be redirected to login</span>
              </li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              ⏰ The verification link will expire in <span className="font-semibold">24 hours</span>
            </p>
          </div>

          {/* Tips */}
          <div className="text-left space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Didn't receive the email?</span>
            </p>
            <ul className="text-xs text-gray-500 space-y-1 ml-4 list-disc">
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleResendEmail}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Resend Verification Email
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Login
            </button>
          </div>

          {/* Username Info */}
          {username && (
            <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">
              Your username: <span className="font-semibold text-gray-700">@{username}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
