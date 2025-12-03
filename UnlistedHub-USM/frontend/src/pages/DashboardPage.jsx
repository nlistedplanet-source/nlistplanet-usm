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
  IndianRupee,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Filter,
  Download,
  Eye,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Building2,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { portfolioAPI, listingsAPI } from '../utils/api';
import { calculateTotalWithFee } from '../utils/helpers';
import toast from 'react-hot-toast';
import MyPostsTab from '../components/dashboard/MyPostsTab';
import MyBidsOffersTab from '../components/dashboard/MyBidsOffersTab';
import ReceivedBidsOffersTab from '../components/dashboard/ReceivedBidsOffersTab';
import NotificationsTab from '../components/dashboard/NotificationsTab';
import ReferralsTab from '../components/dashboard/ReferralsTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import HistoryTab from '../components/dashboard/HistoryTab';
import CompaniesManagement from '../components/admin/CompaniesManagement';
import UserManagement from '../components/admin/UserManagement';
import ListingsManagement from '../components/admin/ListingsManagement';
import TransactionsManagement from '../components/admin/TransactionsManagement';
import ReportsManagement from '../components/admin/ReportsManagement';
import PlatformSettings from '../components/admin/PlatformSettings';
import AdManagement from '../components/admin/AdManagement';
import ReferralTracking from '../components/admin/ReferralTracking';
import MarketplaceCard from '../components/MarketplaceCard';
import BidOfferModal from '../components/BidOfferModal';

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
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [activeMarketTab, setActiveMarketTab] = useState('all');
  const [marketplaceSort, setMarketplaceSort] = useState('latest');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [likedListings, setLikedListings] = useState(new Set());

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
        const s = statsRes.data.data || {};
        setPortfolioStats({
          totalValue: Number(s.totalValue) || 0,
          totalInvested: Number(s.totalInvested) || 0,
          totalGain: Number(s.totalGain) || 0,
          gainPercentage: Number(s.gainPercentage) || 0,
          activeListings: Number(s.activeListings) || 0,
          completedTrades: Number(s.completedTrades) || 0,
        });
        setHoldings(holdingsRes.data.data);
        setRecentActivities(activitiesRes.data.data);
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
        // Silent fail - don't show error toast on login
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
    const safe = Number(amount);
    const value = isNaN(safe) ? 0 : safe;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handlers for marketplace card actions
  const handlePlaceBid = (listing) => {
    setSelectedListing(listing);
    setShowBidModal(true);
  };

  const handleShare = async (listing) => {
    const shareUrl = `${window.location.origin}/marketplace?listing=${listing._id}`;
    const shareText = `Check out this ${listing.type === 'sell' ? 'selling' : 'buying'} opportunity: ${listing.companyName} at ${formatCurrency(listing.price)} per share`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${listing.companyName} - NlistPlanet`,
          text: shareText,
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          fallbackShare(shareUrl, shareText);
        }
      }
    } else {
      fallbackShare(shareUrl, shareText);
    }
  };

  const fallbackShare = (url, text) => {
    navigator.clipboard.writeText(`${text}\n${url}`);
    toast.success('Link copied to clipboard!');
  };

  const handleLike = (listing) => {
    setLikedListings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listing._id)) {
        newSet.delete(listing._id);
        toast.success('Removed from favorites');
      } else {
        newSet.add(listing._id);
        toast.success('Added to favorites');
      }
      return newSet;
    });
  };

  const handleBidSuccess = () => {
    setShowBidModal(false);
    setSelectedListing(null);
    toast.success('Bid/Offer placed successfully!');
    // Refresh marketplace listings
    const fetchMarketplaceListings = async () => {
      try {
        setMarketplaceLoading(true);
        const response = await listingsAPI.getAll({ limit: 50 });
        const filteredListings = response.data.data.filter(
          listing => listing.userId?._id !== user?._id && listing.userId !== user?._id
        );
        setMarketplaceListings(filteredListings);
      } catch (error) {
        console.error('Failed to fetch marketplace listings:', error);
      } finally {
        setMarketplaceLoading(false);
      }
    };
    fetchMarketplaceListings();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'marketplace', label: 'Marketplace', icon: Radio },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'posts', label: 'My Posts', icon: FileText },
    { id: 'my-bids-offers', label: 'My Bids & Offers', icon: TrendingUp },
    { id: 'received-bids-offers', label: 'Received Bids & Offers', icon: TrendingDown },
    { id: 'history', label: 'History', icon: Package },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  // Admin-only tabs
  const adminTabs = [
    { id: 'admin-users', label: 'User Management', icon: Users },
    { id: 'admin-listings', label: 'Listings Management', icon: FileText },
    { id: 'admin-transactions', label: 'Transactions', icon: IndianRupee },
    { id: 'admin-companies', label: 'Companies Management', icon: Building2 },
    { id: 'admin-ads', label: 'Ads Management', icon: Shield },
    { id: 'admin-referrals', label: 'Referral Tracking', icon: Gift },
    { id: 'admin-reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin-settings', label: 'Platform Settings', icon: Settings },
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
    <div className="min-h-screen bg-gray-50 flex text-[12px]">
      {/* Left Sidebar Navigation - Ultra Compact */}
      <aside className="w-52 bg-white border-r border-gray-200 fixed left-0 top-0 h-full flex flex-col z-30">
        {/* User Profile - Mini */}
        <div className="p-2 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.username?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.fullName || user.username}</p>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-gray-500">@{user.username}</p>
                {user.role === 'admin' && (
                  <span className="px-1 rounded text-[8px] font-bold bg-blue-600 text-white">ADM</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-1.5 pb-12">
          <div className="space-y-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium text-[12px] transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Admin Section */}
            {user?.role === 'admin' && (
              <>
                <div className="pt-2 pb-0.5 mt-1 border-t border-gray-200">
                  <p className="px-2.5 text-[9px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                    <Shield size={10} />
                    Admin Panel
                  </p>
                </div>
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium text-[12px] transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </>
            )}

            {/* Logout inside scroll */}
            <div className="pt-2 mt-1 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium text-[12px] transition-all text-red-600 hover:bg-red-50"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-52 overflow-x-auto">
        <div className="p-4 min-w-0">
        
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
                <IndianRupee className="text-white" size={24} />
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
          <div className="w-full">
            {/* Creative Title */}
            <div className="mb-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Discover & Trade Unlisted Shares
              </h1>
            </div>

            {/* Modern Search Box */}
            <div className="mb-3 relative">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by company, sector, user..."
                  value={marketplaceSearch}
                  onChange={(e) => setMarketplaceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-xs text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Buy/Sell Tabs + Filter/Sort */}
            <div className="mb-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Buy/Sell Tabs */}
                <div className="flex gap-1 bg-white p-0.5 rounded-md shadow-sm">
                  <button
                    onClick={() => setActiveMarketTab('all')}
                    className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                      activeMarketTab === 'all'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveMarketTab('buy')}
                    className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                      activeMarketTab === 'buy'
                        ? 'bg-yellow-400 text-gray-900 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setActiveMarketTab('sell')}
                    className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                      activeMarketTab === 'sell'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Filter & Sort */}
                <div className="flex gap-1.5">
                  <select
                    value={marketplaceSort}
                    onChange={(e) => setMarketplaceSort(e.target.value)}
                    className="px-2.5 py-1 text-[11px] border border-gray-300 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 transition-all text-gray-700 bg-white cursor-pointer font-semibold"
                  >
                    <option value="latest">Latest</option>
                    <option value="price-high">Price ↓</option>
                    <option value="price-low">Price ↑</option>
                    <option value="quantity-high">Qty ↓</option>
                    <option value="quantity-low">Qty ↑</option>
                  </select>

                  <select
                    value={marketplaceFilter}
                    onChange={(e) => setMarketplaceFilter(e.target.value)}
                    className="px-2.5 py-1 text-[11px] border border-gray-300 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 transition-all text-gray-700 bg-white cursor-pointer font-semibold"
                  >
                    <option value="all">All Sectors</option>
                    <option value="finance">Finance</option>
                    <option value="tech">Tech</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            {marketplaceLoading ? (
              <div className="flex justify-center items-center h-32">
                <span className="text-gray-600">Loading marketplace...</span>
              </div>
            ) : marketplaceListings.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <span className="text-gray-600">No listings found</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceListings
                  .filter((listing) => {
                    // Filter by tab (all/buy/sell)
                    if (activeMarketTab === 'buy' && listing.type !== 'buy') return false;
                    if (activeMarketTab === 'sell' && listing.type !== 'sell') return false;
                    
                    // Filter by search
                    if (marketplaceSearch) {
                      const searchLower = marketplaceSearch.toLowerCase();
                      const companyMatch = listing.companyName?.toLowerCase().includes(searchLower);
                      const sectorMatch = (listing.companyId?.Sector || listing.companyId?.sector || '')?.toLowerCase().includes(searchLower);
                      const userMatch = listing.username?.toLowerCase().includes(searchLower);
                      if (!companyMatch && !sectorMatch && !userMatch) return false;
                    }
                    
                    // Filter by sector
                    if (marketplaceFilter !== 'all') {
                      const sector = (listing.companyId?.Sector || listing.companyId?.sector || '').toLowerCase();
                      if (!sector.includes(marketplaceFilter.toLowerCase())) return false;
                    }
                    
                    return true;
                  })
                  .sort((a, b) => {
                    // Sort logic
                    if (marketplaceSort === 'latest') {
                      return new Date(b.createdAt) - new Date(a.createdAt);
                    } else if (marketplaceSort === 'price-high') {
                      return b.price - a.price;
                    } else if (marketplaceSort === 'price-low') {
                      return a.price - b.price;
                    } else if (marketplaceSort === 'quantity-high') {
                      return b.quantity - a.quantity;
                    } else if (marketplaceSort === 'quantity-low') {
                      return a.quantity - b.quantity;
                    }
                    return 0;
                  })
                  .map((listing) => {
                    // For SELL listings: show buyer price (seller price + platform fee)
                    // For BUY requests: show original offer price
                    const displayPrice = listing.type === 'sell' 
                      ? calculateTotalWithFee(listing.price) 
                      : listing.price;
                    
                    return (
                      <MarketplaceCard
                        key={listing._id}
                        type={listing.type}
                        companyLogo={listing.companyId?.Logo || listing.companyId?.logo}
                        companyName={listing.companyName}
                        companySymbol={listing.companyId?.ScripName || listing.companyId?.symbol}
                        companySector={listing.companyId?.Sector || listing.companyId?.sector || 'Financial Services'}
                        companyPan={listing.companyId?.PAN || listing.companyId?.pan}
                        companyIsin={listing.companyId?.ISIN || listing.companyId?.isin}
                        companyCin={listing.companyId?.CIN || listing.companyId?.cin}
                        price={displayPrice}
                        shares={listing.quantity}
                        user={listing.username}
                        onPrimary={() => handlePlaceBid(listing)}
                        onSecondary={() => handleShare(listing)}
                        onShare={() => handleShare(listing)}
                        onLike={() => handleLike(listing)}
                        isLiked={likedListings.has(listing._id)}
                      />
                    );
                  })}
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
        {activeTab === 'my-bids-offers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <MyBidsOffersTab />
          </div>
        )}
        {activeTab === 'received-bids-offers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <ReceivedBidsOffersTab />
          </div>
        )}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <HistoryTab />
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

        {/* Admin Tabs */}
        {user?.role === 'admin' && activeTab === 'admin-companies' && (
          <CompaniesManagement />
        )}

        {user?.role === 'admin' && activeTab === 'admin-users' && (
          <UserManagement />
        )}

        {user?.role === 'admin' && activeTab === 'admin-listings' && (
          <ListingsManagement />
        )}

        {user?.role === 'admin' && activeTab === 'admin-transactions' && (
          <TransactionsManagement />
        )}

        {user?.role === 'admin' && activeTab === 'admin-reports' && (
          <ReportsManagement />
        )}

        {user?.role === 'admin' && activeTab === 'admin-ads' && (
          <AdManagement />
        )}

        {user?.role === 'admin' && activeTab === 'admin-referrals' && (
          <ReferralTracking />
        )}

        {user?.role === 'admin' && activeTab === 'admin-settings' && (
          <PlatformSettings />
        )}
        </div>
      </main>

      {/* Bid/Offer Modal */}
      {showBidModal && selectedListing && (
        <BidOfferModal
          listing={selectedListing}
          onClose={() => {
            setShowBidModal(false);
            setSelectedListing(null);
          }}
          onSuccess={handleBidSuccess}
        />
      )}
    </div>
  );
};

export default DashboardPage;
