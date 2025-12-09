import React from 'react';
import { Link } from 'react-router-dom';

const LandingBottomNav = ({ activePage = '' }) => {
  const navItems = [
    { key: 'home', label: 'Home', path: '/' },
    { key: 'about', label: 'About', path: '/about' },
    { key: 'blog', label: 'Blog', path: '/blog' },
    { key: 'contact', label: 'Contact', path: '/contact' },
    { key: 'faq', label: 'FAQ', path: '/faq' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] z-30">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3 text-sm font-medium text-gray-600">
        {navItems.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            className={`flex-1 text-center px-3 py-2 rounded-lg transition-all duration-200 ${
              activePage === item.key
                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                : 'hover:bg-gray-50'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LandingBottomNav;
