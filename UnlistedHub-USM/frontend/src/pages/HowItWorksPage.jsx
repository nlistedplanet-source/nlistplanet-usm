import React from 'react';
import { useNavigate } from 'react-router-dom';

const HowItWorksPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Main "How it Works" with 4 steps */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              HOW IT WORKS
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Learn how to buy and sell unlisted shares in four easy steps
            </p>
          </div>

          {/* Illustration and Steps */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Image */}
            <div className="flex justify-center">
              <img
                src="/images/howitwork_hero.png"
                alt="How it Works"
                className="w-full max-w-md"
              />
            </div>

            {/* Right: 4 Step Flow */}
            <div>
              <div className="flex items-center justify-between mb-8">
                {/* Step 1: Explore */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-3 shadow-lg">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Explore</h3>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Companies</h3>
                  <p className="text-xs text-gray-600">Browse available unlisted companies and view details</p>
                </div>

                {/* Arrow */}
                <div className="px-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Step 2: Place Order */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center mb-3 shadow-lg">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Place</h3>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Order</h3>
                  <p className="text-xs text-gray-600">Enter the quantity and place a buy or sell order</p>
                </div>

                {/* Arrow */}
                <div className="px-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Step 3: Match */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center mb-3 shadow-lg">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Match &</h3>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Confirm</h3>
                  <p className="text-xs text-gray-600">The order is matched with a seller or buyer</p>
                </div>

                {/* Arrow */}
                <div className="px-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Step 4: Complete */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-3 shadow-lg">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Complete</h3>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Transaction</h3>
                  <p className="text-xs text-gray-600">Payment is processed and shares are transferred</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUY SECTION */}
      <section className="w-full bg-[#f7fcff] px-6 py-10">
        <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl p-10 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* LEFT TEXT */}
          <div>
            <h2 className="text-4xl font-bold text-green-600 flex items-center gap-3 mb-4">
              <span className="text-5xl">🔒</span> Buy <span className="text-black">Unlisted Shares</span>
            </h2>

            <p className="text-gray-700 leading-relaxed mb-8 text-lg">
              Get access to exclusive investment opportunities. Unlock premium companies 
              and grow your portfolio with India's fastest-growing unlisted shares.
            </p>

            <button
              onClick={() => navigate('/marketplace')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium text-lg transition"
            >
              See Listings
            </button>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex justify-center">
            <img
              src="/images/howitwork_buy.png"
              alt="Buy Illustration"
              className="w-72"
            />
          </div>
        </div>
      </section>

      {/* SELL SECTION */}
      <section className="w-full bg-[#f7fcff] px-6 py-10">
        <div className="w-full max-w-6xl mx-auto bg-[#f5f5ff] rounded-3xl p-10 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* LEFT IMAGE */}
          <div className="flex justify-center">
            <img
              src="/images/howitwork_sell.png"
              alt="Sell Illustration"
              className="w-72"
            />
          </div>

          {/* RIGHT TEXT */}
          <div>
            <h2 className="text-4xl font-bold text-blue-600 flex items-center gap-3 mb-4">
              <span className="text-5xl">👤</span> Sell Your Shares Easily
            </h2>

            <p className="text-gray-700 leading-relaxed mb-8 text-lg">
              Join a large investor base and sell your shares quickly at the best price. 
              Trusted by thousands of sellers across India with secure transactions.
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-lg transition"
            >
              Sell Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1">
              <div className="flex flex-col items-center mb-2 w-fit mx-auto">
                <div>
                  <img
                    src="/favicon.png"
                    alt="Nlist Planet Logo"
                    className="h-32 w-32 object-contain"
                  />
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed text-center mt-2">
                India's most trusted platform for buying and selling unlisted shares with complete transparency and security.
              </p>
              <div className="flex gap-4 mt-6 justify-center">
                <a href="https://www.facebook.com/nlistplanet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://twitter.com/nlistplanet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/nlistplanet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/nlistplanet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-emerald-400">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <button type="button" onClick={() => navigate('/')} className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Home</button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/marketplace')} className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Marketplace</button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/login')} className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Login</button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/register')} className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Register</button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-emerald-400">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <button type="button" onClick={() => navigate('/how-it-works')} className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">How It Works</button>
                </li>
                <li>
                  <a href="https://nlistplanet.com/faqs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">FAQs</a>
                </li>
                <li>
                  <a href="/blog" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Blog</a>
                </li>
                <li>
                  <a href="https://nlistplanet.com/terms" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Terms & Conditions</a>
                </li>
                <li>
                  <a href="https://nlistplanet.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Privacy Policy</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-emerald-400">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 text-sm">support@nlistplanet.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-400 text-sm">+91 9580118412</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400 text-sm">Mumbai, Maharashtra, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 Nlist Planet. All rights reserved.
              </p>
              <div className="flex gap-6 items-center">
                <a href="https://nlistplanet.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Privacy Policy</a>
                <a href="https://nlistplanet.com/terms" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Terms of Service</a>
                <a href="https://nlistplanet.com/cookies" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorksPage;
