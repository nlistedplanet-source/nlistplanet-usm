import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw,
  Eye,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  User
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, timeAgo, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const OffersReceivedPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offers, setOffers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, accepted, rejected
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'accept' or 'reject'

  useEffect(() => {
    fetchReceivedOffers();
  }, []);

  const fetchReceivedOffers = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getReceivedBids();
      setOffers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      toast.error('Failed to load received offers');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    await fetchReceivedOffers();
    setRefreshing(false);
    haptic.success();
  };

  const handleAcceptOffer = async () => {
    if (!selectedOffer) return;

    try {
      haptic.medium();
      await listingsAPI.acceptBid(selectedOffer.listingId, selectedOffer._id);
      haptic.success();
      toast.success('Offer accepted successfully!');
      setShowActionModal(false);
      setSelectedOffer(null);
      setActionType(null);
      fetchReceivedOffers();
    } catch (error) {
      haptic.error();
      console.error('Failed to accept offer:', error);
      toast.error(error.response?.data?.message || 'Failed to accept offer');
    }
  };

  const handleRejectOffer = async () => {
    if (!selectedOffer) return;

    try {
      haptic.medium();
      await listingsAPI.rejectBid(selectedOffer.listingId, selectedOffer._id);
      haptic.success();
      toast.success('Offer rejected');
      setShowActionModal(false);
      setSelectedOffer(null);
      setActionType(null);
      fetchReceivedOffers();
    } catch (error) {
      haptic.error();
      console.error('Failed to reject offer:', error);
      toast.error(error.response?.data?.message || 'Failed to reject offer');
    }
  };

  const openActionModal = (offer, type) => {
    haptic.light();
    setSelectedOffer(offer);
    setActionType(type);
    setShowActionModal(true);
  };

  const filteredOffers = offers.filter(offer => {
    if (activeFilter === 'all') return true;
    return offer.status === activeFilter;
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
              <h1 className="text-2xl font-bold text-gray-900">Offers Received</h1>
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
              <FilterButton value="all" label={`All (${offers.length})`} />
              <FilterButton 
                value="pending" 
                label={`Pending (${offers.filter(o => o.status === 'pending').length})`} 
              />
              <FilterButton 
                value="accepted" 
                label={`Accepted (${offers.filter(o => o.status === 'accepted').length})`} 
              />
              <FilterButton 
                value="rejected" 
                label={`Rejected (${offers.filter(o => o.status === 'rejected').length})`} 
              />
            </div>
          </div>
        </div>

        {/* Offers List */}
        <div className="px-6 pt-4">
          {filteredOffers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Offers Found</h3>
              <p className="text-gray-500 mb-6">
                {activeFilter === 'all' 
                  ? "You haven't received any offers yet"
                  : `No ${activeFilter} offers found`
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
              {filteredOffers.map((offer) => (
                <OfferCard 
                  key={offer._id} 
                  offer={offer}
                  onViewClick={() => navigate(`/listing/${offer.listingId}`)}
                  onAcceptClick={() => openActionModal(offer, 'accept')}
                  onRejectClick={() => openActionModal(offer, 'reject')}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              actionType === 'accept' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {actionType === 'accept' ? (
                <Check className="w-8 h-8 text-green-600" />
              ) : (
                <X className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {actionType === 'accept' ? 'Accept Offer?' : 'Reject Offer?'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {actionType === 'accept' 
                ? 'By accepting this offer, you agree to trade with this buyer/seller. You will be notified of the next steps.'
                : 'Are you sure you want to reject this offer? The buyer/seller will be notified.'
              }
            </p>
            
            {/* Offer Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Company</span>
                <span className="font-semibold text-gray-900">{selectedOffer.companyName}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Quantity</span>
                <span className="font-semibold text-gray-900">{selectedOffer.quantity} shares</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Price per share</span>
                <span className="font-semibold text-gray-900">{formatCurrency(selectedOffer.price)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-semibold">Total Amount</span>
                <span className="font-bold text-primary-600">{formatCurrency(selectedOffer.price * selectedOffer.quantity)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  haptic.light();
                  setShowActionModal(false);
                  setSelectedOffer(null);
                  setActionType(null);
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={actionType === 'accept' ? handleAcceptOffer : handleRejectOffer}
                className={`flex-1 rounded-2xl py-3 px-6 font-semibold transition-colors touch-feedback text-white ${
                  actionType === 'accept' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionType === 'accept' ? 'Accept' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Offer Card Component
const OfferCard = ({ offer, onViewClick, onAcceptClick, onRejectClick }) => {
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

  const status = statusConfig[offer.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canTakeAction = offer.status === 'pending';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-mobile">
      <div className="flex items-start gap-4 mb-3">
        {/* Bidder Initial */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7 text-blue-700" />
        </div>

        {/* Offer Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">
                {offer.companyName}
              </h3>
              <p className="text-sm text-gray-500">
                From {offer.bidderName || 'Anonymous'} • {timeAgo(offer.createdAt)}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ml-2 ${status.bgColor} ${status.textColor}`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
          </div>

          {/* Price Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Offered price</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(offer.price)}
                <span className="text-sm text-gray-500 font-normal">/share</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">For {offer.quantity} shares</p>
              <p className="text-lg font-bold text-primary-600">
                {formatCurrency(offer.price * offer.quantity)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message if present */}
      {offer.message && (
        <div className="mb-3 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Message from buyer:</p>
          <p className="text-sm text-gray-700">{offer.message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={onViewClick}
          className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
        >
          <Eye size={14} />
          View Listing
        </button>
        {canTakeAction && (
          <>
            <button 
              onClick={onRejectClick}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors touch-feedback flex items-center gap-1"
            >
              <X size={14} />
              Reject
            </button>
            <button 
              onClick={onAcceptClick}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-semibold text-sm hover:bg-green-100 transition-colors touch-feedback flex items-center gap-1"
            >
              <Check size={14} />
              Accept
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OffersReceivedPage;
