import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ReferralTracking = () => {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({});
  const [overviewStats, setOverviewStats] = useState({});
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReferralStats();
    fetchReferrals();
  }, [filters]);

  const fetchReferralStats = async () => {
    try {
      const response = await api.get('/admin/referrals/stats');
      setOverviewStats(response.data.data.overview);
      setStats(response.data.data.financial);
      setTopReferrers(response.data.data.topReferrers);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/admin/referrals?${params.toString()}`);
      setReferrals(response.data.data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/referrals/${id}/status`, { status: newStatus });
      fetchReferrals();
      fetchReferralStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleMarkAsPaid = async (referral) => {
    const paymentMethod = prompt('Enter payment method (UPI/Bank Transfer/Other):');
    if (!paymentMethod) return;

    const paymentReference = prompt('Enter payment reference/transaction ID:');
    if (!paymentReference) return;

    try {
      await api.put(`/admin/referrals/${referral._id}/status`, {
        status: 'paid',
        paymentMethod,
        paymentReference
      });
      fetchReferrals();
      fetchReferralStats();
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Failed to mark as paid');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading && referrals.length === 0) {
    return <div className="text-center py-8 text-[11px]">Loading referral data...</div>;
  }

  return (
    <div className="p-4 text-[11px]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4">Referral Tracking & Revenue</h2>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-gray-500 text-[10px]">Total Referrals</div>
            <div className="text-xl font-bold">{overviewStats.totalReferrals || 0}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-gray-500 text-[10px]">Pending</div>
            <div className="text-xl font-bold text-yellow-600">{overviewStats.pendingReferrals || 0}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-gray-500 text-[10px]">Approved</div>
            <div className="text-xl font-bold text-blue-600">{overviewStats.approvedReferrals || 0}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-gray-500 text-[10px]">Paid</div>
            <div className="text-xl font-bold text-green-600">{overviewStats.paidReferrals || 0}</div>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-lg shadow">
            <div className="text-[10px] opacity-90">Total Deal Amount</div>
            <div className="text-lg font-bold">{formatCurrency(stats.totalDealAmount)}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-lg shadow">
            <div className="text-[10px] opacity-90">Platform Revenue</div>
            <div className="text-lg font-bold">{formatCurrency(stats.totalPlatformRevenue)}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 rounded-lg shadow">
            <div className="text-[10px] opacity-90">Total Referral Amount</div>
            <div className="text-lg font-bold">{formatCurrency(stats.totalReferralAmount)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3 rounded-lg shadow">
            <div className="text-[10px] opacity-90">Pending Payout</div>
            <div className="text-lg font-bold">{formatCurrency(stats.pendingReferralAmount)}</div>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-3 rounded-lg shadow">
            <div className="text-[10px] opacity-90">Paid Out</div>
            <div className="text-lg font-bold">{formatCurrency(stats.paidReferralAmount)}</div>
          </div>
        </div>

        {/* Top Referrers */}
        {topReferrers.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h3 className="font-bold mb-3">🏆 Top Referrers</h3>
            <div className="space-y-2">
              {topReferrers.map((referrer, index) => (
                <div key={referrer._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium">{referrer.referrerName}</span>
                  </div>
                  <div className="flex gap-4 text-[10px]">
                    <span className="text-gray-600">{referrer.totalDeals} deals</span>
                    <span className="font-bold text-green-600">{formatCurrency(referrer.totalEarnings)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search referrer/referee/company..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border rounded px-3 py-2 text-[11px]"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded px-3 py-2 text-[11px]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="border rounded px-3 py-2 text-[11px]"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="border rounded px-3 py-2 text-[11px]"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Referrer</th>
              <th className="px-4 py-3 text-left font-semibold">Referee</th>
              <th className="px-4 py-3 text-left font-semibold">Company</th>
              <th className="px-4 py-3 text-left font-semibold">Deal Details</th>
              <th className="px-4 py-3 text-left font-semibold">Revenue Breakdown</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {referrals.map(referral => (
              <tr key={referral._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-[10px]">
                  {formatDate(referral.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{referral.referrerName}</div>
                  <div className="text-[10px] text-blue-600">{referral.referrerCode}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{referral.refereeName}</div>
                  <div className="text-[10px] text-gray-500">{referral.referee?.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{referral.companyName}</div>
                  <div className="text-[10px] text-gray-500 capitalize">{referral.dealType}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[10px] space-y-0.5">
                    <div>Qty: {referral.quantity?.toLocaleString()}</div>
                    <div>Price: {formatCurrency(referral.pricePerShare)}</div>
                    <div className="font-medium">Total: {formatCurrency(referral.dealAmount)}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[10px] space-y-0.5">
                    <div className="text-gray-600">
                      Deal: {formatCurrency(referral.dealAmount)}
                    </div>
                    <div className="text-green-600">
                      Platform Fee ({referral.platformFeePercentage}%): {formatCurrency(referral.platformRevenue)}
                    </div>
                    <div className="text-purple-600 font-medium border-t pt-0.5">
                      Referral ({referral.referralCommissionPercentage}% of fee): {formatCurrency(referral.referralAmount)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(referral.status)}
                  {referral.status === 'paid' && referral.paidAt && (
                    <div className="text-[10px] text-gray-500 mt-1">
                      Paid: {formatDate(referral.paidAt)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {referral.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(referral._id, 'approved')}
                          className="text-blue-600 hover:text-blue-800 text-left text-[10px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(referral._id, 'rejected')}
                          className="text-red-600 hover:text-red-800 text-left text-[10px]"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {referral.status === 'approved' && (
                      <button
                        onClick={() => handleMarkAsPaid(referral)}
                        className="text-green-600 hover:text-green-800 text-left text-[10px]"
                      >
                        Mark as Paid
                      </button>
                    )}
                    {referral.status === 'paid' && referral.paymentReference && (
                      <div className="text-[10px] text-gray-600">
                        Ref: {referral.paymentReference}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {referrals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No referral records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralTracking;
