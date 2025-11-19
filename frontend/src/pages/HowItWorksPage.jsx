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
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Nlist Planet</h3>
              <p className="text-gray-400 text-sm">
                India's trusted platform for unlisted shares trading
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/marketplace')} className="text-gray-400 hover:text-white transition">
                    Marketplace
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/how-it-works')} className="text-gray-400 hover:text-white transition">
                    How it Works
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://nlistplanet.com/blog" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white transition">
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/register')} className="text-gray-400 hover:text-white transition">
                    Sign Up
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>support@nlistplanet.com</li>
                <li>Mumbai, India</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 Nlist Planet. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorksPage;
