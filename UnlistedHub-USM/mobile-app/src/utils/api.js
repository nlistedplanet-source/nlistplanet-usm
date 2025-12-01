import axios from 'axios';

// API Base URL - Update for production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  updateEmail: (data) => api.put('/auth/update-email', data),
};

// Listings API
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),
  getMyListings: () => api.get('/listings/my'),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  placeBid: (id, data) => api.post(`/listings/${id}/bid`, data),
  getBids: (id) => api.get(`/listings/${id}/bids`),
  acceptBid: (listingId, bidId) => api.put(`/listings/${listingId}/bids/${bidId}/accept`),
  rejectBid: (listingId, bidId) => api.put(`/listings/${listingId}/bids/${bidId}/reject`),
  counterOffer: (listingId, bidId, data) => api.post(`/listings/${listingId}/bids/${bidId}/counter`, data),
  withdrawBid: (listingId, bidId) => api.delete(`/listings/${listingId}/bids/${bidId}`),
  like: (id) => api.post(`/listings/${id}/like`),
  unlike: (id) => api.delete(`/listings/${id}/like`),
  boost: (id) => api.post(`/listings/${id}/boost`),
};

// Portfolio API
export const portfolioAPI = {
  getStats: () => api.get('/portfolio/stats'),
  getHoldings: () => api.get('/portfolio/holdings'),
  getActivities: (params) => api.get('/portfolio/activities', { params }),
  getTransactions: () => api.get('/portfolio/transactions'),
};

// Companies API
export const companiesAPI = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  search: (query) => api.get('/companies/search', { params: { q: query } }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.post('/notifications/clear-all'),
};

// Referrals API
export const referralsAPI = {
  getStats: () => api.get('/referrals/stats'),
  getHistory: () => api.get('/referrals/history'),
  validateCode: (code) => api.post('/referrals/validate-code', { code }),
};

// KYC API
export const kycAPI = {
  upload: (formData) => api.post('/kyc/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getStatus: () => api.get('/kyc/status'),
};

// Admin APIs
export const adminAPI = {
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  approveKYC: (userId) => api.put(`/admin/users/${userId}/kyc/approve`),
  rejectKYC: (userId, reason) => api.put(`/admin/users/${userId}/kyc/reject`, { reason }),
  
  // Listings
  getListings: (params) => api.get('/admin/listings', { params }),
  deleteListing: (id) => api.delete(`/admin/listings/${id}`),
  
  // Transactions
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  updateTransaction: (id, data) => api.put(`/admin/transactions/${id}`, data),
  
  // Companies
  createCompany: (data) => api.post('/admin/companies', data),
  updateCompany: (id, data) => api.put(`/admin/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/admin/companies/${id}`),
  
  // Ads
  getAds: () => api.get('/admin/ads'),
  createAd: (data) => api.post('/admin/ads', data),
  updateAd: (id, data) => api.put(`/admin/ads/${id}`, data),
  deleteAd: (id) => api.delete(`/admin/ads/${id}`),
  
  // Referrals
  getReferrals: (params) => api.get('/admin/referrals', { params }),
  
  // Reports
  getReports: (params) => api.get('/admin/reports', { params }),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

export default api;
