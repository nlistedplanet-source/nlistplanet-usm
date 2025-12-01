import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Activity,
  Plus,
  Eye,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { portfolioAPI } from '../../utils/api';
import { formatCurrency, formatPercentage, timeAgo, haptic } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { BrandLogo } from '../../components/common';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalGain: 0,
    gainPercentage: 0,
    activeListings: 0,
    completedTrades: 0,
  });
  const [holdings, setHoldings] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, holdingsRes, activitiesRes] = await Promise.all([
        portfolioAPI.getStats(),
        portfolioAPI.getHoldings(),
        portfolioAPI.getActivities({ limit: 5 }),
      ]);

      setStats(statsRes.data.data || {});
      setHoldings(holdingsRes.data.data || []);
      setActivities(activitiesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    await fetchData();
    setRefreshing(false);
    haptic.success();
  };

  if (loading) {
    return (
      <div className="min-h-screen-nav flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen-nav bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 pt-safe pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BrandLogo size={40} className="shadow-md" />
            <div>
              <p className="text-primary-100 text-sm font-medium">Welcome back,</p>
              <h1 className="text-white text-2xl font-bold">{user?.fullName || user?.username}</h1>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center touch-feedback"
          >
            <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Portfolio Value Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 text-sm font-medium">Total Portfolio Value</p>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(stats.totalValue)}
          </h2>
          <div className="flex items-center gap-2">
            {stats.gainPercentage >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-semibold ${
              stats.gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(stats.gainPercentage)}
            </span>
            <span className="text-gray-500 text-sm">
              ({stats.totalGain >= 0 ? '+' : ''}{formatCurrency(stats.totalGain)})
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 -mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-mobile">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                <p className="text-xs text-gray-500 font-medium">Active Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-mobile">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTrades}</p>
                <p className="text-xs text-gray-500 font-medium">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              haptic.medium();
              navigate('/create');
            }}
            className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl p-4 shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 mb-2" />
            <p className="font-semibold text-sm">Create Post</p>
          </button>

          <button
            onClick={() => {
              haptic.light();
              navigate('/marketplace');
            }}
            className="bg-white text-gray-900 rounded-2xl p-4 shadow-mobile active:scale-95 transition-transform border border-gray-100"
          >
            <TrendingUp className="w-6 h-6 mb-2 text-primary-600" />
            <p className="font-semibold text-sm">Browse Market</p>
          </button>
        </div>
      </div>

      {/* Recent Holdings */}
      {holdings.length > 0 && (
        <div className="px-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Top Holdings</h3>
            <button 
              onClick={() => navigate('/portfolio')}
              className="text-primary-600 text-sm font-semibold touch-feedback"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {holdings.slice(0, 3).map((holding, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-mobile">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-700">
                        {holding.company?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{holding.company}</p>
                      <p className="text-sm text-gray-500">{holding.quantity} shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(holding.totalValue)}
                    </p>
                    <p className={`text-sm font-medium ${
                      holding.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(holding.gainPercent)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="px-6 mt-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button 
              onClick={() => navigate('/notifications')}
              className="text-primary-600 text-sm font-semibold touch-feedback"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-mobile">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{timeAgo(activity.createdAt)}</p>
                  </div>
                  {activity.amount && (
                    <div className="flex-shrink-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatCurrency(activity.amount)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {holdings.length === 0 && activities.length === 0 && (
        <div className="px-6 mt-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Activity Yet</h3>
          <p className="text-gray-500 mb-6">
            Start trading to see your portfolio and activity here
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="btn-primary inline-flex items-center gap-2"
          >
            Browse Marketplace
            <ArrowUpRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
