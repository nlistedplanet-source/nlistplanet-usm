import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Home, ArrowLeft, Search, TrendingUp } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-emerald-200 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-teal-200 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-200 rounded-full blur-2xl opacity-30"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 max-w-5xl">
        {/* Lottie Animation */}
        <div className="w-80 h-80 lg:w-96 lg:h-96 flex-shrink-0">
          <DotLottieReact
            src="https://lottie.host/a83e1da7-f198-4b06-8f1e-a0ca72e355d7/eHG2Gt8vrN.lottie"
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Text Content */}
        <div className="text-center lg:text-left max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Error 404
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been moved. 
            Don't worry, let's get you back on track to find the best unlisted shares.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40"
            >
              <Home size={20} />
              Go Home
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40"
            >
              <TrendingUp size={20} />
              Marketplace
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-10 p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-gray-800 mb-3">
              <Search size={18} />
              <span className="font-semibold">Popular Pages</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/blog')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all"
              >
                📰 Blog
              </button>
              <button
                onClick={() => navigate('/about')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all"
              >
                ℹ️ About Us
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all"
              >
                📧 Contact
              </button>
              <button
                onClick={() => navigate('/faq')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all"
              >
                ❓ FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
