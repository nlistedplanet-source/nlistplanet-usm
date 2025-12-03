import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, DollarSign, Package, Calendar, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';
import { formatCurrency, formatNumber } from '../../utils/helpers';

const ReportsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('30');
  const [reports, setReports] = useState({
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      bannedUsers: 0,
      totalTransactions: 0,
      recentTransactions: 0
    },
    userGrowth: [],
    listingStats: {
      byType: [],
      byStatus: []
    },
    revenue: {
      byType: [],
      timeline: []
    },
    topCompanies: []
  });

  // Fetch reports
  const fetchReports = async (days = '30') => {
    try {
      setLoading(true);
      const response = await adminAPI.getReports({ period: days });
      setReports(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
      console.error('Fetch reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, []);

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    fetchReports(newPeriod);
  };

  // Calculate totals
  const totalRevenue = reports.revenue.byType.reduce((sum, item) => sum + item.totalAmount, 0);
  const sellListings = reports.listingStats.byType.find(l => l._id === 'sell')?.count || 0;
  const buyListings = reports.listingStats.byType.find(l => l._id === 'buy')?.count || 0;

  return (
    <div className="p-3 max-w-full">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="text-purple-600" size={22} />
            <h1 className="text-xl font-bold text-gray-900">Platform Reports</h1>
          </div>
          <p className="text-xs text-gray-600">Analytics and insights for the last {period} days</p>
        </div>
        <button
          onClick={() => fetchReports(period)}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Period Filter */}
      <div className="mb-3 flex gap-1.5">
        {['7', '30', '90', '365'].map((days) => (
          <button
            key={days}
            onClick={() => handlePeriodChange(days)}
            className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition-colors ${
              period === days
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {days === '7' ? 'Last 7 Days' : 
             days === '30' ? 'Last 30 Days' : 
             days === '90' ? 'Last 90 Days' : 
             'Last Year'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-blue-600 font-medium">Total Users</p>
                <Users className="text-blue-600" size={20} />
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(reports.overview.totalUsers)}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Active: {formatNumber(reports.overview.activeUsers)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-green-600 font-medium">Total Revenue</p>
                <DollarSign className="text-green-600" size={20} />
              </div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Last {period} days
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 border border-purple-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-purple-600 font-medium">Transactions</p>
                <TrendingUp className="text-purple-600" size={20} />
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(reports.overview.totalTransactions)}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Recent: {formatNumber(reports.overview.recentTransactions)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-orange-600 font-medium">Sell Listings</p>
                <Package className="text-orange-600" size={20} />
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(sellListings)}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Total listings
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3 border border-pink-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-pink-600 font-medium">Buy Requests</p>
                <Package className="text-pink-600" size={20} />
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(buyListings)}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Total requests
              </p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <DollarSign size={16} className="text-green-600" />
                Revenue Breakdown
              </h3>
              <div className="space-y-2">
                {reports.revenue.byType.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {item._id === 'platform_fee' ? 'Platform Fees' :
                         item._id === 'boost_fee' ? 'Boost Fees' :
                         item._id === 'affiliate_commission' ? 'Affiliate Commissions' : item._id}
                      </p>
                      <p className="text-xs text-gray-600">{item.count} transactions</p>
                    </div>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(item.totalAmount)}</p>
                  </div>
                ))}
                {reports.revenue.byType.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No revenue data available</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Package size={16} className="text-blue-600" />
                Listings by Status
              </h3>
              <div className="space-y-2">
                {reports.listingStats.byStatus.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item._id === 'active' ? 'bg-green-100 text-green-700' :
                        item._id === 'sold' ? 'bg-purple-100 text-purple-700' :
                        item._id === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item._id.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatNumber(item.count)}</p>
                  </div>
                ))}
                {reports.listingStats.byStatus.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No listing data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Companies */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-purple-600" />
              Top 10 Companies by Listing Value
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Listings</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.topCompanies.map((company, index) => (
                    <tr key={company._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-bold text-gray-900">#{index + 1}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">{company._id}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{formatNumber(company.totalListings)}</td>
                      <td className="px-3 py-2 text-sm font-bold text-green-600">{formatCurrency(company.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reports.topCompanies.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-6">No company data available</p>
              )}
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <Calendar size={16} className="text-blue-600" />
              User Growth Timeline
            </h3>
            <div className="space-y-1">
              {reports.userGrowth.slice(-10).map((day) => (
                <div key={day._id} className="flex items-center gap-2">
                  <p className="text-xs text-gray-600 w-24">{new Date(day._id).toLocaleDateString('en-GB')}</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.min((day.count / Math.max(...reports.userGrowth.map(d => d.count))) * 100, 100)}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{day.count}</span>
                    </div>
                  </div>
                </div>
              ))}
              {reports.userGrowth.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-6">No user growth data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsManagement;
