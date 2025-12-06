import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Handshake, 
  Phone, 
  CheckCircle, 
  Clock, 
  Shield, 
  Key, 
  User,
  Calendar,
  Filter,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';

const CompletedDealsManagement = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    rmContacted: 0,
    completed: 0,
    totalValue: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch completed deals
  const fetchDeals = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const response = await adminAPI.getCompletedDeals({
        page,
        limit: pagination.limit,
        search,
        status
      });
      setDeals(response.data.data || []);
      setStats(response.data.stats || stats);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      toast.error('Failed to fetch completed deals');
      console.error('Fetch completed deals error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals(pagination.page, searchTerm, filterStatus);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchDeals(1, searchTerm, filterStatus);
  };

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    fetchDeals(1, searchTerm, status);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchDeals(newPage, searchTerm, filterStatus);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(`${type}-${code}`);
    toast.success(`${type === 'user' ? 'User' : 'RM'} code copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Mark as RM contacted
  const handleMarkContacted = async (dealId, notes = '') => {
    try {
      await adminAPI.markDealContacted(dealId, { rmNotes: notes });
      toast.success('Deal marked as RM contacted');
      fetchDeals(pagination.page, searchTerm, filterStatus);
    } catch (error) {
      toast.error('Failed to update deal status');
      console.error('Mark contacted error:', error);
    }
  };

  // Get status config
  const getStatusConfig = (status) => {
    const configs = {
      pending_rm_contact: {
        label: 'Awaiting RM Call',
        color: 'bg-amber-100 text-amber-700',
        icon: Clock
      },
      rm_contacted: {
        label: 'RM Contacted',
        color: 'bg-blue-100 text-blue-700',
        icon: Phone
      },
      documents_pending: {
        label: 'Documents Pending',
        color: 'bg-purple-100 text-purple-700',
        icon: FileText
      },
      payment_pending: {
        label: 'Payment Pending',
        color: 'bg-orange-100 text-orange-700',
        icon: Clock
      },
      completed: {
        label: 'Completed',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-700',
        icon: AlertCircle
      }
    };
    return configs[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Handshake className="text-emerald-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Completed Deals</h1>
        </div>
        <p className="text-gray-500 text-sm">Manage accepted deals and RM verification codes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Handshake className="text-emerald-500" size={18} />
            <span className="text-xs text-gray-500">Total Deals</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="text-amber-500" size={18} />
            <span className="text-xs text-gray-500">Awaiting Call</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="text-blue-500" size={18} />
            <span className="text-xs text-gray-500">RM Contacted</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{stats.rmContacted}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="text-green-500" size={18} />
            <span className="text-xs text-gray-500">Completed</span>
          </div>
          <p className="text-xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-500 text-sm">₹</span>
            <span className="text-xs text-gray-500">Total Value</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by company, buyer, or seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Search
            </button>
          </form>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="pending_rm_contact">Awaiting RM Call</option>
                <option value="rm_contacted">RM Contacted</option>
                <option value="documents_pending">Documents Pending</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={() => fetchDeals(pagination.page, searchTerm, filterStatus)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
            <p>Loading deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Handshake className="mx-auto mb-2 text-gray-300" size={48} />
            <p className="font-medium">No completed deals found</p>
            <p className="text-sm">Accepted deals will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Company</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Buyer</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Seller</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Deal Details</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Verification Codes</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deals.map((deal) => {
                  const statusConfig = getStatusConfig(deal.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr key={deal._id} className="hover:bg-gray-50">
                      {/* Company */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{deal.companyName}</div>
                        <div className="text-xs text-gray-500">{formatDate(deal.dealAcceptedAt || deal.createdAt)}</div>
                      </td>

                      {/* Buyer */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-green-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              @{deal.buyerId?.username || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">{deal.buyerId?.email}</div>
                            <div className="text-xs text-gray-500">{deal.buyerId?.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Seller */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-red-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              @{deal.sellerId?.username || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">{deal.sellerId?.email}</div>
                            <div className="text-xs text-gray-500">{deal.sellerId?.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Deal Details */}
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500">Price:</span>
                            <span className="font-medium">{formatCurrency(deal.agreedPrice)}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500">Qty:</span>
                            <span className="font-medium">{deal.quantity?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-bold text-emerald-600">{formatCurrency(deal.totalAmount)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Verification Codes */}
                      <td className="py-3 px-4">
                        <div className="space-y-2">
                          {/* Buyer's User Code */}
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <Key size={12} className="text-amber-600" />
                                <span className="text-[10px] text-amber-700 font-medium">Buyer Code</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(deal.buyerVerificationCode, 'user')}
                                className="p-1 hover:bg-amber-100 rounded"
                                title="Copy code"
                              >
                                {copiedCode === `user-${deal.buyerVerificationCode}` ? (
                                  <Check size={12} className="text-green-600" />
                                ) : (
                                  <Copy size={12} className="text-amber-600" />
                                )}
                              </button>
                            </div>
                            <div className="font-mono font-bold text-amber-900 tracking-wider">
                              {deal.buyerVerificationCode}
                            </div>
                          </div>

                          {/* Seller's User Code */}
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <Key size={12} className="text-orange-600" />
                                <span className="text-[10px] text-orange-700 font-medium">Seller Code</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(deal.sellerVerificationCode, 'seller')}
                                className="p-1 hover:bg-orange-100 rounded"
                                title="Copy code"
                              >
                                {copiedCode === `seller-${deal.sellerVerificationCode}` ? (
                                  <Check size={12} className="text-green-600" />
                                ) : (
                                  <Copy size={12} className="text-orange-600" />
                                )}
                              </button>
                            </div>
                            <div className="font-mono font-bold text-orange-900 tracking-wider">
                              {deal.sellerVerificationCode}
                            </div>
                          </div>

                          {/* RM Code */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <Shield size={12} className="text-emerald-600" />
                                <span className="text-[10px] text-emerald-700 font-medium">RM Code</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(deal.rmVerificationCode, 'rm')}
                                className="p-1 hover:bg-emerald-100 rounded"
                                title="Copy code"
                              >
                                {copiedCode === `rm-${deal.rmVerificationCode}` ? (
                                  <Check size={12} className="text-green-600" />
                                ) : (
                                  <Copy size={12} className="text-emerald-600" />
                                )}
                              </button>
                            </div>
                            <div className="font-mono font-bold text-emerald-900 tracking-wider">
                              {deal.rmVerificationCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </span>
                        {deal.rmNotes && (
                          <div className="mt-1 text-xs text-gray-500 max-w-[150px] truncate" title={deal.rmNotes}>
                            Note: {deal.rmNotes}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        {deal.status === 'pending_rm_contact' && (
                          <button
                            onClick={() => handleMarkContacted(deal._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                          >
                            <Phone size={12} />
                            Mark Contacted
                          </button>
                        )}
                        {deal.status === 'rm_contacted' && (
                          <button
                            onClick={() => {
                              const notes = prompt('Enter completion notes (optional):');
                              if (notes !== null) {
                                handleMarkContacted(deal._id, notes);
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                          >
                            <CheckCircle size={12} />
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} deals
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Verification Code System</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li><strong>User Code:</strong> Ask users for this code to verify their identity before discussing deal details.</li>
              <li><strong>RM Code:</strong> Share this code with users so they can verify you're a genuine representative.</li>
              <li>Always verify both codes before proceeding with any transaction.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedDealsManagement;
