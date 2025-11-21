
import React from 'react';
import { Loader } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-yellow-50 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center mb-6">
        <div className="rounded-full shadow-lg bg-white p-3 animate-bounce mb-2">
          <img
            src={process.env.PUBLIC_URL + '/images/logos/favicon.png'}
            alt="NlistPlanet Logo"
            className="w-16 h-16 drop-shadow-xl"
            style={{ filter: 'drop-shadow(0 2px 8px #0ea5e9aa)' }}
          />
        </div>
      </div>
      <Loader className="animate-spin text-primary-600" size={38} />
      <p className="mt-4 text-gray-500 font-medium tracking-wide text-base">Loading...</p>
    </div>
  );
};

export default LoadingScreen;
