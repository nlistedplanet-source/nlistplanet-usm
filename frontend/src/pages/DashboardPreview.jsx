import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Calendar,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  ShoppingCart,
  Briefcase
} from 'lucide-react';

const DashboardPreview = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock user data
  const user = {
    username: 'johndoe',
    email: 'john@example.com',
    avatar: null
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Nlist Planet
              </button>
              <span className="hidden sm:block text-sm text-gray-500">/ Dashboard</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">@{user.username}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your portfolio today.</p>
        </div>

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

        {/* Test Notice */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">✨ Modern Dashboard Preview</h3>
          <p className="mb-4">Yeh ek test preview hai. Agar design pasand aaye toh main implement kar dunga!</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
          >
            View Original Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPreview;
