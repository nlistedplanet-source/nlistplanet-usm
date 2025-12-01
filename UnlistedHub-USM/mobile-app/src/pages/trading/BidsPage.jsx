import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  X
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, timeAgo, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BidsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bids, setBids] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, accepted, rejected
  const [selectedBid, setSelectedBid] = useState(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMyBids();
      setBids(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
      toast.error('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    await fetchMyBids();
    setRefreshing(false);
    haptic.success();
  };

  const handleWithdrawBid = async () => {
    if (!selectedBid) return;

    try {
      haptic.medium();
      await listingsAPI.withdrawBid(selectedBid.listingId, selectedBid._id);
      haptic.success();
      toast.success('Bid withdrawn successfully');
      setShowWithdrawConfirm(false);
      setSelectedBid(null);
      fetchMyBids();
    } catch (error) {
      haptic.error();
      console.error('Failed to withdraw bid:', error);
      toast.error(error.response?.data?.message || 'Failed to withdraw bid');
    }
  };

  const filteredBids = bids.filter(bid => {
    if (activeFilter === 'all') return true;
    return bid.status === activeFilter;
  });

  const FilterButton = ({ value, label }) => (
    <button
      onClick={() => {
        haptic.light();
        setActiveFilter(value);
      }}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        activeFilter === value
          ? 'bg-primary-600 text-white shadow-lg'
          : 'bg-white text-gray-700 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen-nav flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen-nav bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white sticky top-0 z-10 shadow-sm">
          <div className="px-6 pt-safe pb-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center touch-feedback"
              >
                <RefreshCw className={`w-5 h-5 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-6 px-6">
              <FilterButton value="all" label={`All (${bids.length})`} />
              <FilterButton 
                value="pending" 
                label={`Pending (${bids.filter(b => b.status === 'pending').length})`} 
              />
              <FilterButton 
                value="accepted" 
                label={`Accepted (${bids.filter(b => b.status === 'accepted').length})`} 
              />
              <FilterButton 
                value="rejected" 
                label={`Rejected (${bids.filter(b => b.status === 'rejected').length})`} 
              />
            </div>
          </div>
        </div>

        {/* Bids List */}
        <div className="px-6 pt-4">
          {filteredBids.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Bids Found</h3>
              <p className="text-gray-500 mb-6">
                {activeFilter === 'all' 
                  ? "You haven't placed any bids yet"
                  : `No ${activeFilter} bids found`
                }
              </p>
              <button
                onClick={() => navigate('/marketplace')}
                className="btn-primary inline-flex"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {filteredBids.map((bid) => (
                <BidCard 
                  key={bid._id} 
                  bid={bid}
                  onViewClick={() => navigate(`/listing/${bid.listingId}`)}
                  onWithdrawClick={() => {
                    haptic.light();
                    setSelectedBid(bid);
                    setShowWithdrawConfirm(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Confirmation */}
      {showWithdrawConfirm && selectedBid && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Withdraw Bid?</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to withdraw this bid? The seller will be notified.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  haptic.light();
                  setShowWithdrawConfirm(false);
                  setSelectedBid(null);
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawBid}
                className="flex-1 bg-orange-600 text-white rounded-2xl py-3 px-6 font-semibold hover:bg-orange-700 transition-colors touch-feedback"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Bid Card Component
const BidCard = ({ bid, onViewClick, onWithdrawClick }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      label: 'Pending'
    },
    accepted: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      label: 'Accepted'
    },
    rejected: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      label: 'Rejected'
    }
  };

  const status = statusConfig[bid.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canWithdraw = bid.status === 'pending';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-mobile">
      <div className="flex items-start gap-4">
        {/* Listing Type Badge */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          bid.listingType === 'sell'
            ? 'bg-gradient-to-br from-red-50 to-red-100' 
            : 'bg-gradient-to-br from-green-50 to-green-100'
        }`}>
          <span className={`text-xl font-bold ${
            bid.listingType === 'sell' ? 'text-red-700' : 'text-green-700'
          }`}>
            {bid.companyName?.charAt(0) || '?'}
          </span>
        </div>

        {/* Bid Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">
                {bid.companyName}
              </h3>
              <p className="text-sm text-gray-500">
                {bid.quantity} shares • {timeAgo(bid.createdAt)}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ml-2 ${status.bgColor} ${status.textColor}`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
          </div>

          {/* Price Info */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Your offer</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(bid.price)}
                <span className="text-sm text-gray-500 font-normal">/share</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Total</p>
              <p className="text-lg font-bold text-primary-600">
                {formatCurrency(bid.price * bid.quantity)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={onViewClick}
              className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
            >
              <Eye size={14} />
              View Listing
            </button>
            {canWithdraw && (
              <button 
                onClick={onWithdrawClick}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors touch-feedback flex items-center gap-1"
              >
                <Trash2 size={14} />
                Withdraw
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message if present */}
      {bid.message && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Your message:</p>
          <p className="text-sm text-gray-700">{bid.message}</p>
        </div>
      )}
    </div>
  );
};

export default BidsPage;
