import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Simple placeholder component
function MobilePlaceholder() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        maxWidth: '400px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📱</div>
        <h1 style={{ fontSize: '32px', margin: '0 0 16px 0', fontWeight: '700' }}>
          NlistPlanet Mobile
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>
          Mobile app is under development!
        </p>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>
          Visit nlistplanet.com on desktop for full experience
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<MobilePlaceholder />} />
      </Routes>

      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
          },
        }}
      />
    </Router>
  );
}

export default App;
