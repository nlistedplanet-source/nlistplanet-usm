import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, TrendingUp, DollarSign, Building2, Ban, CheckCircle, Plus, Loader, Database,
  Menu, X, ChevronLeft, ChevronRight, LayoutDashboard, Newspaper, LogOut
} from 'lucide-react';
import { adminAPI } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import CompanyData from '../components/admin/CompanyData';
import UserManagement from '../components/admin/UserManagement';
import NewsManagement from '../components/admin/NewsManagement';
import AcceptedDeals from '../components/admin/AcceptedDeals';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    sector: '',
    logo: '',
    isin: '',
    pan: '',
    cin: ''
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'companies', label: 'Companies', icon: Database },
    { id: 'accepted-deals', label: 'Accepted Deals', icon: CheckCircle },
    { id: 'news', label: 'News/Blog', icon: Newspaper },
  ];

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers()
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await adminAPI.banUser(userId);
      toast.success('User banned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await adminAPI.unbanUser(userId);
      toast.success('User unbanned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createCompany(companyData);
      toast.success('Company created successfully');
      setShowCreateCompanyModal(false);
      setCompanyData({
        name: '',
        sector: '',
        logo: '',
        isin: '',
        pan: '',
        cin: ''
      });
    } catch (error) {
      toast.error('Failed to create company');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Header */}
        <div className={`h-16 flex items-center justify-between px-4 border-b border-gray-700 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          {!sidebarCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              NlistPlanet
            </span>
          )}
          
          {/* Collapse Toggle - Desktop */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          {/* Close - Mobile */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Admin Info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-semibold text-sm">@{user?.username}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-all
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-lg font-bold text-gray-900 capitalize">
            {activeTab === 'news' ? 'News / Blog Management' : `${activeTab} Management`}
          </h1>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:block">Admin Panel</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-4 text-white">
                  <Users size={24} className="mb-2" />
                  <p className="text-sm opacity-90">Total Users</p>
                  <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-4 text-white">
                  <TrendingUp size={24} className="mb-2" />
                  <p className="text-sm opacity-90">Active Listings</p>
                  <p className="text-3xl font-bold">{stats?.activeListings || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-4 text-white">
                  <DollarSign size={24} className="mb-2" />
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-4 text-white">
                  <Building2 size={24} className="mb-2" />
                  <p className="text-sm opacity-90">Companies</p>
                  <p className="text-3xl font-bold">{stats?.totalCompanies || 0}</p>
                </div>
              </div>

              {/* Create Company Button */}
              <button
                onClick={() => setShowCreateCompanyModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all mb-6"
              >
                <Plus size={20} />
                Add New Company
              </button>

              {/* Users List */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Users</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {users.slice(0, 6).map((u) => (
                    <div key={u._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.username} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-purple-700 font-bold text-lg">{u.username[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 truncate">@{u.username}</p>
                            {u.role === 'admin' && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">ADMIN</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Joined {formatDate(u.createdAt)}</p>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => u.isBanned ? handleUnbanUser(u._id) : handleBanUser(u._id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                              u.isBanned ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {u.isBanned ? <><CheckCircle size={14} /> Unban</> : <><Ban size={14} /> Ban</>}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && <UserManagement />}

          {/* Company Data Tab */}
          {activeTab === 'companies' && <CompanyData />}

          {/* Accepted Deals Tab */}
          {activeTab === 'accepted-deals' && <AcceptedDeals />}

          {/* News Management Tab */}
          {activeTab === 'news' && <NewsManagement />}
        </div>
      </main>

      {/* Create Company Modal */}
      {showCreateCompanyModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCreateCompanyModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl p-6 z-50 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Company</h3>
            
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sector *</label>
                <input
                  type="text"
                  value={companyData.sector}
                  onChange={(e) => setCompanyData({ ...companyData, sector: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Technology, Healthcare"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={companyData.logo}
                  onChange={(e) => setCompanyData({ ...companyData, logo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ISIN</label>
                  <input
                    type="text"
                    value={companyData.isin}
                    onChange={(e) => setCompanyData({ ...companyData, isin: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    maxLength="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">PAN</label>
                  <input
                    type="text"
                    value={companyData.pan}
                    onChange={(e) => setCompanyData({ ...companyData, pan: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    maxLength="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CIN</label>
                <input
                  type="text"
                  value={companyData.cin}
                  onChange={(e) => setCompanyData({ ...companyData, cin: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  maxLength="21"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold"
                >
                  Create Company
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateCompanyModal(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
