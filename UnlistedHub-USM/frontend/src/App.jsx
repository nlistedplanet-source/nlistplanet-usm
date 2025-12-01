import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Device Detection
import { isMobileDevice } from './utils/deviceDetection';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';

// Desktop Pages
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import DashboardPage from './pages/DashboardPage';
import DashboardPreview from './pages/DashboardPreview';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CheckEmailPage from './pages/CheckEmailPage';
import EmailVerificationPage from './pages/EmailVerificationPage';

// Desktop Components
import TopBar from './components/TopBar';
import LoadingScreen from './components/LoadingScreen';

// Mobile App (lazy loaded)
const MobileApp = React.lazy(() => import('./MobileApp'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showBottomNav, setShowBottomNav] = useState(true);

  // Hide bottom nav on login/register/forgot-password/dashboard-preview/dashboard/check-email/verify-email pages
  useEffect(() => {
    const hideNavPaths = ['/login', '/register', '/forgot-password', '/dashboard-preview', '/dashboard', '/check-email'];
    const path = window.location.pathname;
    const isVerifyPath = path.startsWith('/verify-email/');
    setShowBottomNav(!hideNavPaths.includes(path) && !isVerifyPath);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Top Bar */}
      {showBottomNav && location.pathname !== '/dashboard' && <TopBar />}

      {/* Main Content */}
      <main className={location.pathname === '/' || location.pathname === '/dashboard-preview' || location.pathname === '/dashboard' ? '' : 'pt-16'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/dashboard-preview" element={<DashboardPreview />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect /admin to /dashboard */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        }}
      />
    </div>
  );
}

function App() {
  const [deviceType, setDeviceType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect device type on mount
    const checkDevice = () => {
      setDeviceType(isMobileDevice() ? 'mobile' : 'desktop');
      setIsLoading(false);
    };

    checkDevice();

    // Re-check on window resize (debounced)
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkDevice, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Show loading screen while detecting device
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render mobile app for mobile devices
  if (deviceType === 'mobile') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <MobileApp />
      </React.Suspense>
    );
  }

  // Render desktop app for desktop devices
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
