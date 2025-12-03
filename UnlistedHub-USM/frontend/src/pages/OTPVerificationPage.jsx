import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Loader2, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Mail, Phone } from 'lucide-react';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState('input'); // input, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  
  // Get email from registration flow
  const email = location.state?.email || '';
  const phone = location.state?.phone || '';
  
  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
    
    // Redirect if no email
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all filled
    if (index === 5 && value && newOtp.every(d => d)) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    
    setOtp(newOtp);
    
    // Focus last filled input or submit
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
    
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      setMessage('Please enter complete 6-digit OTP');
      setStatus('error');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { state: { message: 'Account verified! Please login.' } });
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.message);
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setResending(true);
    setMessage('');
    setStatus('input');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('New OTP sent to your email and phone!');
        setCountdown(60); // 60 second cooldown
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setMessage(data.message);
        setStatus('error');
      }
    } catch (error) {
      setMessage('Failed to resend OTP. Please try again.');
      setStatus('error');
    } finally {
      setResending(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Verified! 🎉</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
          <div className="mt-4">
            <div className="w-8 h-8 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/register')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Register
        </button>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Account</h2>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit OTP to:
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-center text-sm text-gray-700">
              <Mail className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium">{email}</span>
            </div>
            {phone && (
              <div className="flex items-center justify-center text-sm text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-green-500" />
                <span className="font-medium">******{phone}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                status === 'error' ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              disabled={loading}
            />
          ))}
        </div>
        
        {/* Error Message */}
        {message && status === 'error' && (
          <div className="flex items-center justify-center text-red-600 text-sm mb-4">
            <AlertCircle className="w-4 h-4 mr-2" />
            {message}
          </div>
        )}
        
        {/* Success Message */}
        {message && status === 'input' && (
          <div className="flex items-center justify-center text-green-600 text-sm mb-4">
            <CheckCircle className="w-4 h-4 mr-2" />
            {message}
          </div>
        )}
        
        {/* Verify Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={loading || otp.some(d => !d)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>
        
        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className={`flex items-center justify-center mx-auto text-sm font-medium transition-colors ${
              countdown > 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            {resending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend in {countdown}s
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend OTP
              </>
            )}
          </button>
        </div>
        
        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-700 text-center">
            💡 <strong>Tip:</strong> Check your spam folder if you don't see the email. 
            The OTP expires in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
