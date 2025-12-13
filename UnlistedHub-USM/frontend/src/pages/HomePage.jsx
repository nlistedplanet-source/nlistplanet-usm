import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { companiesAPI } from '../utils/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  // Default featured companies to show immediately
  const defaultCompanies = [
    { _id: 'default-1', name: 'Zepto Private Limited', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Zepto_company_logo.png/800px-Zepto_company_logo.png' },
    { _id: 'default-2', name: 'Garuda Aerospace', logo: 'https://garudaaerospace.com/wp-content/uploads/2022/06/Garuda-Aerospace-Logo.png' },
    { _id: 'default-3', name: 'Incred Holdings Limited', logo: 'https://www.incredmoney.com/wp-content/uploads/2023/01/InCred_Logo_R-1.png' },
    { _id: 'default-4', name: 'Metropolitan Stock Exchange', logo: 'https://www.msei.in/images/msei-logo.png' },
    { _id: 'default-5', name: 'National Stock Exchange of India', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/NSE_logo.svg/320px-NSE_logo.svg.png' },
    { _id: 'default-6', name: 'Oravel Stays Limited (OYO)', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/OYO_Rooms_logo.svg/320px-OYO_Rooms_logo.svg.png' }
  ];

  const [companies, setCompanies] = useState(defaultCompanies);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const words = useMemo(() => ['Buy', 'Sell'], []);
  const [charIndex, setCharIndex] = useState(0);

  // Fetch companies from database
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log('🔄 [v4.0 - LOGO FIX] Fetching companies from API...');
        console.log('🌐 API URL:', process.env.REACT_APP_API_URL || 'https://nlistplanet-usm-api.onrender.com/api');
        const response = await companiesAPI.getAll({ limit: 20 });
        console.log('✅ [v4.0] Companies fetched:', response);
        console.log('📊 [v4.0] First 3 companies with logos:', response.data.data?.slice(0, 3).map(c => ({name: c.name, logo: c.logo?.substring(0, 50)})));
        if (response.data.data && response.data.data.length > 0) {
          setCompanies(response.data.data);
        }
        console.log('📊 [v4.0] Total companies loaded:', response.data.data?.length || 0);
      } catch (error) {
        console.error('❌ [v4.0] Failed to fetch companies:', error);
        // Keep default companies on error
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const typingSpeed = isDeleting ? 100 : 150;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentWord.length) {
        setDisplayText(currentWord.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        setDisplayText(currentWord.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === currentWord.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setWordIndex((wordIndex + 1) % words.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex, words]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 pt-6 md:pt-8 pb-12 px-8 flex flex-col justify-between relative overflow-hidden" style={{minHeight: '85vh'}}>
        <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-200 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10 flex-grow">
          <div className="text-left space-y-8">
            <h1 className="text-7xl font-bold leading-tight">
              <span className="text-gray-900 inline-block w-[150px]">
                {displayText}
              </span>
              <span className="text-emerald-500">Unlisted</span>
              <br />
              <span className="text-emerald-500">Shares Online</span>
            </h1>
            
            <div className="space-y-3">
              <p className="text-2xl text-gray-700 font-medium">
                Buy and Sell Unlisted Shares at the Price You Choose.
              </p>
              <p className="text-xl text-gray-600">
                Own a Stake in India's Fastest-Growing Companies.
              </p>
            </div>

            <div className="flex gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">500+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">₹50Cr+</div>
                <div className="text-sm text-gray-600">Trading Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">100+</div>
                <div className="text-sm text-gray-600">Companies</div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center pt-16">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-3xl transform rotate-3 opacity-10 z-0 translate-y-8"></div>
              
              <img 
                src="/images/logos/herolaptop.png" 
                alt="Hero Laptop" 
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                style={{ maxHeight: '500px', objectPosition: 'center bottom' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Company Logos Section - Fetch from Database */}
      <div className="bg-gray-50 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800">Featured Unlisted Companies</h2>
        </div>
          
        <div>
          {loadingCompanies ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : companies.length > 0 ? (
            <div className="marquee-container">
              <div className="marquee-track flex gap-6 py-4 px-4">
                {/* Duplicate list for seamless scrolling */}
                {[...companies, ...companies].map((company, index) => (
                  <div 
                    key={`${company._id}-${index}`}
                    className="flex-shrink-0 w-48 bg-white px-4 py-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center gap-3 border border-gray-100 cursor-pointer"
                    onClick={() => navigate(`/company/${company._id}`)}
                  >
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={company.name}
                        className="h-16 w-16 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="h-16 w-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded flex items-center justify-center text-white text-lg font-bold"
                      style={{ display: company.logo ? 'none' : 'flex' }}
                    >
                      {company.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 text-center line-clamp-2 h-10 flex items-center justify-center">{company.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No companies available yet</p>
            </div>
          )}
        </div>
        
        <style>{`
          .marquee-container {
            width: 100%;
            overflow: hidden;
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: scroll 80s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* How to Buy Section */}
      <div id="features-section" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">
              How to <span className="text-emerald-500">Buy Shares</span>
            </h2>
            <p className="text-xl text-gray-600">Simple steps to start investing in unlisted companies</p>
          </div>

          <div className="max-w-6xl mx-auto mb-16">
            <div className="flex justify-between items-start gap-8">
              <div className="flex-1 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6" style={{background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'}}>
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Sign Up</h3>
                <p className="text-base text-gray-600">Create your free account in minutes</p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6" style={{background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)'}}>
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Browse Shares</h3>
                <p className="text-base text-gray-600">Explore available unlisted companies</p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6" style={{background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)'}}>
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Place Bid</h3>
                <p className="text-base text-gray-600">Submit your bid at your desired price</p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)'}}>
                  <span className="text-3xl font-bold text-white">4</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Complete Trade</h3>
                <p className="text-base text-gray-600">Secure transaction & ownership transfer</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => navigate('/marketplace')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Explore Now 
            </button>
          </div>
        </div>
      </div>

      {/* How to Sell Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">
              How to <span className="text-purple-600">Sell Shares</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">List your unlisted shares and reach thousands of buyers</p>
            
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3">
                <div className="text-3xl">💰</div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-800">Best Prices</h4>
                  <p className="text-xs text-gray-600">Set your own price and get competitive bids</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3">
                <div className="text-3xl">⚡</div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-800">Quick Listing</h4>
                  <p className="text-xs text-gray-600">List your shares in less than 5 minutes</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3">
                <div className="text-3xl">🔒</div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-800">Secure Transfer</h4>
                  <p className="text-xs text-gray-600">Safe and verified ownership transfer process</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mb-16">
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-6xl font-bold text-blue-100 group-hover:text-blue-300 transition-colors duration-300">1</span>
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Create Account</h3>
                <p className="text-sm text-gray-600">Register as a seller on our platform</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-6xl font-bold text-cyan-100 group-hover:text-cyan-300 transition-colors duration-300">2</span>
                  <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">List Your Shares</h3>
                <p className="text-sm text-gray-600">Add share details, quantity & your price</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-6xl font-bold text-green-100 group-hover:text-green-300 transition-colors duration-300">3</span>
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-3xl font-bold text-white">₹</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Get Bids</h3>
                <p className="text-sm text-gray-600">Receive bids from interested buyers</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-6xl font-bold text-purple-100 group-hover:text-purple-300 transition-colors duration-300">4</span>
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Accept & Sell</h3>
                <p className="text-sm text-gray-600">Accept best bid & complete sale</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => navigate('/marketplace')}
              className="bg-gradient-to-r from-purple-600 to-violet-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Selling
            </button>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              Why Choose 
              <img 
                src="/images/logos/new_logo.png" 
                alt="Nlist Planet" 
                className="h-24 w-24 object-contain"
              />
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              India's most trusted platform for unlisted shares trading with transparency, security, and innovation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Secure Transaction</h3>
              <p className="text-gray-600">Our team ensures both buyer and seller receive their assets securely.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Large Network</h3>
              <p className="text-gray-600">Connect with thousands of verified buyers and sellers across India</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Expert Support</h3>
              <p className="text-gray-600">Connect to our expert team for exclusive deals.</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Transparent Pricing</h3>
              <p className="text-gray-600">No hidden charges. Clear pricing for every transaction</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Competitive Rates</h3>
              <p className="text-gray-600">Get the best market rates for your unlisted shares</p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Market Insights</h3>
              <p className="text-gray-600">Access to detailed company information and market trends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
