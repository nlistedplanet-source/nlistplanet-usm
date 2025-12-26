import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopBar = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDashboardPage = location.pathname === '/dashboard' || location.pathname === '/admin';
  const isHomePage = location.pathname === '/';

  return (
    <header className={`w-full ${isHomePage ? 'relative' : 'fixed'} top-0 left-0 right-0 z-40 transition-all duration-300 backdrop-blur-md ${
      isDashboardPage
        ? scrolled
          ? 'bg-white/80 border-b border-gray-200 shadow-sm'
          : 'bg-transparent'
        : scrolled
          ? 'bg-white/85 border-b border-gray-200 shadow-sm'
          : isHomePage
            ? 'bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50'
            : 'bg-white/95 border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Standard header height with balanced padding */}
        <div className="flex justify-between items-center gap-6 h-20 py-2">
          {/* Logo Section - keep consistent sizing */}
          <div className="flex items-center gap-2">
            {showBack ? (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
            ) : null}
            
            {title ? (
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            ) : (
              <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity">
                <img 
                  src="/crismas logo.png" 
                  alt="Nlist Planet" 
                  className="h-12 w-auto object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="48"><text x="10" y="30" font-size="24" font-weight="bold" fill="%236366f1">Nlist Planet</text></svg>'; }}
                />
              </button>
            )}
          </div>

          {/* Navigation Links - Modern Floating Tab */}
          {!isDashboardPage && (
            <nav className="hidden md:flex items-center gap-2 bg-white/70 backdrop-blur-xl rounded-2xl px-2 py-2 shadow-lg border border-white/50">
              <button
                onClick={() => navigate('/')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  location.pathname === '/'
                    ? 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30'
                    : 'text-gray-700 hover:bg-white/80 hover:text-gray-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/blog')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  location.pathname.startsWith('/blog')
                    ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'
                    : 'text-gray-700 hover:bg-white/80 hover:text-gray-900'
                }`}
              >
                Blog
              </button>
              <button
                onClick={() => navigate('/how-it-works')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  location.pathname === '/how-it-works'
                    ? 'text-white bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-white/80 hover:text-gray-900'
                }`}
              >
                How it Works
              </button>
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* User Info - Desktop */}
                <div className="hidden sm:flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-3 py-1.5 border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.username?.charAt(0).toUpperCase() || '👤'
                    )}
                  </div>
                  <span className="text-gray-800 font-medium text-sm max-w-[120px] truncate">
                    @{user.username}
                  </span>
                </div>

                {/* Dashboard Button */}
                <button
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:bg-purple-700 transition"
                >
                  Dashboard
                </button>

                {/* Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white transition"
                  >
                    {showMenu ? <X size={20} /> : <Menu size={20} />}
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideDown">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-gray-900 font-semibold text-sm">@{user.username}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate('/dashboard?tab=profile');
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <span className="font-medium text-sm">Profile</span>
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={() => {
                            logout();
                            setShowMenu(false);
                            navigate('/');
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors text-red-600 font-medium"
                        >
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Mobile Nav Toggle */}
                {!isDashboardPage && (
                  <button
                    className="md:hidden w-10 h-10 rounded-full bg-white/70 border border-gray-200 text-gray-700"
                    onClick={() => setShowMobileNav(!showMobileNav)}
                  >
                    {showMobileNav ? <X size={20} /> : <Menu size={20} />}
                  </button>
                )}

                <button
                  onClick={() => navigate('/login')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:bg-purple-700 transition"
                >
                  Login / Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {!isDashboardPage && showMobileNav && (
          <div className="md:hidden pb-3 animate-slideDown">
            <div className="mt-2 grid grid-cols-1 gap-2">
              <button
                onClick={() => { navigate('/'); setShowMobileNav(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${
                  location.pathname === '/' ? 'text-purple-700 bg-purple-50 border border-purple-100' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => { navigate('/blog'); setShowMobileNav(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${
                  location.pathname.startsWith('/blog') ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Blog
              </button>
              <button
                onClick={() => { navigate('/how-it-works'); setShowMobileNav(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${
                  location.pathname === '/how-it-works' ? 'text-blue-700 bg-blue-50 border border-blue-100' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                How it Works
              </button>
              {!user && (
                <button
                  onClick={() => { navigate('/login'); setShowMobileNav(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg font-semibold text-sm bg-purple-600 text-white hover:bg-purple-700"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default TopBar;
