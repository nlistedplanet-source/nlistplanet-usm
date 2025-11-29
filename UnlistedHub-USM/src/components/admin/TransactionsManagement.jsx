import React, { useState, useEffect } from 'react';
import { Search, DollarSign, TrendingUp, Filter, Calendar, User, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';

const TransactionsManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({
    totalAmount: 0,
    platformFees: 0,
    boostFees: 0,
    commissions: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch transactions
  const fetchTransactions = async (page = 1, search = '', type = '', status = '') => {
    try {
      setLoading(true);
      const response = await adminAPI.getTransactions({
        page,
        limit: pagination.limit,
        search,
        type,
        status
      });
      setTransactions(response.data.data);
      setStats(response.data.stats);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch transactions');
      console.error('Fetch transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(pagination.page, searchTerm, filterType, filterStatus);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions(1, searchTerm, filterType, filterStatus);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchTransactions(newPage, searchTerm, filterType, filterStatus);
    }
  };

  // Get transaction type label
  const getTypeLabel = (type) => {
    const labels = {
      platform_fee: 'Platform Fee',
      boost_fee: 'Boost Fee',
      affiliate_commission: 'Affiliate Commission'
    };
    return labels[type] || type;
  };

  // Get transaction type color
  const getTypeColor = (type) => {
    const colors = {
      platform_fee: 'bg-blue-100 text-blue-700',
      boost_fee: 'bg-purple-100 text-purple-700',
      affiliate_commission: 'bg-green-100 text-green-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="text-green-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Transactions Management</h1>
        </div>
        <p className="text-sm text-gray-600">View and manage all platform transactions</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-4 space-y-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company or description..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              fetchTransactions(1, searchTerm, e.target.value, filterStatus);
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="platform_fee">Platform Fee</option>
            <option value="boost_fee">Boost Fee</option>
            <option value="affiliate_commission">Affiliate Commission</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              fetchTransactions(1, searchTerm, filterType, e.target.value);
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {(searchTerm || filterType || filterStatus) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setFilterStatus('');
                fetchTransactions(1, '', '', '');
              }}
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium mb-0.5">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <DollarSign className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium mb-0.5">Platform Fees</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.platformFees)}</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium mb-0.5">Boost Fees</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.boostFees)}</p>
            </div>
            <Package className="text-purple-600" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-medium mb-0.5">Commissions</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.commissions)}</p>
            </div>
            <User className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16">
          <DollarSign className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No transactions found</h3>
          <p className="text-sm text-gray-500">
            {searchTerm || filterType || filterStatus ? 'Try different filters' : 'No transactions available yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar size={12} />
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(transaction.type)}`}>
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{transaction.companyName || 'N/A'}</p>
                        {transaction.description && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">{transaction.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {transaction.type === 'affiliate_commission' && transaction.affiliateId ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.affiliateId.fullName}</p>
                            <p className="text-xs text-gray-500">@{transaction.affiliateId.username}</p>
                          </div>
                        ) : transaction.buyerId ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.buyerId.fullName}</p>
                            <p className="text-xs text-gray-500">@{transaction.buyerId.username}</p>
                          </div>
                        ) : transaction.sellerId ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.sellerId.fullName}</p>
                            <p className="text-xs text-gray-500">@{transaction.sellerId.username}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                        {transaction.tradeAmount && (
                          <p className="text-xs text-gray-500">Trade: {formatCurrency(transaction.tradeAmount)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                          {transaction.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} transactions
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.pages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1.5 text-sm rounded-lg ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return <span key={pageNum} className="px-1.5">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionsManagement;
