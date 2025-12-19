import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../utils/api';
import toast from 'react-hot-toast';
import { 
  requestNotificationPermission, 
  onForegroundMessage,
  areNotificationsEnabled 
} from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [fcmToken, setFcmToken] = useState(null);
  
  // Auto logout after 30 minutes of inactivity
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Configure axios defaults and interceptor
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Add response interceptor to handle 401 errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token invalid or expired - logout user
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await axios.get(`${BASE_API_URL}/auth/me`);
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register FCM token when user logs in
  useEffect(() => {
    if (!user || fcmToken) return;

    const registerFCMToken = async () => {
      try {
        // Request notification permission and get FCM token
        const token = await requestNotificationPermission();
        
        if (token) {
          setFcmToken(token);
          
          // Register token with backend
          await axios.post(`${BASE_API_URL}/notifications/register-device`, {
            fcmToken: token
          });
          
          console.log('FCM token registered successfully');
          toast.success('🔔 Push notifications enabled!', { duration: 2000 });
        } else {
          console.log('FCM token not available');
        }
      } catch (error) {
        console.error('Failed to register FCM token:', error);
      }
    };

    // Ask for permission after a short delay (better UX)
    const timer = setTimeout(() => {
      registerFCMToken();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, fcmToken]);

  // Listen for foreground messages
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onForegroundMessage((notification) => {
      // Show toast notification
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            onClick={() => {
              if (notification.actionUrl) {
                window.location.href = notification.actionUrl;
              }
              toast.dismiss(t.id);
            }}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 text-xl">🔔</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.body}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t.id);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    });

    return unsubscribe;
  }, [user]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    // Track various user activities
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [user]);

  // Check for inactivity and auto logout
  useEffect(() => {
    if (!user) return;

    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toast.error('You have been logged out due to inactivity');
        window.location.href = '/';
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInactivity);
  }, [user, lastActivity, INACTIVITY_TIMEOUT]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${BASE_API_URL}/auth/login`, {
        username,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      const isUnverified = error.response?.data?.isUnverified || false;
      const email = error.response?.data?.email || '';
      const phone = error.response?.data?.phone || '';
      const userId = error.response?.data?.userId || '';
      
      if (!isUnverified) {
        toast.error(message);
      }
      
      return { 
        success: false, 
        message,
        isUnverified,
        email,
        phone,
        userId,
        username
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await axios.post(`${BASE_API_URL}/auth/register`, formData);

      // New flow: No token returned, email verification required
      // Return email and username for CheckEmailPage
      toast.success('Registration successful! Please check your email.');
      return {
        success: true,
        email: response.data.email,
        username: response.data.username
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data) => {
    try {
      const response = await axios.put(`${BASE_API_URL}/auth/profile`, data);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(`${BASE_API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return false;
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await axios.post(`${BASE_API_URL}/auth/resend-verification`, { email });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend verification email';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateEmail = async (currentEmail, newEmail) => {
    try {
      const response = await axios.put(`${BASE_API_URL}/auth/update-email`, {
        currentEmail,
        newEmail
      });
      toast.success(response.data.message);
      return { success: true, email: response.data.email };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update email';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resendVerification,
    updateEmail,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
