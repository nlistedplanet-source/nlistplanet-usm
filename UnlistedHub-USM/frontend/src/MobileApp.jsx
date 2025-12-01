import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import mobile components from mobile-app folder
// We'll copy essential mobile components here

// For now, create a simple mobile landing page
function MobileLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">📱 NlistPlanet Mobile</h1>
        <p className="text-lg mb-8">Mobile app coming soon!</p>
        <p className="text-sm opacity-80">Currently showing desktop version</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

function MobileApp() {
  return (
    <Router>
      <AuthProvider>
        <div className="mobile-app">
          <Routes>
            <Route path="*" element={<MobileLanding />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                maxWidth: '90vw',
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default MobileApp;
