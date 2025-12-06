import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://nlistplanet-usm-api.onrender.com/api';
export const BASE_API_URL = API_URL;

axios.defaults.baseURL = API_URL;

if (!process.env.REACT_APP_API_URL) {
  // eslint-disable-next-line no-console
  console.warn('REACT_APP_API_URL not provided. Falling back to production backend URL.');
}

// Listings API
export const listingsAPI = {
  getAll: (params) => axios.get('/listings', { params }),
  getMy: (params) => axios.get('/listings/my', { params }),
  getMyPlacedBids: () => axios.get('/listings/my-placed-bids'),
  create: (data) => axios.post('/listings', data),
  update: (id, data) => axios.put(`/listings/${id}`, data),
  placeBid: (id, data) => axios.post(`/listings/${id}/bid`, data),
  boost: (id) => axios.put(`/listings/${id}/boost`),
  acceptBid: (listingId, bidId) => axios.put(`/listings/${listingId}/bids/${bidId}/accept`),
  rejectBid: (listingId, bidId) => axios.put(`/listings/${listingId}/bids/${bidId}/reject`),
  counterBid: (listingId, bidId, data) => axios.put(`/listings/${listingId}/bids/${bidId}/counter`, data),
  delete: (id) => axios.delete(`/listings/${id}`),
  // New actions
  markAsSold: (id, data) => axios.put(`/listings/${id}/mark-sold`, data),
  cancel: (id, data) => axios.put(`/listings/${id}/cancel`, data),
  getCompletedDeals: () => axios.get('/listings/completed-deals'),
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
  banUser: (id, isBanned) => axios.put(`/admin/users/${id}/ban`, { isBanned }),
  getListings: (params) => axios.get('/admin/listings', { params }),
  deleteListing: (id) => axios.delete(`/admin/listings/${id}`),
  updateListingStatus: (id, status) => axios.put(`/admin/listings/${id}/status`, { status }),
  getTransactions: (params) => axios.get('/admin/transactions', { params }),
  getReports: (params) => axios.get('/admin/reports', { params }),
  getSettings: () => axios.get('/admin/settings'),
  updateSettings: (data) => axios.put('/admin/settings', data),
  createCompany: (data) => axios.post('/admin/companies', data),
  // Completed Deals
  getCompletedDeals: (params) => axios.get('/admin/completed-deals', { params }),
  markDealContacted: (id, data) => axios.put(`/admin/completed-deals/${id}/mark-contacted`, data),
  getCompletedDealsStats: () => axios.get('/admin/completed-deals/stats'),
};

export default axios;
