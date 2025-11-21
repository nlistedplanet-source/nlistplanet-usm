

import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-100 flex flex-col items-center justify-center z-50">
      <div className="relative flex flex-col items-center mb-6" style={{width:'112px',height:'112px'}}>
        {/* Pulse Effects and Logo perfectly centered */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="absolute w-32 h-32 rounded-full bg-orange-400 opacity-20 animate-pulse1"></span>
          <span className="absolute w-20 h-20 rounded-full bg-orange-500 opacity-30 animate-pulse2"></span>
        </span>
        {/* Logo */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="rounded-full shadow-lg bg-white p-4 flex items-center justify-center">
            <img
              src={process.env.PUBLIC_URL + '/images/logos/favicon.png'}
              alt="Logo"
              className="w-16 h-16 drop-shadow-xl"
              style={{ filter: 'drop-shadow(0 2px 8px #ff6600aa)' }}
            />
          </div>
        </div>
      </div>
      <p className="mt-4 text-orange-700 font-semibold tracking-wide text-base">Loading...</p>
      <style>{`
        @keyframes pulse1 {
          0% { transform: scale(0.9); opacity: 0.3; }
          70% { transform: scale(1.4); opacity: 0.05; }
          100% { transform: scale(0.9); opacity: 0.3; }
        }
        @keyframes pulse2 {
          0% { transform: scale(1); opacity: 0.25; }
          70% { transform: scale(1.7); opacity: 0.05; }
          100% { transform: scale(1); opacity: 0.25; }
        }
        .animate-pulse1 { animation: pulse1 1.6s infinite cubic-bezier(0.4,0,0.2,1); }
        .animate-pulse2 { animation: pulse2 2.1s infinite cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
