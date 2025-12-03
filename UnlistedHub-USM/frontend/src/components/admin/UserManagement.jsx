import React, { useState, useEffect } from 'react';
import { Search, Users, Ban, CheckCircle, Mail, Calendar, TrendingUp, Package, Clock, Trash2, Phone, Shield, User, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';
import { formatDate } from '../../utils/helpers';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch users
  const fetchUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({
        page,
        limit: pagination.limit,
        search
      });
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page, searchTerm);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, searchTerm);
  };

  // Ban/Unban user
  const handleBanToggle = async (userId, currentBanStatus, username) => {
    const action = currentBanStatus ? 'unban' : 'ban';
    const confirm = window.confirm(
      `Are you sure you want to ${action} user "${username}"?`
    );
    
    if (!confirm) return;

    try {
      await adminAPI.banUser(userId, !currentBanStatus);
      toast.success(`User ${action}ned successfully!`);
      fetchUsers(pagination.page, searchTerm);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, username) => {
    const confirm = window.confirm(
      `⚠️ WARNING: This will permanently delete user "${username}" and all their listings. This action cannot be undone!\n\nAre you sure?`
    );
    
    if (!confirm) return;

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully!');
      fetchUsers(pagination.page, searchTerm);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchUsers(newPage, searchTerm);
    }
  };

  return (
    <div className="p-3 max-w-full">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Users className="text-blue-600" size={22} />
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        </div>
        <p className="text-xs text-gray-600">Manage all platform users and their activities</p>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username, email, or full name..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchUsers(1, '');
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <Users className="text-blue-600" size={28} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => !u.isBanned).length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={28} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium">Banned Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.isBanned).length}
              </p>
            </div>
            <Ban className="text-red-600" size={28} />
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <Users className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try a different search term' : 'No users registered yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">User</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">Email</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">Phone</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 uppercase text-[10px]">Role</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 uppercase text-[10px]">KYC</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 uppercase text-[10px]">Listings</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 uppercase text-[10px]">Trades</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">Joined</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 uppercase text-[10px]">Last Login</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 uppercase text-[10px]">Status</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 uppercase text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {user.fullName?.[0] || user.username[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate text-[11px]">{user.fullName || 'N/A'}</p>
                            <p className="text-gray-500 truncate text-[10px]">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Mail size={10} className="flex-shrink-0" />
                          <span className="truncate max-w-[130px]">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        {user.phone ? (
                          <div className="flex items-center gap-1 text-gray-700">
                            <Phone size={10} className="flex-shrink-0" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          user.kycStatus === 'verified' ? 'bg-green-100 text-green-700' :
                          user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          user.kycStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {user.kycStatus || 'none'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span className="font-medium text-green-700">{user.listingsCount || 0}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span className="font-medium text-blue-700">{user.tradesCount || 0}</span>
                      </td>
                      <td className="px-2 py-1.5 text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-2 py-1.5 text-gray-500">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                          : <span className="text-gray-400">Never</span>
                        }
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {user.isBanned ? (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium inline-flex items-center gap-0.5">
                            <Ban size={10} /> Banned
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium inline-flex items-center gap-0.5">
                            <CheckCircle size={10} /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            onClick={() => handleBanToggle(user._id, user.isBanned, user.username)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              user.isBanned
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }`}
                            title={user.isBanned ? 'Unban User' : 'Ban User'}
                          >
                            {user.isBanned ? 'Unban' : 'Ban'}
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user._id, user.username)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors inline-flex items-center gap-0.5"
                              title="Delete User"
                            >
                              <Trash2 size={10} /> Delete
                            </button>
                          )}
                        </div>
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
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.pages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  // Show first page, last page, current page, and pages around current
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

export default UserManagement;
