import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AdManagement = () => {
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    position: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    position: 'home-banner',
    status: 'active',
    startDate: '',
    endDate: '',
    priority: 5
  });

  const positionOptions = [
    { value: 'home-banner', label: 'Home Banner' },
    { value: 'home-sidebar', label: 'Home Sidebar' },
    { value: 'listings-top', label: 'Listings Top' },
    { value: 'listings-sidebar', label: 'Listings Sidebar' },
    { value: 'company-detail', label: 'Company Detail' }
  ];

  useEffect(() => {
    fetchAds();
  }, [filters]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.position) params.append('position', filters.position);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/admin/ads?${params.toString()}`);
      setAds(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await api.put(`/admin/ads/${editingAd._id}`, formData);
      } else {
        await api.post('/admin/ads', formData);
      }
      setShowForm(false);
      setEditingAd(null);
      resetForm();
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      alert(error.response?.data?.message || 'Failed to save ad');
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl,
      position: ad.position,
      status: ad.status,
      startDate: new Date(ad.startDate).toISOString().split('T')[0],
      endDate: new Date(ad.endDate).toISOString().split('T')[0],
      priority: ad.priority
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    try {
      await api.delete(`/admin/ads/${id}`);
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Failed to delete ad');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/ads/${id}/status`, { status: newStatus });
      fetchAds();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      targetUrl: '',
      position: 'home-banner',
      status: 'active',
      startDate: '',
      endDate: '',
      priority: 5
    });
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
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getPositionLabel = (position) => {
    const option = positionOptions.find(opt => opt.value === position);
    return option?.label || position;
  };

  if (loading) {
    return <div className="text-center py-8 text-[11px]">Loading ads...</div>;
  }

  return (
    <div className="p-4 text-[11px]">
      {/* Header & Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Ad Management</h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingAd(null);
              resetForm();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Create New Ad
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-gray-500 text-[10px]">Total Ads</div>
            <div className="text-xl font-bold">{stats.totalAds || 0}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-gray-500 text-[10px]">Active Ads</div>
            <div className="text-xl font-bold text-green-600">{stats.activeAds || 0}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-gray-500 text-[10px]">Total Impressions</div>
            <div className="text-xl font-bold">{stats.totalImpressions?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-gray-500 text-[10px]">Total Clicks</div>
            <div className="text-xl font-bold">{stats.totalClicks?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-gray-500 text-[10px]">Avg CTR</div>
            <div className="text-xl font-bold text-blue-600">{stats.avgCTR || 0}%</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search ads..."
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
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={filters.position}
            onChange={(e) => setFilters({ ...filters, position: e.target.value })}
            className="border rounded px-3 py-2 text-[11px]"
          >
            <option value="">All Positions</option>
            {positionOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold mb-4">
              {editingAd ? 'Edit Ad' : 'Create New Ad'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-[11px]"
                  required
                  maxLength="100"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-[11px]"
                  rows="3"
                  maxLength="500"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Image URL *</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-[11px]"
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Target URL *</label>
                <input
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-[11px]"
                  required
                  placeholder="https://example.com/landing-page"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">Position *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-[11px]"
                    required
                  >
                    {positionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-[11px]"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-[11px]"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-[11px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Priority (0-10)</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2 text-[11px]"
                  min="0"
                  max="10"
                />
                <p className="text-[10px] text-gray-500 mt-1">Higher priority ads show first</p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAd(null);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Preview</th>
              <th className="px-4 py-3 text-left font-semibold">Title & Position</th>
              <th className="px-4 py-3 text-left font-semibold">Date Range</th>
              <th className="px-4 py-3 text-left font-semibold">Performance</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ads.map(ad => (
              <tr key={ad._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-20 h-12 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x48?text=No+Image';
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{ad.title}</div>
                  <div className="text-[10px] text-gray-500">{getPositionLabel(ad.position)}</div>
                  <div className="text-[10px] text-blue-600">Priority: {ad.priority}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[10px]">
                    <div>Start: {formatDate(ad.startDate)}</div>
                    <div>End: {formatDate(ad.endDate)}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[10px] space-y-1">
                    <div>Impressions: {ad.impressions.toLocaleString()}</div>
                    <div>Clicks: {ad.clicks.toLocaleString()}</div>
                    <div className="font-medium text-blue-600">
                      CTR: {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(ad.status)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="text-blue-600 hover:text-blue-800 text-left"
                    >
                      Edit
                    </button>
                    {ad.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(ad._id, 'paused')}
                        className="text-yellow-600 hover:text-yellow-800 text-left"
                      >
                        Pause
                      </button>
                    ) : ad.status === 'paused' ? (
                      <button
                        onClick={() => handleStatusChange(ad._id, 'active')}
                        className="text-green-600 hover:text-green-800 text-left"
                      >
                        Activate
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="text-red-600 hover:text-red-800 text-left"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No ads found. Create your first ad to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdManagement;
