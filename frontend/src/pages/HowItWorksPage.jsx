import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus, Search, ShoppingCart, TrendingUp, Shield, Zap, Users } from 'lucide-react';

const HowItWorksPage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: "Create Account",
      description: "Sign up in seconds with your email and create your secure account.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Browse Listings",
      description: "Explore unlisted shares from top companies with detailed information and pricing.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Buy or Sell",
      description: "Make secure transactions with verified buyers and sellers on our platform.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Track Portfolio",
      description: "Monitor your investments and track performance in real-time from your dashboard.",
      color: "from-orange-500 to-red-600"
    }
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Transactions",
      description: "Bank-grade security with encrypted data and secure payment gateways."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Processing",
      description: "Quick verification and instant transaction processing for seamless trading."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Verified Community",
      description: "Trade with confidence among verified buyers and sellers."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              How Nlist Planet Works
            </h1>
            <p className="text-xl text-purple-100 mb-8">
              Your gateway to unlisted shares trading made simple, secure, and transparent
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        
        {/* Decorative waves */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1"/>
            <path d="M0 120L60 112.5C120 105 240 90 360 82.5C480 75 600 75 720 78.75C840 82.5 960 90 1080 93.75C1200 97.5 1320 97.5 1380 97.5L1440 97.5V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.2"/>
          </svg>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple 4-Step Process
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start trading unlisted shares in just a few clicks
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connector line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-200 to-transparent -z-10"></div>
              )}
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                {/* Step number */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Nlist Planet?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with security, speed, and user experience in mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Buy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Buying Unlisted Shares
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Browse Available Shares</h3>
                  <p className="text-gray-600">Explore listings from verified sellers with detailed company information and pricing.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Place Your Order</h3>
                  <p className="text-gray-600">Select quantity and submit your buy request with our simple order form.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
                  <p className="text-gray-600">Complete payment through our secure gateway with multiple payment options.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Transfer Completion</h3>
                  <p className="text-gray-600">Shares are transferred to your demat account after verification.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
                <p className="text-white/80 text-sm mb-2">Example Trade</p>
                <p className="text-white text-2xl font-bold">Buy 100 shares</p>
                <p className="text-white/90 text-lg">@₹500 per share</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <p className="text-white/80 text-sm mb-2">Total Investment</p>
                <p className="text-white text-3xl font-bold">₹50,000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Sell Section */}
      <section className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
                  <p className="text-white/80 text-sm mb-2">Your Listing</p>
                  <p className="text-white text-2xl font-bold">Sell 50 shares</p>
                  <p className="text-white/90 text-lg">@₹750 per share</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <p className="text-white/80 text-sm mb-2">Expected Return</p>
                  <p className="text-white text-3xl font-bold">₹37,500</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Selling Your Shares
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Create Listing</h3>
                    <p className="text-gray-600">Add your shares with company details, quantity, and asking price.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Verification</h3>
                    <p className="text-gray-600">Submit documents for verification to ensure authenticity of shares.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Get Offers</h3>
                    <p className="text-gray-600">Receive bids from interested buyers and negotiate best price.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-bold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Complete Sale</h3>
                    <p className="text-gray-600">Accept offer, transfer shares, and receive payment securely.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of investors trading unlisted shares on Nlist Planet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Create Account
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="bg-purple-700/50 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700/70 transition-all duration-300"
              >
                Browse Listings
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
