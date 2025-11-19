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

      {/* Buy Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-8 flex-col md:flex-row">
            {/* Left: Icon and Title */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-3">
                    Buy Unlisted Shares
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Get access to exclusive investment opportunities. Unlock premium companies and grow your portfolio with India's fastest-growing unlisted shares.
                  </p>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg"
                  >
                    See Listings
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="flex-1 flex justify-center">
              <svg width="300" height="250" viewBox="0 0 300 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Person sitting */}
                <ellipse cx="150" cy="230" rx="60" ry="12" fill="#E5E7EB"/>
                
                {/* Legs */}
                <path d="M125 170 Q110 205 105 225 L120 228 Q128 208 135 180 Z" fill="#3B4A9C"/>
                <path d="M175 170 Q190 205 195 225 L180 228 Q172 208 165 180 Z" fill="#3B4A9C"/>
                
                {/* Shoes */}
                <ellipse cx="112" cy="227" rx="15" ry="6" fill="#1E293B"/>
                <ellipse cx="188" cy="227" rx="15" ry="6" fill="#1E293B"/>
                
                {/* Laptop */}
                <g transform="translate(110, 165)">
                  <rect x="0" y="0" width="80" height="50" rx="2" fill="#374151"/>
                  <rect x="2" y="2" width="76" height="44" fill="#60A5FA"/>
                  {/* Screen content - chart icon */}
                  <path d="M15 30 L25 20 L35 28 L45 18 L55 25 L65 15" stroke="#10B981" strokeWidth="3" fill="none"/>
                  {/* Keyboard base */}
                  <rect x="-5" y="52" width="90" height="8" rx="2" fill="#4B5563"/>
                </g>
                
                {/* Body */}
                <rect x="130" y="120" width="40" height="55" rx="6" fill="#10B981"/>
                
                {/* Arms */}
                <path d="M130 135 Q110 145 105 160 Q103 163 107 165 Q118 155 130 148 Z" fill="#10B981"/>
                <path d="M170 135 Q190 145 195 160 Q197 163 193 165 Q182 155 170 148 Z" fill="#10B981"/>
                
                {/* Neck */}
                <rect x="143" y="110" width="14" height="12" fill="#FDB99B"/>
                
                {/* Head */}
                <ellipse cx="150" cy="95" rx="25" ry="28" fill="#FDB99B"/>
                
                {/* Hair */}
                <path d="M125 88 Q125 65 150 62 Q175 65 175 88 Q175 100 172 108 L128 108 Q125 100 125 88 Z" fill="#1E293B"/>
                
                {/* Eyes */}
                <ellipse cx="140" cy="95" rx="2.5" ry="3" fill="#1E293B"/>
                <ellipse cx="160" cy="95" rx="2.5" ry="3" fill="#1E293B"/>
                
                {/* Smile */}
                <path d="M140 105 Q150 110 160 105" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                
                {/* Floating icons */}
                <g transform="translate(220, 80)">
                  {/* Trending up icon */}
                  <rect x="0" y="0" width="50" height="50" rx="8" fill="#6366F1"/>
                  <path d="M12 30 L20 22 L28 28 L38 18" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="30 18 38 18 38 26" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                
                {/* Up arrow */}
                <g transform="translate(40, 50)">
                  <path d="M0 30 L10 10 L20 30" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="10" x2="10" y2="50" stroke="#10B981" strokeWidth="4" strokeLinecap="round"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Sell Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-8 flex-col md:flex-row-reverse">
            {/* Right: Icon and Title */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-3">
                    Sell Your Shares Easily
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Join a large investor base and sell your shares quickly at the best price. Trusted by thousands of sellers across India with secure transactions.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg"
                  >
                    Sell Now
                  </button>
                </div>
              </div>
            </div>

            {/* Left: Illustration */}
            <div className="flex-1 flex justify-center">
              <svg width="300" height="250" viewBox="0 0 300 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Person sitting */}
                <ellipse cx="150" cy="230" rx="60" ry="12" fill="#E5E7EB"/>
                
                {/* Legs */}
                <path d="M125 170 Q108 205 102 225 L117 228 Q125 208 133 180 Z" fill="#10B981"/>
                <path d="M175 170 Q192 205 198 225 L183 228 Q175 208 167 180 Z" fill="#10B981"/>
                
                {/* Shoes */}
                <ellipse cx="110" cy="227" rx="15" ry="6" fill="#1E293B"/>
                <ellipse cx="190" cy="227" rx="15" ry="6" fill="#1E293B"/>
                
                {/* Body */}
                <rect x="130" y="125" width="40" height="50" rx="6" fill="white"/>
                
                {/* Arms */}
                <path d="M130 140 Q115 148 112 160 Q111 163 115 164 Q123 155 130 150 Z" fill="#FDB99B"/>
                <path d="M170 140 Q185 148 188 160 Q189 163 185 164 Q177 155 170 150 Z" fill="#FDB99B"/>
                
                {/* Phone in hand */}
                <g transform="translate(100, 155)">
                  <rect x="0" y="0" width="20" height="35" rx="3" fill="#1E293B"/>
                  <rect x="2" y="3" width="16" height="28" rx="1" fill="#3B82F6"/>
                  <circle cx="10" cy="33" r="1.5" fill="#9CA3AF"/>
                </g>
                
                {/* Neck */}
                <rect x="143" y="115" width="14" height="12" fill="#FDB99B"/>
                
                {/* Head */}
                <ellipse cx="150" cy="95" rx="25" ry="28" fill="#FDB99B"/>
                
                {/* Hair */}
                <path d="M125 95 Q125 70 150 65 Q175 70 175 95 L170 110 Q165 115 150 115 Q135 115 130 110 Z" fill="#1E293B"/>
                
                {/* Eyes */}
                <ellipse cx="140" cy="93" rx="2.5" ry="3" fill="#1E293B"/>
                <ellipse cx="160" cy="93" rx="2.5" ry="3" fill="#1E293B"/>
                
                {/* Smile */}
                <path d="M140 105 Q150 110 160 105" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                
                {/* Floating icons */}
                <g transform="translate(35, 70)">
                  {/* Users icon */}
                  <circle cx="15" cy="15" r="15" fill="#3B82F6"/>
                  <path d="M10 17 Q10 14 12.5 14 Q15 14 15 17" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="12.5" cy="10" r="2.5" stroke="white" strokeWidth="1.5" fill="none"/>
                  <path d="M17 17 Q17 14 19.5 14 Q22 14 22 17" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="19.5" cy="10" r="2.5" stroke="white" strokeWidth="1.5" fill="none"/>
                </g>
                
                <g transform="translate(35, 120)">
                  {/* Shield check icon */}
                  <circle cx="15" cy="15" r="15" fill="#10B981"/>
                  <path d="M15 8 L20 10 L20 15 Q20 20 15 22 Q10 20 10 15 L10 10 Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <path d="M13 15 L15 17 L18 13" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
