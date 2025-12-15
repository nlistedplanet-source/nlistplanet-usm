import axios from 'axios';

// Use hardcoded production URL to avoid stale Vercel env vars
const PROD_API_URL = 'https://nlistplanet-usm-v8dc.onrender.com/api';
const API_URL = process.env.NODE_ENV === 'development' 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
  : PROD_API_URL;

export const BASE_API_URL = API_URL;

axios.defaults.baseURL = API_URL;

if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL !== PROD_API_URL) {
  console.warn('Ignoring REACT_APP_API_URL in production to ensure stability. Using:', PROD_API_URL);
}

// Listings API
export const listingsAPI = {
  getAll: (params) => axios.get('/listings', { params }),
  getMy: (params) => axios.get('/listings/my', { params }),
  getMyPlacedBids: (userId = null) => axios.get('/listings/my-placed-bids', userId ? { params: { userId } } : {}),
  create: (data) => axios.post('/listings', data),
  update: (id, data) => axios.put(`/listings/${id}`, data),
  placeBid: (id, data) => axios.post(`/listings/${id}/bid`, data),
  boost: (id) => axios.put(`/listings/${id}/boost`),
  acceptBid: (listingId, bidId) => axios.put(`/listings/${listingId}/bids/${bidId}/accept`),
  rejectBid: (listingId, bidId) => axios.put(`/listings/${listingId}/bids/${bidId}/reject`),
  counterBid: (listingId, bidId, data) => axios.put(`/listings/${listingId}/bids/${bidId}/counter`, data),
  confirmDeal: (listingId, dealId) => axios.put(`/listings/${listingId}/deals/${dealId}/confirm`),
  rejectDeal: (listingId, dealId, reason) => axios.put(`/listings/${listingId}/deals/${dealId}/reject`, { reason }),
  getCompletedDeals: () => axios.get('/listings/completed-deals'),
  getDeal: (dealId) => axios.get(`/admin/deals/${dealId}`),
  delete: (id) => axios.delete(`/listings/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => axios.get('/notifications', { params }),
  markAsRead: (id) => axios.put(`/notifications/${id}/read`),
  markAllAsRead: () => axios.put('/notifications/read-all'),
};

// Companies API
export const companiesAPI = {
  getAll: (params) => axios.get('/companies', { params }),
  getById: (id) => axios.get(`/companies/${id}`),
  search: (query) => axios.get('/companies/search', { params: { q: query } }),
  create: (data) => axios.post('/companies', data),
  update: (id, data) => axios.put(`/companies/${id}`, data),
  delete: (id) => axios.delete(`/companies/${id}`),
};

// Transactions API
export const transactionsAPI = {
  getMyEarnings: () => axios.get('/transactions/my-earnings'),
};

// Referrals API
export const referralsAPI = {
  getMyReferrals: () => axios.get('/referrals/my-referrals'),
};

// Portfolio API
export const portfolioAPI = {
  getStats: () => axios.get('/portfolio/stats'),
  getHoldings: () => axios.get('/portfolio/holdings'),
  getActivities: (params) => axios.get('/portfolio/activities', { params }),
};

// KYC API
export const kycAPI = {
  getStatus: () => axios.get('/kyc/status'),
  submitKYC: (data) => axios.post('/kyc/submit', data),
  saveDraft: (data) => axios.post('/kyc/draft', data),
  getPending: () => axios.get('/kyc/pending'), // Admin only
  verify: (data) => axios.post('/kyc/verify', data), // Admin only
};

// Admin API
export const adminAPI = {
  getStats: () => axios.get('/admin/stats'),
  getUsers: (params) => axios.get('/admin/users', { params }),
  getUserById: (id) => axios.get(`/admin/users/${id}`),
  banUser: (id, isBanned) => axios.put(`/admin/users/${id}/ban`, { isBanned }),
  deleteUser: (id) => axios.delete(`/admin/users/${id}`),
  getListings: (params) => axios.get('/admin/listings', { params }),
  deleteListing: (id) => axios.delete(`/admin/listings/${id}`),
  updateListingStatus: (id, status) => axios.put(`/admin/listings/${id}/status`, { status }),
  getTransactions: (params) => axios.get('/admin/transactions', { params }),
  getReports: (params) => axios.get('/admin/reports', { params }),
  getSettings: () => axios.get('/admin/settings'),
  updateSettings: (data) => axios.put('/admin/settings', data),
  createCompany: (data) => axios.post('/admin/companies', data),
  downloadSampleCsv: () => axios.get('/admin/companies/sample-csv', { responseType: 'blob' }),
  bulkUploadCsv: (file) => {
    const formData = new FormData();
    formData.append('csv', file);
    return axios.post('/admin/companies/bulk-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  bulkDeleteCompanies: (ids) => axios.post('/admin/companies/bulk-delete', { ids }),
  // Deal management
  getDeals: (params) => axios.get('/admin/deals', { params }),
  getDeal: (id) => axios.get(`/admin/deals/${id}`),
  markDealAsSold: (id, notes) => axios.put(`/admin/deals/${id}/mark-sold`, { adminNotes: notes }),
  updateDealStatus: (id, status, notes) => axios.put(`/admin/deals/${id}/update-status`, { status, notes }),
  // Accepted deals management
  getAcceptedDeals: (params) => axios.get('/admin/accepted-deals', { params }),
  closeDeal: (dealId, listingId, bidId, notes) => axios.post(`/admin/accepted-deals/${dealId}/close`, { listingId, bidId, notes }),
};

export default axios;
