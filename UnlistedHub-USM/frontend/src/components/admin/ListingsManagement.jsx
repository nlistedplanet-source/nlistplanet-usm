import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Trash2, Eye, Calendar, Package, DollarSign, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';
import { formatDate, formatCurrency, formatNumber } from '../../utils/helpers';

const ListingsManagement = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch listings
  const fetchListings = async (page = 1, search = '', type = '', status = '') => {
    try {
      setLoading(true);
      const response = await adminAPI.getListings({
        page,
        limit: pagination.limit,
        search,
        type,
        status
      });
      setListings(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch listings');
      console.error('Fetch listings error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(pagination.page, searchTerm, filterType, filterStatus);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings(1, searchTerm, filterType, filterStatus);
  };

  // Delete listing
  const handleDelete = async (listingId, companyName) => {
    const confirm = window.confirm(
      `Are you sure you want to delete listing for "${companyName}"?`
    );
    
    if (!confirm) return;

    try {
      await adminAPI.deleteListing(listingId);
      toast.success('Listing deleted successfully!');
      fetchListings(pagination.page, searchTerm, filterType, filterStatus);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete listing');
    }
  };

  // Update status
  const handleStatusChange = async (listingId, newStatus) => {
    try {
      await adminAPI.updateListingStatus(listingId, newStatus);
      toast.success('Listing status updated!');
      fetchListings(pagination.page, searchTerm, filterType, filterStatus);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchListings(newPage, searchTerm, filterType, filterStatus);
    }
  };

  // Stats
  const totalSellListings = listings.filter(l => l.type === 'sell').length;
  const totalBuyListings = listings.filter(l => l.type === 'buy').length;
  const activeListings = listings.filter(l => l.status === 'active').length;

  return (
    <div className="p-3 max-w-full">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="text-green-600" size={22} />
          <h1 className="text-xl font-bold text-gray-900">Listings Management</h1>
        </div>
        <p className="text-xs text-gray-600">Manage all platform listings and marketplace posts</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-3 space-y-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company name or username..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
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
              fetchListings(1, searchTerm, e.target.value, filterStatus);
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="sell">Sell Posts</option>
            <option value="buy">Buy Requests</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              fetchListings(1, searchTerm, filterType, e.target.value);
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>

          {(searchTerm || filterType || filterStatus) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setFilterStatus('');
                fetchListings(1, '', '', '');
              }}
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <TrendingUp className="text-blue-600" size={28} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Sell Posts</p>
              <p className="text-2xl font-bold text-gray-900">{totalSellListings}</p>
            </div>
            <TrendingDown className="text-green-600" size={28} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Buy Requests</p>
              <p className="text-2xl font-bold text-gray-900">{totalBuyListings}</p>
            </div>
            <Package className="text-purple-600" size={28} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-medium">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeListings}</p>
            </div>
            <Eye className="text-orange-600" size={28} />
          </div>
        </div>
      </div>

      {/* Listings Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto text-gray-400 mb-3" size={40} />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No listings found</h3>
          <p className="text-sm text-gray-500">
            {searchTerm || filterType || filterStatus ? 'Try different filters' : 'No listings available yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">Company</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">Type</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">User</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">Price Breakdown</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">Created</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">Status</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-2">
                          {listing.companyId?.logo ? (
                            <img src={listing.companyId.logo} alt="" className="w-7 h-7 rounded object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-bold text-[10px]">
                                {listing.companyName?.[0] || 'C'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-[11px]">{listing.companyName}</p>
                            {listing.companyId?.scriptName && (
                              <p className="text-[10px] text-gray-500">{listing.companyId.scriptName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          listing.type === 'sell' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {listing.type === 'sell' ? 'SELL' : 'BUY'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <div>
                          <p className="text-[11px] font-medium text-gray-900">
                            {listing.userId?.fullName || 'N/A'}
                          </p>
                          <p className="text-[10px] text-gray-500">@{listing.username}</p>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="space-y-0.5 text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Base:</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(listing.baseAmount || (listing.price * listing.quantity))}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-orange-600">Fee (2%):</span>
                            <span className="font-medium text-orange-600">
                              {formatCurrency(listing.platformFee || ((listing.price * listing.quantity * 2) / 100))}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 pt-0.5 border-t border-gray-200">
                            <span className="text-gray-700 font-medium">Total:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(listing.totalAmount || (listing.price * listing.quantity * 1.02))}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                            <Package size={10} />
                            {formatNumber(listing.quantity)} shares × {formatCurrency(listing.price)}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-gray-600">
                          <Calendar size={10} />
                          {formatDate(listing.createdAt)}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <select
                          value={listing.status}
                          onChange={(e) => handleStatusChange(listing._id, e.target.value)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border-0 cursor-pointer ${
                            listing.status === 'active' ? 'bg-green-100 text-green-700' :
                            listing.status === 'sold' ? 'bg-purple-100 text-purple-700' :
                            listing.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="sold">Sold</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="expired">Expired</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => handleDelete(listing._id, listing.companyName)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs">
              <p className="text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} listings
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
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
                        className={`px-4 py-2 rounded-lg ${
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
                    return <span key={pageNum} className="px-2">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ListingsManagement;
