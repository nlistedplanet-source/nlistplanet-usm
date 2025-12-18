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
  Shield,
  Newspaper,
  CheckCircle,
  RotateCcw,
  XCircle,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { portfolioAPI, listingsAPI, adminAPI } from '../utils/api';
import { calculateTotalWithFee, calculateBuyerPays, calculateSellerGets, formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import MyPostsTab from '../components/dashboard/MyPostsTab';
import MyBidsOffersTab from '../components/dashboard/MyBidsOffersTab';
import NotificationsTab from '../components/dashboard/NotificationsTab';
import ReferralsTab from '../components/dashboard/ReferralsTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import HistoryTab from '../components/dashboard/HistoryTab';
import CompaniesManagement from '../components/admin/CompaniesManagement';
import UserManagement from '../components/admin/UserManagement';
import ListingsManagement from '../components/admin/ListingsManagement';
import TransactionsManagement from '../components/admin/TransactionsManagement';
import ReportsManagement from '../components/admin/ReportsManagement';
import AcceptedDeals from '../components/admin/AcceptedDeals';
import PlatformSettings from '../components/admin/PlatformSettings';
import AdManagement from '../components/admin/AdManagement';
import ReferralTracking from '../components/admin/ReferralTracking';
import NewsManagement from '../components/admin/NewsManagement';
import MarketplaceCard from '../components/MarketplaceCard';
import BidOfferModal from '../components/BidOfferModal';
import ShareCardGenerator from '../components/ShareCardGenerator';
import VerificationCodesModal from '../components/VerificationCodesModal';
import CreateListingModal from '../components/CreateListingModal';
import { useDashboardTour } from '../components/TourGuide';
import AdBanner from '../components/AdBanner';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  useDashboardTour();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [loading, setLoading] = useState(true);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalGain: 0,
    gainPercentage: 0,
    activeListings: 0,
    completedTrades: 0,
    myPostsCount: 0,
    myBidsCount: 0,
    pendingActionsCount: 0
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
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareListingData, setShareListingData] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationDeal, setVerificationDeal] = useState(null);
  const [likedListings, setLikedListings] = useState(new Set());
  const [favoritedListings, setFavoritedListings] = useState(new Set());
  const [actionItems, setActionItems] = useState([]);
  const [viewMode, setViewMode] = useState('user'); // 'user' or 'admin'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
  const [listingToAccept, setListingToAccept] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Admin View As functionality
  const viewAsUserId = searchParams.get('viewAs');
  const [viewingUser, setViewingUser] = useState(null);
  const isViewingAsAdmin = user?.role === 'admin' && viewAsUserId;
  const effectiveUserId = isViewingAsAdmin ? viewAsUserId : user?._id;

  // Fetch viewing user details if admin is viewing another user's dashboard
  useEffect(() => {
    const fetchViewingUser = async () => {
      if (isViewingAsAdmin) {
        try {
          const response = await adminAPI.getUserById(viewAsUserId);
          setViewingUser(response.data.data);
        } catch (error) {
          console.error('Failed to fetch viewing user:', error);
          toast.error('Failed to load user details');
        }
      } else {
        setViewingUser(null);
      }
    };
    
    if (user?.role === 'admin' && viewAsUserId) {
      fetchViewingUser();
    }
  }, [viewAsUserId, user]);

  // Unified Dashboard Data Fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Check Auth Readiness
      if (authLoading) {
        console.log('⏳ Dashboard: Waiting for auth loading...');
        return;
      }

      if (!user) {
        console.log('⚠️ Dashboard: No user found');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ Dashboard: No token found in localStorage');
        return;
      }

      console.log('🚀 Dashboard: Fetching data for tab:', activeTab);

      // 2. Fetch Action Items (Always fetch on mount/tab change to keep badge updated)
      try {
        // Sequential fetch to avoid race conditions
        // Use effectiveUserId when admin is viewing another user's dashboard
        const apiParams = isViewingAsAdmin ? { userId: effectiveUserId } : {};
        const sellRes = await listingsAPI.getMy({ type: 'sell', ...apiParams });
        const buyRes = await listingsAPI.getMy({ type: 'buy', ...apiParams });
        const myBidsRes = await listingsAPI.getMyPlacedBids(apiParams.userId);

        const actions = [];

        // 1. Incoming Bids on my Sell Posts
        (sellRes.data.data || []).forEach(listing => {
          (listing.bids || []).forEach(bid => {
            // Include pending AND pending_confirmation (buyer accepted, waiting for seller)
            if (bid.status === 'pending' || bid.status === 'pending_confirmation') {
              // Find latest prices from history
              const history = bid.counterHistory || [];
              const latestSellerCounter = [...history].reverse().find(h => h.by === 'seller');
              const latestBuyerCounter = [...history].reverse().find(h => h.by === 'buyer');

              actions.push({
                type: bid.status === 'pending_confirmation' ? 'buyer_accepted' : 'bid_received',
                id: bid._id,
                listingId: listing._id,
                company: listing.companyName,
                companySymbol: listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyId?.symbol || listing.companyName,
                logo: listing.companyId?.logo || listing.companyId?.Logo,
                listPrice: listing.price, // Seller sees raw list price
                myActionPrice: latestSellerCounter ? latestSellerCounter.price : listing.price, // My Counter or List Price
                otherActionPrice: latestBuyerCounter ? latestBuyerCounter.price : bid.price, // Buyer's Bid or Counter
                quantity: bid.quantity,
                user: bid.userId?.username || bid.username,
                date: bid.buyerAcceptedAt || bid.createdAt,
                originalListing: listing
              });
            }
          });
        });

        // 2. Incoming Offers on my Buy Posts
        (buyRes.data.data || []).forEach(listing => {
          (listing.offers || []).forEach(offer => {
            if (offer.status === 'pending') {
              const history = offer.counterHistory || [];
              const latestBuyerCounter = [...history].reverse().find(h => h.by === 'buyer'); // Me (Buyer)
              const latestSellerCounter = [...history].reverse().find(h => h.by === 'seller'); // Them (Seller)

              actions.push({
                type: 'offer_received',
                id: offer._id,
                listingId: listing._id,
                company: listing.companyName,
                companySymbol: listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyId?.symbol || listing.companyName,
                logo: listing.companyId?.logo || listing.companyId?.Logo,
                listPrice: listing.price, // Buyer sees raw list price
                myActionPrice: latestBuyerCounter ? latestBuyerCounter.price : listing.price,
                otherActionPrice: latestSellerCounter ? latestSellerCounter.price : offer.price,
                quantity: offer.quantity,
                user: offer.userId?.username,
                date: offer.createdAt,
                originalListing: listing
              });
            }
          });
        });

        // 3. Counter Offers on my Bids/Offers
        (myBidsRes.data.data || []).forEach(activity => {
          if (activity.status === 'countered') {
            const counterHistory = activity.counterHistory || [];
            const latestCounter = counterHistory[counterHistory.length - 1];
            
            // Determine if I am Buyer or Seller:
            // - activity.type === 'bid' → I bid on a SELL listing → I am BUYER
            // - activity.type === 'offer' → I offered on a BUY listing → I am SELLER
            const isBuyer = activity.type === 'bid';
            
            // Get raw listing price
            const rawListingPrice = activity.listing.listingPrice || activity.listing.price;
            
            // Calculate List Price with proper fees
            // Buyer sees: price + 2%
            // Seller sees: price - 2%
            const listPrice = isBuyer 
              ? calculateBuyerPays(rawListingPrice)
              : calculateSellerGets(rawListingPrice);

            // Calculate Other Party's Counter Price with fees
            // CRITICAL: latestCounter.price is BASE price (what was entered)
            // Buyer viewing Seller's counter: apply +2%
            // Seller viewing Buyer's counter: apply -2%
            let otherPrice = activity.price; // Fallback
            
            if (latestCounter) {
              otherPrice = isBuyer 
                ? calculateBuyerPays(latestCounter.price)   // Buyer: Seller's 59 → 60.18
                : calculateSellerGets(latestCounter.price); // Seller: Buyer's 60 → 58.80
            }

            actions.push({
              type: 'counter_received',
              id: activity._id,
              listingId: activity.listing._id,
              company: activity.listing.companyName,
              companySymbol: activity.listing.companyId?.scriptName || activity.listing.companyId?.ScripName || activity.listing.companyId?.symbol || activity.listing.companyName,
              logo: activity.listing.companyId?.logo || activity.listing.companyId?.Logo,
              listPrice: listPrice,
              myActionPrice: activity.originalPrice || activity.price, // My ORIGINAL bid/offer (never changes)
              otherActionPrice: otherPrice, // The counter I received (with fees applied)
              quantity: activity.quantity,
              user: activity.listing.userId?.username || 'Seller',
              date: activity.createdAt, // Use createdAt from activity wrapper
              originalListing: activity.listing,
              isBuyer: isBuyer // Store for UI logic
            });
          }
        });

        const actionsList = actions.sort((a, b) => new Date(b.date) - new Date(a.date));
        setActionItems(actionsList);

        // Calculate Counts
        const postsCount = (sellRes.data.data || []).length + (buyRes.data.data || []).length;
        const bidsCount = (myBidsRes.data.data || []).length;
        const pendingCount = actionsList.length;

        // Update stats with counts immediately
        setPortfolioStats(prev => ({
          ...prev,
          myPostsCount: postsCount,
          myBidsCount: bidsCount,
          pendingActionsCount: pendingCount
        }));

      } catch (error) {
        console.error('❌ Failed to fetch action items:', error);
      }

      // 3. Fetch Portfolio Data (Only for Overview/Portfolio tabs)
      if (activeTab === 'overview' || activeTab === 'portfolio') {
        setLoading(true);
        try {
          // Fetch Stats
          try {
            const statsRes = await portfolioAPI.getStats();
            const s = statsRes.data.data || {};
            setPortfolioStats({
              totalValue: Number(s.totalValue) || 0,
              totalInvested: Number(s.totalInvested) || 0,
              totalGain: Number(s.totalGain) || 0,
              gainPercentage: Number(s.gainPercentage) || 0,
              activeListings: Number(s.activeListings) || 0,
              completedTrades: Number(s.completedTrades) || 0,
            });
          } catch (e) { console.error('Failed stats:', e); }

          // Fetch Holdings
          try {
            const holdingsRes = await portfolioAPI.getHoldings();
            setHoldings(holdingsRes.data.data || []);
          } catch (e) { console.error('Failed holdings:', e); }

          // Fetch Activities
          try {
            const activitiesRes = await portfolioAPI.getActivities({ limit: 10 });
            setRecentActivities(activitiesRes.data.data || []);
          } catch (e) { console.error('Failed activities:', e); }

        } catch (error) {
          console.error('❌ Failed to fetch portfolio data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [activeTab, authLoading, user, refreshTrigger]);



  // Fetch marketplace listings
  useEffect(() => {
    const fetchMarketplaceListings = async () => {
      try {
        setMarketplaceLoading(true);
        const response = await listingsAPI.getAll({ status: 'active', limit: 50 });
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

  // Handlers for marketplace card actions
  const handlePlaceBid = (listing) => {
    setSelectedListing(listing);
    setShowBidModal(true);
  };

  const handleAccept = (listing) => {
    // Show confirmation modal
    setListingToAccept(listing);
    setShowAcceptConfirmation(true);
    setAcceptedTerms(false);
  };

  const handleConfirmPurchase = async () => {
    if (!listingToAccept || !acceptedTerms) return;

    try {
      // Accept listing directly (creates bid with pending_confirmation status)
      await listingsAPI.acceptListing(listingToAccept._id);
      
      toast.success('Listing accepted! Seller will be notified.');
      
      // Remove this listing from marketplace immediately (deal pending)
      setMarketplaceListings(prev => prev.filter(l => l._id !== listingToAccept._id));
      
      // Refresh my bids to show the accepted deal
      if (activeTab === 'bids') {
        await fetchMyBidsOffers();
      }
      
      // Close modal
      setShowAcceptConfirmation(false);
      setListingToAccept(null);
      setAcceptedTerms(false);
    } catch (error) {
      console.error('Failed to accept listing:', error);
      const errorMsg = error.response?.data?.message || 'Failed to accept listing. Please try again.';
      toast.error(errorMsg);
      
      // If listing is not active, remove it from marketplace
      if (errorMsg.includes('not active') || errorMsg.includes('Listing is not active')) {
        setMarketplaceListings(prev => prev.filter(l => l._id !== listingToAccept._id));
        toast.info('This listing has been removed (no longer available)');
      }
      
      // Close modal
      setShowAcceptConfirmation(false);
      setListingToAccept(null);
      setAcceptedTerms(false);
    }
  };

  const handleShare = async (listing) => {
    // Open ShareCardGenerator modal for advanced image + caption share
    setShareListingData(listing);
    setShowShareCard(true);
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
        toast.success('Removed like');
      } else {
        newSet.add(listing._id);
        toast.success('Liked!');
      }
      return newSet;
    });
  };

  const handleFavorite = (listing) => {
    setFavoritedListings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listing._id)) {
        newSet.delete(listing._id);
        toast.success('Removed from favorites');
      } else {
        newSet.add(listing._id);
        toast.success('Added to favorites!');
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
        const response = await listingsAPI.getAll({ status: 'active', limit: 50 });
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

  // Action Center handlers
  const handleAcceptAction = async (item) => {
    try {
      const response = await listingsAPI.acceptBid(item.listingId, item.id);
      const status = response.data.status;
      
      if (status === 'confirmed') {
        // Second party accepted - deal confirmed
        toast.success('Deal confirmed! 🎉');
        if (response.data.deal) {
          setVerificationDeal(response.data.deal);
          setShowVerificationModal(true);
        }
      } else if (status === 'accepted') {
        // First party accepted - waiting for other party
        toast.success('Accepted! Waiting for other party to confirm. ⏳');
        // Refresh action items
        window.location.reload(); 
      }
    } catch (error) {
      console.error('Failed to accept:', error);
      toast.error(error.response?.data?.message || 'Failed to accept. Please try again.');
    }
  };

  const handleRejectAction = async (item) => {
    try {
      await listingsAPI.rejectBid(item.listingId, item.id);
      toast.success('Bid/Offer rejected');
      // Refresh action items
      window.location.reload();
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error(error.response?.data?.message || 'Failed to reject. Please try again.');
    }
  };

  const handleCounterAction = (item) => {
    // Navigate to the appropriate tab where user can counter
    if (item.type === 'counter_received') {
      handleTabChange('my-bids-offers');
    } else {
      handleTabChange('posts');
    }
    toast.info('Please counter the offer in the detailed view');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'marketplace', label: 'Marketplace', icon: Radio },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'posts', label: 'My Posts', icon: FileText },
    { id: 'my-bids-offers', label: 'My Bids', icon: TrendingUp },
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
    { id: 'admin-final-deals', label: 'Final Deals', icon: CheckCircle },
    { id: 'admin-news', label: 'News/Blog', icon: Newspaper },
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Viewing Banner */}
      {isViewingAsAdmin && viewingUser && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white px-6 py-4 flex items-center justify-between shadow-2xl border-b-4 border-red-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 ring-2 ring-white/50">
                {viewingUser.avatar ? (
                  <img src={viewingUser.avatar} alt={viewingUser.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-orange-600 font-bold text-sm">{viewingUser.username?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="text-lg font-bold">👁️ Admin View Mode</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium opacity-90">Currently Viewing Dashboard Of:</span>
              <span className="text-base font-bold">{viewingUser.fullName || viewingUser.username} <span className="text-sm font-normal">(@{viewingUser.username})</span></span>
            </div>
          </div>
          <button
            onClick={() => {
              searchParams.delete('viewAs');
              setSearchParams(searchParams);
            }}
            className="px-5 py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <span>Exit View</span>
            <span className="text-lg">✕</span>
          </button>
        </div>
      )}
      {/* Left Sidebar Navigation - Compact */}
      <aside id="dashboard-sidebar" className={`w-56 bg-white border-r border-gray-200 fixed left-0 h-full flex flex-col z-30 ${isViewingAsAdmin ? 'top-[52px]' : 'top-0'}`}>
        {/* User Profile */}
        <div className="p-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(isViewingAsAdmin && viewingUser) ? (
                viewingUser.avatar ? (
                  <img src={viewingUser.avatar} alt={viewingUser.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  viewingUser.username?.charAt(0).toUpperCase()
                )
              ) : (
                user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.username?.charAt(0).toUpperCase()
                )
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {isViewingAsAdmin && viewingUser ? (viewingUser.fullName || viewingUser.username) : (user.fullName || user.username)}
              </p>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-500">@{isViewingAsAdmin && viewingUser ? viewingUser.username : user.username}</p>
                {(isViewingAsAdmin && viewingUser ? viewingUser.role : user.role) === 'admin' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">ADM</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Return to Admin Dashboard - Only shown when viewing another user */}
        {isViewingAsAdmin && (
          <div className="p-3 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 flex-shrink-0">
            <button
              onClick={() => {
                searchParams.delete('viewAs');
                setSearchParams(searchParams);
              }}
              className="w-full bg-white hover:bg-orange-50 border-2 border-orange-300 rounded-lg p-2.5 transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 ring-2 ring-blue-200">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-xs">{user.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[10px] text-orange-600 font-semibold mb-0.5">← Return to Admin</p>
                  <p className="text-xs font-bold text-gray-900 truncate">@{user.username}</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Admin View Mode Toggle */}
        {user?.role === 'admin' && !isViewingAsAdmin && (
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            <div className="bg-blue-50 rounded-lg p-2 flex items-center justify-between">
              <button
                onClick={() => setViewMode('user')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'user'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👤 User
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'admin'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
        {/* Sidebar Tabs */}
        {user?.role === 'admin' ? (
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            {/* Show User Tabs or Admin Tabs based on viewMode */}
            {viewMode === 'user' ? (
              tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })
            ) : (
              <>
                <div className="pb-2">
                  <p className="px-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                    <Shield size={12} />
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        ) : (
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`sidebar-tab-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Logout inside scroll */}
        <div className="pt-3 mt-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-sm transition-all text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 ml-56 overflow-x-auto ${isViewingAsAdmin ? 'mt-[68px]' : ''}`}>
        <div className="p-6 min-w-0">
        
        {/* Viewing User Header - Only shown when admin is viewing another user */}
        {isViewingAsAdmin && viewingUser && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 ring-4 ring-orange-200">
                {viewingUser.avatar ? (
                  <img src={viewingUser.avatar} alt={viewingUser.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-2xl">{viewingUser.username?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{viewingUser.fullName || viewingUser.username}</h2>
                  <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">@{viewingUser.username}</span>
                  {viewingUser.role === 'admin' && (
                    <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">ADMIN</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium">👤 Viewing this user's complete dashboard • All data shown below belongs to this user</p>
              </div>
            </div>
          </div>
        )}
        
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
        <div id="dashboard-stats-grid" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Portfolio Value */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <IndianRupee className="text-white" size={20} />
              </div>
              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Total</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-0.5">
              {formatCurrency(portfolioStats.totalValue)}
            </h3>
            <p className="text-xs text-gray-600">Portfolio Value</p>
            <div className="flex items-center gap-1 mt-1.5">
              <ArrowUpRight size={14} className="text-green-600" />
              <span className="text-xs font-semibold text-green-600">+{portfolioStats.gainPercentage}%</span>
              <span className="text-[10px] text-gray-500">this month</span>
            </div>
          </div>

          {/* Total Gain */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <span className="text-[10px] font-medium text-gray-500 bg-green-50 px-2 py-0.5 rounded-full text-green-600">Profit</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-0.5">
              {formatCurrency(portfolioStats.totalGain)}
            </h3>
            <p className="text-xs text-gray-600">Total Gain</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] text-gray-500">from {formatCurrency(portfolioStats.totalInvested)}</span>
            </div>
          </div>

          {/* My Posts Count */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTabChange('posts')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <img src="/Post_icon.png" alt="My Posts" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-[10px] font-medium text-gray-500 bg-blue-50 px-2 py-0.5 rounded-full text-blue-600">Posts</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-0.5">
              {portfolioStats.myPostsCount || 0}
            </h3>
            <p className="text-xs text-gray-600">My Posts</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] text-purple-600 font-medium">View all →</span>
            </div>
          </div>

          {/* My Bids Count */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTabChange('my-bids-offers')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <img src="/Bids.png" alt="My Bids" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-[10px] font-medium text-gray-500 bg-orange-50 px-2 py-0.5 rounded-full text-orange-600">Bids</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-0.5">
              {portfolioStats.myBidsCount || 0}
            </h3>
            <p className="text-xs text-gray-600">My Bids</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] text-purple-600 font-medium">View all →</span>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Bell className="text-white" size={20} />
              </div>
              <span className="text-[10px] font-medium text-gray-500 bg-rose-50 px-2 py-0.5 rounded-full text-rose-600">Action</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-0.5">
              {portfolioStats.pendingActionsCount || 0}
            </h3>
            <p className="text-xs text-gray-600">Pending Actions</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] text-gray-500">Requires attention</span>
            </div>
          </div>
        </div>

        {/* Pending Actions Notification */}
        {actionItems.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {actionItems.length} Pending Action{actionItems.length > 1 ? 's' : ''} Require{actionItems.length === 1 ? 's' : ''} Your Attention
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  You have {actionItems.length} bid{actionItems.length > 1 ? 's' : ''}/offer{actionItems.length > 1 ? 's' : ''} waiting for your response. Review and take action on incoming offers.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTabChange('posts')}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-sm"
                  >
                    View My Posts
                  </button>
                  <button
                    onClick={() => handleTabChange('my-bids-offers')}
                    className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-100 transition-colors text-sm border border-orange-300"
                  >
                    View My Bids
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Create Post */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold">Create Post</h3>
                <p className="text-xs text-purple-100">Sell your shares</p>
              </div>
            </button>

            {/* Browse Market */}
            <button
              onClick={() => handleTabChange('marketplace')}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Browse Market</h3>
                <p className="text-xs text-gray-500">Buy unlisted shares</p>
              </div>
            </button>

            {/* My Portfolio */}
            <button
              onClick={() => handleTabChange('portfolio')}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">My Portfolio</h3>
                <p className="text-xs text-gray-500">Track investments</p>
              </div>
            </button>

            {/* Refer & Earn */}
            <button
              onClick={() => handleTabChange('referrals')}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Refer & Earn</h3>
                <p className="text-xs text-gray-500">Invite friends</p>
              </div>
            </button>
          </div>
        </div>

        {/* Action Center & Recent Activity Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Action Center */}
          <div id="dashboard-action-center" className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Action Center</h2>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {actionItems.length} New
                </span>
              </div>
              <button onClick={() => handleTabChange('posts')} className="text-sm text-purple-600 font-medium hover:underline">
                View All
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              {actionItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8 bg-gray-50 rounded-xl">
                  <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                  <p className="text-gray-900 font-medium text-sm">All Caught Up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actionItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-200">
                        <div className="text-[10px] font-bold text-gray-500 uppercase py-2 px-1 text-center border-r border-gray-200">Type</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase py-2 px-1 text-center border-r border-gray-200">Company</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase py-2 px-1 text-center border-r border-gray-200">Your Bid</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase py-2 px-1 text-center border-r border-gray-200">
                          {item.type === 'counter_received' 
                            ? (item.isBuyer ? 'Seller Price' : 'Buyer Price')
                            : (item.type === 'bid_received' ? 'Buyer Price' : 'Seller Price')}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase py-2 px-1 text-center">Actions</div>
                      </div>
                      
                      {/* Table Data Row */}
                      <div className={`grid grid-cols-5 items-stretch hover:bg-gray-50 transition-colors ${item.type === 'buyer_accepted' ? 'bg-green-50' : ''}`}>
                        {/* Type Column */}
                        <div className="p-2 border-r border-gray-200 flex flex-col justify-center items-center text-center">
                          <p className="text-xs font-bold text-gray-900">
                            {item.type === 'bid_received' || item.type === 'buyer_accepted' ? 'Sell' : 
                             item.type === 'offer_received' ? 'Buy' : 
                             item.originalListing?.type === 'sell' ? 'Sell' : 'Buy'}
                          </p>
                          <p className={`text-[10px] font-medium mt-0.5 ${item.type === 'buyer_accepted' ? 'text-green-600' : 'text-blue-600'}`}>
                            {item.type === 'counter_received' ? 'Counter' : 
                             item.type === 'buyer_accepted' ? '✅ Accepted' :
                             item.type === 'bid_received' ? 'Bid' : 'Offer'}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>

                        {/* Company Column (Script Name + Listing Price) */}
                        <div className="p-2 border-r border-gray-200 flex flex-col justify-center items-center text-center min-w-0">
                          <p className="font-bold text-gray-900 text-xs truncate w-full" title={item.companySymbol}>
                            {item.companySymbol}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            List Price: {formatCurrency(item.listPrice)}
                          </p>
                          <p className="text-[9px] text-gray-400">
                            Qty: {item.quantity?.toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* Your Bid Column (My Action Price) */}
                        <div className="p-2 border-r border-gray-200 flex items-center justify-center">
                          <p className="text-sm font-bold text-purple-700">
                            {formatCurrency(item.myActionPrice)}
                          </p>
                        </div>

                        {/* Offer Price Column (Other Action Price) */}
                        <div className="p-2 border-r border-gray-200 flex items-center justify-center">
                          <p className="text-sm font-bold text-blue-700">
                            {formatCurrency(item.otherActionPrice)}
                          </p>
                        </div>

                        {/* Action Buttons Column (2x2 Grid) */}
                        <div className="p-1.5 flex items-center justify-center">
                          <div className="grid grid-cols-2 gap-1.5 w-full max-w-[80px]">
                            <button 
                              onClick={() => handleAcceptAction(item)}
                              className="bg-green-100 text-green-700 p-1.5 rounded-md hover:bg-green-200 flex items-center justify-center transition-colors"
                              title="Accept"
                            >
                              <CheckCircle size={14} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => handleRejectAction(item)}
                              className="bg-red-100 text-red-700 p-1.5 rounded-md hover:bg-red-200 flex items-center justify-center transition-colors"
                              title="Reject"
                            >
                              <XCircle size={14} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => handleCounterAction(item)}
                              className="bg-orange-100 text-orange-700 p-1.5 rounded-md hover:bg-orange-200 flex items-center justify-center transition-colors"
                              title="Counter"
                            >
                              <RotateCcw size={14} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => {
                                // View button - Navigate to the relevant tab
                                if (item.type === 'counter_received') {
                                  handleTabChange('my-bids-offers');
                                } else {
                                  handleTabChange('posts');
                                }
                              }}
                              className="bg-gray-100 text-gray-700 p-1.5 rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors"
                              title="View"
                            >
                              <Eye size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-600 mt-1">Your latest transactions</p>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Your bids, offers and transactions will appear here</p>
                  </div>
                ) : recentActivities.slice(0, 5).map((activity, index) => {
                  let icon = <Activity size={20} />;
                  let colorClass = 'bg-gray-100 text-gray-600';
                  let title = 'Activity';
                  
                  // Determine Icon and Color based on action/type
                  if (activity.action === 'buy' || activity.action === 'placed_bid' || activity.action === 'placed_offer' || activity.action === 'listed_buy') {
                    icon = <TrendingUp size={20} />;
                    colorClass = 'bg-green-100 text-green-600';
                    title = activity.action === 'buy' ? 'Bought Shares' : 
                            activity.action === 'listed_buy' ? 'Created Buy Request' : 'Placed Order';
                  } else if (activity.action === 'sell' || activity.action === 'listed_sell') {
                    icon = <TrendingDown size={20} />;
                    colorClass = 'bg-red-100 text-red-600';
                    title = activity.action === 'sell' ? 'Sold Shares' : 'Listed for Sale';
                  } else if (activity.action === 'accepted_bid') {
                    icon = <CheckCircle size={20} />;
                    colorClass = 'bg-emerald-100 text-emerald-600';
                    title = 'Accepted Bid';
                  } else if (activity.action === 'rejected_bid') {
                    icon = <XCircle size={20} />;
                    colorClass = 'bg-red-50 text-red-500';
                    title = 'Rejected Bid';
                  } else if (activity.action?.includes('counter')) {
                    icon = <RotateCcw size={20} />;
                    colorClass = 'bg-orange-100 text-orange-600';
                    title = 'Countered Offer';
                  }

                  return (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {activity.description || `${activity.quantity} shares of ${activity.companyName}`}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(activity.date).toLocaleDateString()} • {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button className="w-full mt-4 text-purple-600 font-medium text-sm hover:bg-purple-50 py-2 rounded-lg transition-colors">
                View All Activity →
              </button>
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

            {/* Ad Banner */}
            <div className="mb-6">
              <AdBanner position="listings-top" className="h-24 md:h-32 w-full" />
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
                        companySymbol={listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyId?.symbol}
                        companySector={listing.companyId?.Sector || listing.companyId?.sector || 'Financial Services'}
                        companyPan={listing.companyId?.PAN || listing.companyId?.pan}
                        companyIsin={listing.companyId?.ISIN || listing.companyId?.isin}
                        companyCin={listing.companyId?.CIN || listing.companyId?.cin}
                        companyRegistrationDate={listing.companyId?.registrationDate}
                        companySegmentation={listing.companySegmentation || listing.companyId?.companySegmentation}
                        price={displayPrice}
                        shares={listing.quantity}
                        user={listing.username}
                        createdAt={listing.createdAt}
                        isBoosted={listing.isBoosted || (listing.boostExpiresAt && new Date(listing.boostExpiresAt) > new Date())}
                        onPrimary={() => handlePlaceBid(listing)}
                        onAccept={() => handleAccept(listing)}
                        onShare={() => handleShare(listing)}
                        onLike={() => handleLike(listing)}
                        onFavorite={() => handleFavorite(listing)}
                        isLiked={likedListings.has(listing._id)}
                        isFavorited={favoritedListings.has(listing._id)}
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

        {user?.role === 'admin' && activeTab === 'admin-final-deals' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <AcceptedDeals defaultFilter="confirmed" />
          </div>
        )}

        {user?.role === 'admin' && activeTab === 'admin-ads' && (
          <AdManagement />
        )}

        {user?.role === 'admin' && activeTab === 'admin-referrals' && (
          <ReferralTracking />
        )}

        {user?.role === 'admin' && activeTab === 'admin-news' && (
          <NewsManagement />
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

      {/* Share Card Generator */}
      {showShareCard && shareListingData && (
        <ShareCardGenerator
          listing={shareListingData}
          onClose={() => {
            setShowShareCard(false);
            setShareListingData(null);
          }}
        />
      )}

      {/* Verification Codes Modal */}
      {showVerificationModal && verificationDeal && (
        <VerificationCodesModal
          deal={verificationDeal}
          onClose={() => {
            setShowVerificationModal(false);
            setVerificationDeal(null);
            window.location.reload(); // Refresh to update UI state
          }}
        />
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <CreateListingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setRefreshTrigger(prev => prev + 1);
            toast.success('Listing created successfully!');
          }}
        />
      )}

      {/* Accept Confirmation Modal */}
      {showAcceptConfirmation && listingToAccept && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirm Purchase</h3>
              <button
                onClick={() => {
                  setShowAcceptConfirmation(false);
                  setListingToAccept(null);
                  setAcceptedTerms(false);
                }}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <XCircle size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Company Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              {listingToAccept.companyId?.logo ? (
                <img
                  src={listingToAccept.companyId.logo}
                  alt={listingToAccept.companyName}
                  className="w-16 h-16 rounded-lg object-contain bg-white border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {listingToAccept.companyName?.[0] || 'C'}
                  </span>
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {listingToAccept.companyId?.scriptName || listingToAccept.companyId?.name || listingToAccept.companyName}
                </h4>
                <p className="text-sm text-gray-500">
                  Seller: @{listingToAccept.userId?.username || listingToAccept.username}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price per Share</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(listingToAccept.type === 'sell' 
                    ? calculateBuyerPays(listingToAccept.price) 
                    : listingToAccept.price)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Quantity</span>
                <span className="font-semibold text-gray-900">
                  {listingToAccept.quantity?.toLocaleString('en-IN')} shares
                </span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex items-center justify-between text-lg">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(
                    (listingToAccept.type === 'sell' 
                      ? calculateBuyerPays(listingToAccept.price) 
                      : listingToAccept.price) * listingToAccept.quantity
                  )}
                </span>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm text-center leading-relaxed">
                By proceeding, you confirm that you agree to purchase{' '}
                <span className="font-bold">{listingToAccept.quantity?.toLocaleString('en-IN')} shares</span> of{' '}
                <span className="font-bold">
                  {listingToAccept.companyId?.scriptName || listingToAccept.companyName}
                </span>{' '}
                at{' '}
                <span className="font-bold">
                  {formatCurrency(listingToAccept.type === 'sell' 
                    ? calculateBuyerPays(listingToAccept.price) 
                    : listingToAccept.price)}
                </span>{' '}
                per share.
              </p>
            </div>

            {/* Terms & Conditions Checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I have read and agree to the{' '}
                <a href="/terms" target="_blank" className="text-emerald-600 font-medium hover:underline">
                  Terms & Conditions
                </a>
                ,{' '}
                <a href="/privacy" target="_blank" className="text-emerald-600 font-medium hover:underline">
                  Privacy Policy
                </a>
                , and{' '}
                <a href="/disclaimer" target="_blank" className="text-emerald-600 font-medium hover:underline">
                  Risk Disclaimer
                </a>
                . I understand that unlisted shares carry higher risk and the transaction is final once confirmed.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAcceptConfirmation(false);
                  setListingToAccept(null);
                  setAcceptedTerms(false);
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={!acceptedTerms}
                className={`flex-1 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  acceptedTerms
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle size={18} />
                Confirm & Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
