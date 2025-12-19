import React, { useState, useEffect } from 'react';
import { 
  Loader, Share2, Eye, MousePointerClick, TrendingUp, Copy, 
  ExternalLink, DollarSign, Award, BarChart3, Package, RefreshCw,
  User, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://nlistplanet-usm-v8dc.onrender.com/api';

const ReferralsTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [shares, setShares] = useState([]);
  const [referralCode] = useState(user?.referralCode || '');

  useEffect(() => {
    fetchShareStats();
  }, []);

  const fetchShareStats = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/share/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        setStats({
          totalShares: data.totalShares || 0,
          totalViews: data.totalClicks || 0,
          totalConversions: data.totalConversions || 0,
          totalEarnings: data.totalEarnings || 0,
          conversionRate: data.totalClicks > 0 
            ? ((data.totalConversions / data.totalClicks) * 100).toFixed(2)
            : 0
        });

        // Group shares by listing with owner info
        const enrichedShares = await Promise.all(
          (data.shares || []).map(async (share) => {
            const listing = share.listingId;
            if (!listing) return null;

            // Check if this is user's own post
            const isOwnPost = listing.userId?.toString() === user._id?.toString();
            
            return {
              _id: share._id,
              shareId: share.shareId,
              postId: listing.postId || 'N/A',
              company: listing.companyName || listing.company || 'Unknown',
              companyLogo: listing.companyId?.logo || listing.companyId?.Logo,
              type: listing.type,
              price: listing.price,
              quantity: listing.quantity,
              isOwnPost,
              ownerUsername: listing.username || 'N/A',
              views: share.uniqueVisitors?.length || 0,
              clicks: share.clicks || 0,
              conversions: share.conversions?.length || 0,
              earnings: share.conversions?.reduce((sum, c) => sum + (c.referralReward || 0), 0) || 0,
              shareDate: share.shareDate || share.createdAt,
              shareLink: `${window.location.origin}/listing/${listing._id}?ref=${share.shareId}`
            };
          })
        );

        setShares(enrichedShares.filter(s => s !== null));

        if (showToast) toast.success('Stats refreshed!');
      }
    } catch (error) {
      console.error('Failed to fetch share stats:', error);
      toast.error('Failed to load share statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Share link copied!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success('Referral code copied!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="animate-spin text-purple-600 mb-3" size={40} />
        <p className="text-gray-600">Loading referral data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="text-purple-600" size={28} />
            Referral & Share Tracking
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track all your shared posts, views, and earnings in one place
          </p>
        </div>
        <button
          onClick={() => fetchShareStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span className="text-sm font-semibold">Refresh</span>
        </button>
      </div>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-purple-100 mb-1">Your Referral Code</p>
            <div className="flex items-center gap-3">
              <code className="text-3xl font-bold font-mono tracking-wider">{referralCode}</code>
              <button
                onClick={handleCopyReferralCode}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <Award size={32} />
          </div>
        </div>
        <p className="text-sm text-purple-100">
          Share this code with friends or use share links below to earn rewards from every successful transaction!
        </p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Share2 className="text-blue-600" size={24} />
            <span className="text-3xl font-bold text-gray-900">{stats?.totalShares || 0}</span>
          </div>
          <p className="text-sm font-semibold text-gray-600">Total Shares</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Eye className="text-green-600" size={24} />
            <span className="text-3xl font-bold text-gray-900">{stats?.totalViews || 0}</span>
          </div>
          <p className="text-sm font-semibold text-gray-600">Total Views</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-orange-600" size={24} />
            <span className="text-3xl font-bold text-gray-900">{stats?.totalConversions || 0}</span>
          </div>
          <p className="text-sm font-semibold text-gray-600">Conversions</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="text-purple-600" size={24} />
            <span className="text-3xl font-bold text-gray-900">{stats?.conversionRate || 0}%</span>
          </div>
          <p className="text-sm font-semibold text-gray-600">Conv. Rate</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={24} />
            <span className="text-3xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</span>
          </div>
          <p className="text-sm font-semibold text-green-100">Total Earnings</p>
        </div>
      </div>

      {/* Shared Posts List */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={20} />
          Shared Posts ({shares.length})
        </h3>

        {shares.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No shared posts yet</p>
            <p className="text-sm text-gray-500">
              Start sharing listings from the marketplace to earn rewards!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shares.map((share) => (
              <div 
                key={share._id} 
                className="bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {share.companyLogo && (
                        <img 
                          src={share.companyLogo} 
                          alt={share.company}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg">{share.company}</h4>
                          <span className="text-xs font-mono font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded border border-gray-300">
                            {share.postId}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          {share.isOwnPost ? (
                            <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-semibold border border-purple-200">
                              <CheckCircle size={12} />
                              Your Post
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                              <User size={12} />
                              @{share.ownerUsername}'s Post
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            share.type === 'sell' 
                              ? 'bg-red-100 text-red-700 border border-red-200' 
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {share.type === 'sell' ? 'SELL' : 'BUY'}
                          </span>
                          <span className="text-gray-600">
                            ₹{share.price} × {share.quantity} shares
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Shared on</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(share.shareDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-blue-900">{share.views}</p>
                      <p className="text-xs text-blue-700 font-semibold">Views</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <MousePointerClick className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-purple-900">{share.clicks}</p>
                      <p className="text-xs text-purple-700 font-semibold">Clicks</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <TrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-orange-900">{share.conversions}</p>
                      <p className="text-xs text-orange-700 font-semibold">Conversions</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                      <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-green-900">{formatCurrency(share.earnings)}</p>
                      <p className="text-xs text-green-700 font-semibold">Earnings</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyLink(share.shareLink)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      <Copy size={16} />
                      Copy Share Link
                    </button>
                    <a
                      href={share.shareLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold border border-gray-300"
                    >
                      <ExternalLink size={16} />
                      Preview
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Earnings Info */}
      {stats?.totalEarnings > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <DollarSign size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-1">💰 Total Earnings: {formatCurrency(stats.totalEarnings)}</h4>
              <p className="text-sm text-gray-700 mb-2">
                You've earned {formatCurrency(stats.totalEarnings)} from {stats.totalConversions} successful referral{stats.totalConversions !== 1 ? 's' : ''}!
              </p>
              <p className="text-xs text-gray-600">
                📌 Rewards are calculated as 10% of platform revenue from successful transactions made through your referral links.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralsTab;