import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookiePolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add noindex meta tag
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-500">Last Updated: December 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <p className="text-gray-700 text-lg">
            Nlist Planet uses cookies to improve your experience. This Cookie Policy explains how and why we use them.
          </p>

          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700">
              Cookies are small files stored on your device to remember your preferences and activity on our platform.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
            
            <div className="space-y-6 ml-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">a) Essential Cookies</h3>
                <p className="text-gray-700 mb-2">Required for:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Login authentication</li>
                  <li>Security</li>
                  <li>Basic website functions</li>
                </ul>
                <p className="text-red-600 font-bold mt-3">These cannot be disabled.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">b) Functional Cookies</h3>
                <p className="text-gray-700 mb-2">Used for:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Saving preferences</li>
                  <li>Improving user experience</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">c) Analytics Cookies</h3>
                <p className="text-gray-700 mb-2">Used for:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Traffic analysis</li>
                  <li>Understanding user behavior</li>
                  <li>Improving our services</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">d) Advertising Cookies (if applicable)</h3>
                <p className="text-gray-700 mb-2">Used for:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Relevant ads</li>
                  <li>Tracking marketing performance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How You Can Control Cookies</h2>
            <p className="text-gray-700 mb-3">You can:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Disable cookies from browser settings</li>
              <li>Clear stored cookies anytime</li>
            </ul>
            <p className="text-gray-700 mt-4 italic">
              Note: Disabling essential cookies may affect website performance.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-3">We may use cookies from:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Google Analytics</li>
              <li>Payment partners</li>
              <li>Social media login providers</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We are not responsible for third-party cookie practices.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Updates to This Policy</h2>
            <p className="text-gray-700">
              We may update this Cookie Policy anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
