import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Package, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Filter,
  Download,
  Eye,
  ShoppingCart,
  Briefcase,
  FileText,
  Bell,
  Gift,
  User as UserIcon,
  LogOut,
  Radio
} from 'lucide-react';

// Import existing dashboard tabs
import MyPostsTab from '../components/dashboard/MyPostsTab';
import BidsTab from '../components/dashboard/BidsTab';
import OffersTab from '../components/dashboard/OffersTab';
import NotificationsTab from '../components/dashboard/NotificationsTab';
import ReferralsTab from '../components/dashboard/ReferralsTab';
import ProfileTabPreview from '../components/dashboard/ProfileTabPreview';

const DashboardPreview = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Use authenticated user or mock user for preview
  const mockUser = {
    _id: 'mock123',
    username: 'edison_player_907',
    fullName: 'Praveen Singh',
    email: 'praveensingh1@hotmail.com',
    phone: '9580118412',
    userId: 'USR12345',
    role: 'user',
    kycStatus: 'not_started',
    totalReferrals: 0,
    totalEarnings: 0,
    avatar: null
  };
  
  const user = authUser || mockUser;

  // Mock portfolio data
  const portfolioStats = {
    totalValue: 1250000,
    totalInvested: 950000,
    totalGain: 300000,
    gainPercentage: 31.58,
    activeListings: 5,
    completedTrades: 12
  };

  // Mock holdings
  const holdings = [
    {
      id: 1,
      company: 'Razorpay',
      quantity: 50,
      buyPrice: 12000,
      currentPrice: 15000,
      totalValue: 750000,
      gain: 150000,
      gainPercent: 25.0,
      logo: '🔷'
    },
    {
      id: 2,
      company: 'Zerodha',
      quantity: 30,
      buyPrice: 8000,
      currentPrice: 10500,
      totalValue: 315000,
      gain: 75000,
      gainPercent: 31.25,
      logo: '⚡'
    },
    {
      id: 3,
      company: 'Swiggy',
      quantity: 20,
      buyPrice: 6000,
      currentPrice: 5500,
      totalValue: 110000,
      gain: -10000,
      gainPercent: -8.33,
      logo: '🍔'
    },
    {
      id: 4,
      company: 'PhonePe',
      quantity: 15,
      buyPrice: 5000,
      currentPrice: 6200,
      totalValue: 93000,
      gain: 18000,
      gainPercent: 24.0,
      logo: '💜'
    }
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, type: 'buy', company: 'Razorpay', amount: 15000, shares: 50, date: '2 days ago' },
    { id: 2, type: 'sell', company: 'Cred', amount: 45000, shares: 30, date: '5 days ago' },
    { id: 3, type: 'bid', company: 'Dream11', amount: 25000, shares: 20, date: '1 week ago' },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'broadcast', label: 'Broadcast', icon: Radio },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'posts', label: 'My Posts', icon: FileText },
    { id: 'bids', label: 'Bids Received', icon: TrendingUp },
    { id: 'offers', label: 'Offers Made', icon: TrendingDown },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-full overflow-y-auto">
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
              <p className="text-xs text-gray-500 truncate">ID: {user.email?.split('@')[0] || 'demo_user'}</p>
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
                  onClick={() => setActiveTab(tab.id)}
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
            onClick={() => {
              // Add logout logic here
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        <div className="p-8">
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
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
              <button className="text-sm text-purple-600 font-medium hover:underline">View all →</button>
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
            </div>
            
            <div className="p-6 border-t border-gray-100">
              <button 
                onClick={() => navigate('/marketplace')}
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
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp size={18} />
                  Create Buy Order
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
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
            <ProfileTabPreview mockUser={user} />
          </div>
        )}
        {activeTab === 'broadcast' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Broadcast - All Listings</h2>
            <p className="text-gray-600 mb-6">View all buy and sell posts from other users in the marketplace</p>
            
            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button className="pb-3 px-4 font-semibold text-purple-600 border-b-2 border-purple-600">
                All Posts
              </button>
              <button className="pb-3 px-4 font-medium text-gray-600 hover:text-gray-900">
                Buy Requests
              </button>
              <button className="pb-3 px-4 font-medium text-gray-600 hover:text-gray-900">
                Sell Posts
              </button>
            </div>

            {/* Broadcast Listings */}
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-xl">
                        🏢
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Sample Company {item}</h3>
                        <p className="text-sm text-gray-500">Posted by @user{item} • 2 hours ago</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item % 2 === 0 ? 'SELL' : 'BUY'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Price per Share</p>
                      <p className="font-bold text-gray-900">₹{(15000 * item).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="font-bold text-gray-900">{50 * item} shares</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Min Lot</p>
                      <p className="font-bold text-gray-900">{10 * item}</p>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
        </div>
      </main>
    </div>
  );
};

export default DashboardPreview;
