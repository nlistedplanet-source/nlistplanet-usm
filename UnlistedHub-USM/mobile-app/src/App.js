import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { register } from './utils/registerServiceWorker';

// Common Components
import ErrorBoundary from './components/common/ErrorBoundary';
import InstallPrompt from './components/common/InstallPrompt';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CheckEmailPage from './pages/auth/CheckEmailPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Main Pages
import HomePage from './pages/dashboard/HomePage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import ProfilePage from './pages/profile/ProfilePage';
import ListingDetailPage from './pages/listing/ListingDetailPage';

// Trading Pages
import MyPostsPage from './pages/trading/MyPostsPage';
import BidsPage from './pages/trading/BidsPage';
import OffersReceivedPage from './pages/trading/OffersReceivedPage';
import ActivityPage from './pages/activity/ActivityPage';

// Notification Pages
import NotificationsPage from './pages/notifications/NotificationsPage';

// Additional Pages
import KYCPage from './pages/kyc/KYCPage';
import ReferralsPage from './pages/referrals/ReferralsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import BottomNav from './components/common/BottomNav';

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

// Public Route Component (redirect to home if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/marketplace" 
          element={
            <ProtectedRoute>
              <MarketplacePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/listing/:id" 
          element={
            <ProtectedRoute>
              <ListingDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-posts" 
          element={
            <ProtectedRoute>
              <MyPostsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bids" 
          element={
            <ProtectedRoute>
              <BidsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/offers" 
          element={
            <ProtectedRoute>
              <OffersReceivedPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/activity" 
          element={
            <ProtectedRoute>
              <ActivityPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/kyc" 
          element={
            <ProtectedRoute>
              <KYCPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/referrals" 
          element={
            <ProtectedRoute>
              <ReferralsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />

        {/* Redirect root to appropriate page */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} 
        />

        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom Navigation (only for authenticated users) */}
      {user && <BottomNav />}

      {/* Install Prompt */}
      <InstallPrompt />

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
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Register service worker for PWA
    register();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
