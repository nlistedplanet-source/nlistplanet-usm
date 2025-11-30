import React from 'react';
import { Loader } from 'lucide-react';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col items-center justify-center z-50">
      <div className="relative">
        <Loader className="w-16 h-16 text-primary-600 animate-spin" />
        <div className="absolute inset-0 bg-primary-600 opacity-20 rounded-full animate-ping" />
      </div>
      <p className="mt-6 text-primary-900 font-medium text-lg">{message}</p>
    </div>
  );
};

export default LoadingScreen;
