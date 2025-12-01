import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  LoadingScreen, 
  ErrorBoundary, 
  BottomNav, 
  InstallPrompt 
} from './components/common';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/dashboard/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));
const CheckEmailPage = lazy(() => import('./pages/auth/CheckEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const MarketplacePage = lazy(() => import('./pages/marketplace/MarketplacePage'));
const ListingDetailPage = lazy(() => import('./pages/listing/ListingDetailPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const ActivityPage = lazy(() => import('./pages/activity/ActivityPage'));
const KYCPage = lazy(() => import('./pages/kyc/KYCPage'));
const ReferralsPage = lazy(() => import('./pages/referrals/ReferralsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const MyPostsPage = lazy(() => import('./pages/trading/MyPostsPage'));
const BidsPage = lazy(() => import('./pages/trading/BidsPage'));
const OffersReceivedPage = lazy(() => import('./pages/trading/OffersReceivedPage'));

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route wrapper (redirect if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Layout with bottom navigation
function AppLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* Protected routes with bottom nav */}
          <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><AppLayout><MarketplacePage /></AppLayout></ProtectedRoute>} />
          <Route path="/listing/:id" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><AppLayout><ActivityPage /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          
          {/* Additional protected routes */}
          <Route path="/kyc" element={<ProtectedRoute><KYCPage /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/my-posts" element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>} />
          <Route path="/bids" element={<ProtectedRoute><BidsPage /></ProtectedRoute>} />
          <Route path="/offers" element={<ProtectedRoute><OffersReceivedPage /></ProtectedRoute>} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <InstallPrompt />
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
      </AuthProvider>
    </Router>
  );
}

export default App;
