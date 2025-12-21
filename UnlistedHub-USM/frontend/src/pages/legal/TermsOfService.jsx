import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last Updated: December 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <p className="text-gray-700 text-lg">
            These Terms govern your use of Nlist Planet's platform for buying & selling unlisted shares. 
            By creating an account, you agree to these Terms.
          </p>

          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Eligibility</h2>
            <p className="text-gray-700 mb-3">To use Nlist Planet, you must:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Be 18+ years old</li>
              <li>Have valid KYC documents</li>
              <li>Use the platform for lawful purposes</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Maintain accurate information</li>
              <li>Keep login details confidential</li>
              <li>Report any unauthorized access</li>
            </ul>
            <p className="text-gray-900 font-bold text-lg">
              You are fully responsible for activities performed from your account
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Platform Services</h2>
            <p className="text-gray-700 mb-3">Nlist Planet provides:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Marketplace for unlisted shares</li>
              <li>Bidding & offer placement</li>
              <li>User-to-user communication</li>
              <li>Transaction tracking</li>
              <li>Verification support</li>
            </ul>
            <p className="text-gray-900 font-bold text-lg mt-4">
              We are NOT a stock exchange or SEBI-registered broker.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct Rules</h2>
            <p className="text-gray-700 mb-3">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Post fake or misleading listings</li>
              <li>Engage in fraud or illegal activities</li>
              <li>Upload harmful or malicious code</li>
              <li>Use automated bots</li>
              <li>Harass or abuse other users</li>
            </ul>
            <p className="text-red-600 font-bold text-lg mt-4">
              Violation may lead to account suspension.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Transaction Terms</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>All trades are user-to-user (P2P)</li>
              <li>Prices are set by the users</li>
              <li>Nlist Planet charges a platform fee (if applicable)</li>
              <li>We are not responsible for losses, disputes, or incorrect information posted by users</li>
              <li>Users should do their own research before trading</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Content Ownership</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>You own the content you post</li>
              <li>By posting, you give us permission to display it on our platform</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 mb-3">Nlist Planet is not liable for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Investment losses</li>
              <li>Price fluctuations</li>
              <li>Inaccurate user listings</li>
              <li>Delays or errors in transactions</li>
              <li>Technical issues</li>
            </ul>
            <p className="text-gray-900 font-bold text-lg mt-4">
              Use the platform at your own risk.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-700 mb-3">We may suspend or terminate your account if:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>You violate our policies</li>
              <li>You engage in suspicious activity</li>
              <li>You post false documents</li>
            </ul>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700">
              We may update the Terms any time. Continued use means you accept the changes.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
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

export default TermsOfService;
