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
            {/* Left: SVG Illustration */}
            <div className="flex justify-center">
              <svg width="400" height="350" viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Person sitting */}
                <ellipse cx="200" cy="320" rx="80" ry="15" fill="#E5E7EB"/>
                
                {/* Legs */}
                <path d="M160 240 Q140 280 130 310 L150 315 Q165 285 175 250 Z" fill="#3B4A9C"/>
                <path d="M240 240 Q260 280 270 310 L250 315 Q235 285 225 250 Z" fill="#3B4A9C"/>
                
                {/* Shoes */}
                <ellipse cx="140" cy="315" rx="18" ry="8" fill="#1E293B"/>
                <ellipse cx="260" cy="315" rx="18" ry="8" fill="#1E293B"/>
                
                {/* Body */}
                <rect x="165" y="180" width="70" height="75" rx="8" fill="#10B981"/>
                
                {/* Arms */}
                <path d="M165 200 Q140 210 130 230 Q128 235 133 237 Q148 225 165 220 Z" fill="#10B981"/>
                <path d="M235 200 Q255 205 260 215 L250 225 Q240 215 235 220 Z" fill="#10B981"/>
                
                {/* Phone in hand */}
                <rect x="125" y="225" width="25" height="40" rx="4" fill="#374151"/>
                <rect x="128" y="228" width="19" height="32" rx="2" fill="#60A5FA"/>
                {/* Chart on phone */}
                <path d="M132 240 L135 245 L138 238 L141 242 L144 235" stroke="#10B981" strokeWidth="1.5" fill="none"/>
                
                {/* Neck */}
                <rect x="190" y="170" width="20" height="15" fill="#FDB99B"/>
                
                {/* Head */}
                <ellipse cx="200" cy="150" rx="35" ry="40" fill="#FDB99B"/>
                
                {/* Hair */}
                <path d="M165 140 Q165 110 200 105 Q235 110 235 140 Q235 160 230 170 L170 170 Q165 160 165 140 Z" fill="#1E293B"/>
                
                {/* Eyes */}
                <ellipse cx="185" cy="150" rx="3" ry="4" fill="#1E293B"/>
                <ellipse cx="215" cy="150" rx="3" ry="4" fill="#1E293B"/>
                
                {/* Smile */}
                <path d="M185 165 Q200 172 215 165" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round"/>
                
                {/* Growth arrows and bars */}
                <g transform="translate(280, 100)">
                  {/* Bars */}
                  <rect x="0" y="60" width="20" height="40" rx="4" fill="#60A5FA"/>
                  <rect x="30" y="40" width="20" height="60" rx="4" fill="#60A5FA"/>
                  <rect x="60" y="15" width="20" height="85" rx="4" fill="#60A5FA"/>
                  
                  {/* Up arrows */}
                  <path d="M40 20 L50 5 L60 20" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M70 -5 L85 -25 L100 -5" stroke="#10B981" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
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
              src="https://cdn3d.iconscout.com/3d/premium/thumb/investor-3d-illustration-download-in-png-blend-fbx-gltf-formats--man-coin-money-finance-pack-business-illustrations-8914183.png"
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
              src="https://cdn3d.iconscout.com/3d/premium/thumb/female-using-mobile-3d-illustration-download-in-png-blend-fbx-gltf-formats--girl-woman-person-pack-people-illustrations-7286351.png"
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
    </div>
  );
};

export default HowItWorksPage;
