import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  Gift, 
  User as UserIcon, 
  Loader,
  Activity,
  Radio,
  Briefcase,
  LogOut,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Filter,
  Download,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { portfolioAPI, listingsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import MyPostsTab from '../components/dashboard/MyPostsTab';
import BidsTab from '../components/dashboard/BidsTab';
import OffersTab from '../components/dashboard/OffersTab';
import NotificationsTab from '../components/dashboard/NotificationsTab';
import ReferralsTab from '../components/dashboard/ReferralsTab';
import ProfileTab from '../components/dashboard/ProfileTab';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [loading, setLoading] = useState(true);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalGain: 0,
    gainPercentage: 0,
    activeListings: 0,
    completedTrades: 0
  });
  const [holdings, setHoldings] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const [statsRes, holdingsRes, activitiesRes] = await Promise.all([
          portfolioAPI.getStats(),
          portfolioAPI.getHoldings(),
          portfolioAPI.getActivities({ limit: 10 })
        ]);

        setPortfolioStats(statsRes.data.data);
        setHoldings(holdingsRes.data.data);
        setRecentActivities(activitiesRes.data.data);
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
        toast.error('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'overview' || activeTab === 'portfolio') {
      fetchPortfolioData();
    }
  }, [activeTab]);

  // Fetch marketplace listings
  useEffect(() => {
    const fetchMarketplaceListings = async () => {
      try {
        setMarketplaceLoading(true);
        const response = await listingsAPI.getAll({ limit: 50 });
        // Filter out current user's own listings
        const filteredListings = response.data.data.filter(
          listing => listing.userId?._id !== user?._id && listing.userId !== user?._id
        );
        setMarketplaceListings(filteredListings);
      } catch (error) {
        console.error('Failed to fetch marketplace listings:', error);
        toast.error('Failed to load marketplace listings');
      } finally {
        setMarketplaceLoading(false);
      }
    };

    if (activeTab === 'marketplace') {
      fetchMarketplaceListings();
    }
  }, [activeTab, user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'marketplace', label: 'Marketplace', icon: Radio },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'posts', label: 'My Posts', icon: FileText },
    { id: 'bids', label: 'Bids Received', icon: TrendingUp },
    { id: 'offers', label: 'Offers Made', icon: TrendingDown },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-full overflow-y-auto hidden md:block z-30">
        {/* User Profile - Compact */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.username?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">ID: {user.email?.split('@')[0] || user.username}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-100 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
          <div className="mt-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Ad Space</p>
            <p className="text-xs text-gray-400">Premium ads here</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 md:p-8">
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="animate-spin text-purple-600 mb-3" size={40} />
            <p className="text-gray-600">Loading portfolio...</p>
          </div>
        ) : (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Portfolio Value */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(portfolioStats.totalValue)}
            </h3>
            <p className="text-sm text-gray-600">Portfolio Value</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-green-600">+{portfolioStats.gainPercentage}%</span>
              <span className="text-xs text-gray-500">this month</span>
            </div>
          </div>

          {/* Total Gain */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-green-50 px-2 py-1 rounded-full text-green-600">Profit</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(portfolioStats.totalGain)}
            </h3>
            <p className="text-sm text-gray-600">Total Gain</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-gray-500">from {formatCurrency(portfolioStats.totalInvested)}</span>
            </div>
          </div>

          {/* Active Listings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Package className="text-white" size={24} />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-orange-50 px-2 py-1 rounded-full text-orange-600">Active</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {portfolioStats.activeListings}
            </h3>
            <p className="text-sm text-gray-600">Active Listings</p>
            <div className="flex items-center gap-1 mt-2">
              <button onClick={() => handleTabChange('posts')} className="text-sm text-purple-600 font-medium hover:underline">View all →</button>
            </div>
          </div>

          {/* Completed Trades */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-blue-50 px-2 py-1 rounded-full text-blue-600">Done</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {portfolioStats.completedTrades}
            </h3>
            <p className="text-sm text-gray-600">Completed Trades</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-gray-500">this year</span>
            </div>
          </div>
        </div>

        {/* Holdings & Activity Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Holdings Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Holdings</h2>
                  <p className="text-sm text-gray-600 mt-1">{holdings.length} companies in portfolio</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter size={18} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {holdings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Package className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-600 font-medium mb-2">No holdings yet</p>
                  <p className="text-gray-500 text-sm">Start trading to build your portfolio</p>
                </div>
              ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Company</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Quantity</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Avg Price</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Current</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">P&L</th>
                    <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {holdings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-xl">
                            {holding.logo}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{holding.company}</p>
                            <p className="text-xs text-gray-500">Unlisted</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{holding.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(holding.buyPrice)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(holding.currentPrice)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.gain >= 0 ? '+' : ''}{formatCurrency(holding.gain)}
                          </span>
                          <div className="flex items-center gap-1">
                            {holding.gain >= 0 ? (
                              <ArrowUpRight size={14} className="text-green-600" />
                            ) : (
                              <ArrowDownRight size={14} className="text-red-600" />
                            )}
                            <span className={`text-xs font-medium ${holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {holding.gainPercent > 0 ? '+' : ''}{holding.gainPercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={18} className="text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100">
              <button 
                onClick={() => handleTabChange('marketplace')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Browse More Shares
              </button>
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-600 mt-1">Your latest transactions</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'buy' 
                        ? 'bg-green-100 text-green-600' 
                        : activity.type === 'sell'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'buy' ? <TrendingUp size={20} /> : 
                       activity.type === 'sell' ? <TrendingDown size={20} /> : 
                       <Eye size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {activity.type === 'buy' ? 'Bought' : activity.type === 'sell' ? 'Sold' : 'Bid on'} {activity.company}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {activity.shares} shares • {formatCurrency(activity.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 text-purple-600 font-medium text-sm hover:bg-purple-50 py-2 rounded-lg transition-colors">
                View All Activity →
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleTabChange('posts')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp size={18} />
                  Create Buy Order
                </button>
                <button 
                  onClick={() => handleTabChange('posts')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Briefcase size={18} />
                  List Your Shares
                </button>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
          </>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Marketplace - All Listings</h2>
            <p className="text-gray-600 mb-6">View all buy and sell posts from other users (excluding your own posts)</p>
            
            {marketplaceLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="animate-spin text-purple-600 mb-3" size={40} />
                <p className="text-gray-600">Loading marketplace...</p>
              </div>
            ) : marketplaceListings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-600 font-medium mb-2">No listings available</p>
                <p className="text-gray-500 text-sm">Check back later for new opportunities</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {marketplaceListings.map((listing) => (
                  <div key={listing._id} className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                          {listing.companyId?.logo ? (
                            <img src={listing.companyId.logo} alt={listing.companyName} className="w-10 h-10 object-contain" />
                          ) : (
                            <span className="text-xl">{listing.companyName?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{listing.companyName}</h3>
                          <p className="text-sm text-gray-600">@{listing.userId?.username}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        listing.type === 'sell' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {listing.type === 'sell' ? 'BUY Opportunity' : 'SELL Opportunity'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Price per share</p>
                        <p className="font-bold text-gray-900">{formatCurrency(listing.price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className="font-semibold text-gray-900">{listing.quantity} shares</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Min Lot</p>
                        <p className="font-semibold text-gray-900">{listing.minLot || 1}</p>
                      </div>
                    </div>

                    {listing.description && (
                      <p className="text-sm text-gray-600 mb-4">{listing.description}</p>
                    )}

                    <div className="flex gap-2">
                      <button 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                        onClick={() => {
                          /* TODO: Implement bid/offer modal */
                          toast.success(`${listing.type === 'sell' ? 'Bid' : 'Offer'} functionality coming soon!`);
                        }}
                      >
                        {listing.type === 'sell' ? 'Place Bid' : 'Make Offer'}
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Portfolio</h2>
            
            {/* Holdings Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Holdings</h3>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">Add Holdings →</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Company</th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Quantity</th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Buy Price</th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Current Price</th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Total Value</th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {holdings.map((holding) => (
                      <tr key={holding.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{holding.logo}</span>
                            <span className="font-medium text-gray-900">{holding.company}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{holding.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(holding.buyPrice)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(holding.currentPrice)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(holding.totalValue)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.gain >= 0 ? '+' : ''}{formatCurrency(holding.gain)} ({holding.gainPercent > 0 ? '+' : ''}{holding.gainPercent.toFixed(2)}%)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add New Holdings Button */}
            <div className="mt-6">
              <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Package size={20} />
                Add New Holdings to Portfolio
              </button>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <MyPostsTab />
          </div>
        )}
        {activeTab === 'bids' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <BidsTab />
          </div>
        )}
        {activeTab === 'offers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <OffersTab />
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <NotificationsTab />
          </div>
        )}
        {activeTab === 'referrals' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <ReferralsTab />
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <ProfileTab />
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
