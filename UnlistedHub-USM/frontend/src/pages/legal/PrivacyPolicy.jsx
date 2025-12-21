import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add noindex meta tag to prevent this page from showing separately in search results
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, follow';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last Updated: December 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <p className="text-gray-700 text-lg">
            Nlist Planet ("we", "our", "us") is committed to protecting your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your data when you use 
            our platform for buying and selling unlisted shares.
          </p>

          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">We may collect the following information:</p>
            
            <div className="space-y-6 ml-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">a) Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Mobile number</li>
                  <li>KYC documents (PAN, Aadhaar, etc.)</li>
                  <li>Bank details for transactions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">b) Usage Data</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>IP address</li>
                  <li>Device information</li>
                  <li>Browser type</li>
                  <li>Pages visited</li>
                  <li>Login activity</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">c) Transactional Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Buy/Sell orders</li>
                  <li>Bids & offers</li>
                  <li>Payment confirmation records</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">We use your data for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Creating & verifying your account</li>
              <li>Enabling buying and selling of unlisted shares</li>
              <li>Fraud detection & security</li>
              <li>Customer support</li>
              <li>Sending important updates & notifications</li>
              <li>Improving platform performance</li>
            </ul>
            <p className="text-gray-900 font-bold text-lg mt-4">We never sell your data to any third party.</p>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Sharing of Information</h2>
            <p className="text-gray-700 mb-3">We may share information only with:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Government authorities (if legally required)</li>
              <li>Payment gateway & banking partners</li>
              <li>KYC verification partners</li>
              <li>Internal team members (strictly limited access)</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-3">We use:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Encrypted data storage</li>
              <li>Secure access control</li>
              <li>Regular security audits</li>
              <li>OTP-based authentication</li>
            </ul>
            <p className="text-gray-700 mt-4 italic">
              Still, no method is 100% secure. You use the platform at your own risk.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 mb-3">You can request:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Your stored data</li>
              <li>Correction or update of your information</li>
              <li>Account deletion</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Contact: <a href="mailto:support@nlistplanet.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">support@nlistplanet.com</a>
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies & Tracking</h2>
            <p className="text-gray-700 mb-3">We use cookies to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Improve website performance</li>
              <li>Save login preferences</li>
              <li>Analyze user activity</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You can disable cookies from browser settings.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Links</h2>
            <p className="text-gray-700">
              Our website may contain links to other sites. We are not responsible for their privacy practices.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this policy anytime. Continued use means you agree to the changes.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 mb-4">For questions, contact us at:</p>
            <div className="bg-indigo-50 rounded-xl p-6 space-y-3">
              <p className="text-gray-700 flex items-center gap-2">
                <span className="text-2xl">📧</span>
                <a href="mailto:support@nlistplanet.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">support@nlistplanet.com</a>
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                Mumbai, Maharashtra, India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
