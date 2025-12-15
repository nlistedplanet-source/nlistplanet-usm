import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, calculateSellerGets, calculateBuyerPays } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyBidsOffersTab = () => {
  const [activeSubmenu, setActiveSubmenu] = useState('bids'); // 'bids' or 'offers'
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' or 'expired'
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');
  const [dealDetails, setDealDetails] = useState({}); // Store deal details by dealId

  // Define which statuses are "active" vs "expired"
  const activeStatuses = ['pending', 'countered', 'pending_seller_confirmation'];
  const expiredStatuses = ['accepted', 'rejected', 'expired', 'completed', 'cancelled', 'confirmed', 'sold', 'rejected_by_seller'];

  useEffect(() => {
    fetchMyActivity();
  }, []);

  const fetchMyActivity = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMyPlacedBids();
      const activitiesData = response.data.data;
      setActivities(activitiesData);
      
      // Fetch deal details for confirmed/sold bids
      const confirmedActivities = activitiesData.filter(a => 
        a.dealId && (a.status === 'confirmed' || a.status === 'sold' || a.status === 'pending_seller_confirmation')
      );
      
      for (const activity of confirmedActivities) {
        if (activity.dealId) {
          try {
            const dealResponse = await listingsAPI.getDeal(activity.dealId);
            setDealDetails(prev => ({
              ...prev,
              [activity.dealId]: dealResponse.data.data
            }));
          } catch (error) {
            console.error(`Failed to fetch deal ${activity.dealId}:`, error);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to fetch your activity');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (activity) => {
    if (!window.confirm('Are you sure you want to accept this offer?')) return;
    
    try {
      setActionLoading(activity._id);
      const response = await listingsAPI.acceptBid(activity.listing._id, activity._id);
      const status = response.data.status;
      
      if (status === 'confirmed') {
        toast.success('Deal confirmed! 🎉');
      } else if (status === 'accepted') {
        toast.success('Accepted! Waiting for other party to confirm. ⏳');
      }
      fetchMyActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (activity) => {
    if (!window.confirm('Are you sure you want to reject this offer?')) return;

    try {
      setActionLoading(activity._id);
      await listingsAPI.rejectBid(activity.listing._id, activity._id);
      toast.success('Offer rejected');
      fetchMyActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounterClick = (activity) => {
    setSelectedActivity(activity);
    // Pre-fill with the LAST price from history or original
    const lastPrice = activity.counterHistory?.length > 0 
      ? activity.counterHistory[activity.counterHistory.length - 1].price 
      : activity.price;
      
    setCounterPrice(lastPrice.toString());
    setCounterQuantity(activity.quantity.toString());
    setShowCounterModal(true);
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(selectedActivity._id);
      await listingsAPI.counterBid(selectedActivity.listing._id, selectedActivity._id, {
        price: parseFloat(counterPrice),
        quantity: parseInt(counterQuantity)
      });
      toast.success('Counter offer sent successfully! 💬');
      setShowCounterModal(false);
      setSelectedActivity(null);
      setCounterPrice('');
      setCounterQuantity('');
      fetchMyActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to determine if action is required
  const isActionRequired = (activity) => {
    if (activity.status !== 'countered') return false;
    if (!activity.counterHistory || activity.counterHistory.length === 0) return false;
    
    const lastCounter = activity.counterHistory[activity.counterHistory.length - 1];
    const isBid = activity.type === 'bid'; // I am Buyer
    
    // If I am Buyer (isBid=true), action required if last counter is from Seller
    // If I am Seller (isBid=false), action required if last counter is from Buyer
    return isBid ? (lastCounter.by === 'seller') : (lastCounter.by === 'buyer');
  };

  // Filter activities based on submenu and status
  const filteredActivities = activities.filter(activity => {
    const typeMatch = activeSubmenu === 'bids' 
      ? activity.type === 'bid' 
      : activity.type === 'offer';
    
    if (!typeMatch) return false;
    
    const isListingDeleted = !activity.listing || activity.listing.isActive === false;
    const isActive = activeStatuses.includes(activity.status) && !isListingDeleted;
    
    if (statusFilter === 'active') {
      return isActive;
    } else {
      return !isActive;
    }
  });

  // Split active activities into "Action Required" and "Others"
  const actionRequiredActivities = statusFilter === 'active' 
    ? filteredActivities.filter(a => isActionRequired(a))
    : [];
    
  const otherActivities = statusFilter === 'active'
    ? filteredActivities.filter(a => !isActionRequired(a))
    : filteredActivities;

  const getStatusCounts = (type) => {
    const typeActivities = activities.filter(a => 
      type === 'bids' ? a.type === 'bid' : a.type === 'offer'
    );
    const activeCount = typeActivities.filter(a => {
      const isListingDeleted = !a.listing || a.listing.isActive === false;
      return activeStatuses.includes(a.status) && !isListingDeleted;
    }).length;
    const expiredCount = typeActivities.length - activeCount;
    return { activeCount, expiredCount, total: typeActivities.length };
  };

  const currentCounts = getStatusCounts(activeSubmenu);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-primary-600 mb-3" size={40} />
        <p className="text-dark-600">Loading your bids & offers...</p>
      </div>
    );
  }

  const renderActivityCard = (activity, isActionable) => {
    const isBid = activity.type === 'bid';
    const counterHistory = activity.counterHistory || [];
    const listingPrice = activity.listing?.displayPrice || activity.listing?.listingPrice || activity.listing?.price || 0;
    const isListingDeleted = !activity.listing || activity.listing.isActive === false;
    
    // Determine the "Current Price" to show in the header
    // If countered, show the latest counter price. If pending, show original bid.
    const latestCounter = counterHistory.length > 0 ? counterHistory[counterHistory.length - 1] : null;
    const rawDisplayPrice = latestCounter ? latestCounter.price : (activity.originalPrice || activity.price);
    
    // Calculate display price based on fee model
    // If I am Buyer (isBid): I pay +2% on Seller's price. My price is already what I pay.
    // If I am Seller (!isBid): I get -2% on Buyer's price. My price is already what I get.
    let displayPrice = rawDisplayPrice;
    if (latestCounter) {
       if (isBid) {
         // I am Buyer. If counter is from Seller, I see (Price * 1.02). If from me, I see (Price).
         displayPrice = latestCounter.by === 'seller' ? calculateBuyerPays(latestCounter.price) : latestCounter.price;
       } else {
         // I am Seller. If counter is from Buyer, I see (Price * 0.98). If from me, I see (Price).
         displayPrice = latestCounter.by === 'buyer' ? calculateSellerGets(latestCounter.price) : latestCounter.price;
       }
    } else {
       // Initial Bid/Offer - use the actual price buyer/seller sees (with fees)
       // Backend sends buyerOfferedPrice (buyer pays) and sellerReceivesPrice (seller gets)
       if (isBid) {
         displayPrice = activity.buyerOfferedPrice || activity.originalPrice || activity.price;
       } else {
         displayPrice = activity.sellerReceivesPrice || activity.originalPrice || activity.price;
       }
    }

    // Determine card background color based on status
    const getCardBgClass = () => {
      if (isActionable) return 'bg-amber-50';
      if (activity.status === 'confirmed' || activity.status === 'sold') return 'bg-emerald-50';
      if (activity.status === 'pending_buyer_confirmation') return 'bg-rose-50';
      if (activity.status === 'rejected') return 'bg-red-50';
      if (activity.status === 'accepted') return 'bg-teal-50';
      if (statusFilter === 'expired') return 'bg-gray-50 opacity-75';
      return 'bg-white';
    };

    const getBorderClass = () => {
      if (isActionable) return 'border-l-4 border-l-amber-500 border-y-amber-200 border-r-amber-200 shadow-md ring-1 ring-amber-100';
      if (activity.status === 'confirmed' || activity.status === 'sold') return 'border-emerald-200';
      if (activity.status === 'pending_buyer_confirmation') return 'border-rose-200 shadow-md';
      if (activity.status === 'rejected') return 'border-red-200';
      if (activity.status === 'accepted') return 'border-teal-200';
      return 'border-gray-200';
    };

    return (
      <div key={activity._id} className={`${getCardBgClass()} rounded-xl shadow-sm border overflow-hidden transition-all ${getBorderClass()}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          isActionable ? 'bg-amber-50' : statusFilter === 'expired' ? 'bg-gray-100' : 'bg-gray-50'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-900">
                {activity.listing?.companyId?.scriptName || activity.listing?.companyId?.ScripName || activity.listing?.companyName || 'Deleted Listing'}
              </h4>
              {isListingDeleted && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">DELETED</span>
              )}
              {isActionable && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
                  <AlertTriangle size={10} /> ACTION REQUIRED
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {isBid ? 'Seller' : 'Buyer'}: @{activity.listing?.owner?.username || 'Unknown'}
            </p>
          </div>
          <div className="text-right">
             <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              activity.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              activity.status === 'pending_seller_confirmation' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
              activity.status === 'pending_buyer_confirmation' ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse' :
              activity.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              activity.status === 'sold' ? 'bg-green-100 text-green-800 border border-green-200' :
              activity.status === 'accepted' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
              activity.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
              activity.status === 'countered' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
              'bg-gray-100 text-gray-700'
            }`}>
              {activity.status === 'pending' ? (isBid ? 'Seller Reviewing Your Bid' : 'Buyer Reviewing Your Offer') :
               activity.status === 'pending_seller_confirmation' ? 'Waiting for Seller to Accept' :
               activity.status === 'pending_buyer_confirmation' ? '🔔 Action Required: Accept Deal' :
               activity.status === 'countered' ? 'New Counter Offer Available' :
               activity.status === 'accepted' ? 'Other Party Accepted - Your Turn' :
               activity.status === 'confirmed' ? '🎉 Deal Confirmed by Both Parties' :
               activity.status === 'rejected' ? (isBid ? 'Your Bid was Declined' : 'Your Offer was Declined') :
               activity.status}
            </span>
          </div>
        </div>

        {/* Action Banner (Only for Actionable Items) */}
        {isActionable && (
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-amber-900">
                New Counter Offer Received!
              </p>
              <p className="text-xs text-amber-700">
                The other party has proposed a new price.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => handleAccept(activity)}
                disabled={actionLoading === activity._id}
                className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all"
              >
                {actionLoading === activity._id ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Accept @ {formatCurrency(displayPrice)}
              </button>
              <button 
                onClick={() => handleCounterClick(activity)}
                className="px-3 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg text-sm font-bold hover:bg-purple-50 flex items-center justify-center gap-1 transition-all"
              >
                <RotateCcw size={16} />
                Counter
              </button>
              <button 
                onClick={() => handleReject(activity)}
                className="px-3 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center justify-center gap-1 transition-all"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Negotiation History Table */}
        <div className="p-4">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <RotateCcw size={12} />
            Negotiation History
          </h5>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Round</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Action By</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Round 1: Initial */}
                <tr className={`${
                  activity.status === 'confirmed' || activity.status === 'sold' ? 'bg-emerald-50' :
                  activity.status === 'pending_buyer_confirmation' ? 'bg-rose-50' :
                  activity.status === 'rejected' ? 'bg-red-50' :
                  activity.status === 'accepted' ? 'bg-teal-50' :
                  activity.status === 'pending' && !counterHistory.length ? 'bg-amber-50' :
                  'bg-white'
                }`}>
                  <td className="px-3 py-2 text-xs text-gray-500">Round 1</td>
                  <td className="px-3 py-2 font-medium text-gray-900">You ({isBid ? 'Bid' : 'Offer'})</td>
                  <td className="px-3 py-2 text-right font-mono text-gray-700">
                    {formatCurrency(isBid ? (activity.buyerOfferedPrice || activity.originalPrice || activity.price) : (activity.sellerReceivesPrice || activity.originalPrice || activity.price))}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">{activity.quantity}</td>
                  <td className="px-3 py-2 text-center">
                    {activity.status === 'pending' && !counterHistory.length && (
                      <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">⏳ Waiting</span>
                    )}
                  </td>
                </tr>
                
                {/* Counter History */}
                {counterHistory.map((counter, idx) => {
                  const isSellerCounter = counter.by === 'seller';
                  // Determine if this row represents "Me" or "Them"
                  const isMe = isBid ? !isSellerCounter : isSellerCounter;
                  
                  // Price Display Logic
                  let rowPrice;
                  if (isBid) {
                    rowPrice = isSellerCounter ? calculateBuyerPays(counter.price) : counter.price;
                  } else {
                    rowPrice = !isSellerCounter ? calculateSellerGets(counter.price) : counter.price;
                  }
                  
                  const isLatestRound = idx === counterHistory.length - 1;
                  const rowBgClass = isLatestRound 
                    ? (isMe ? 'bg-blue-100 border-l-4 border-l-blue-500' : 'bg-orange-100 border-l-4 border-l-orange-500')
                    : (isMe ? 'bg-blue-50/40' : 'bg-orange-50/40');
                  
                  return (
                    <tr key={idx} className={`${rowBgClass} transition-all hover:shadow-sm`}>
                      <td className="px-3 py-2 text-xs font-semibold text-gray-600">
                        Round {counter.round || (idx + 2)}
                        {isLatestRound && <span className="ml-1 text-[10px] text-purple-600">● Latest</span>}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-bold ${isMe ? 'text-blue-700' : 'text-orange-700'}`}>
                          {isMe ? '👤 You' : (isBid ? '👔 Seller' : '🛒 Buyer')}
                        </span>
                        <span className="text-[10px] text-gray-500 ml-1">(Counter)</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-gray-900">
                        {formatCurrency(rowPrice)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-900">{counter.quantity}</td>
                      <td className="px-3 py-2 text-center">
                        {isLatestRound && activity.status === 'countered' && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Current</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Verification Codes (Confirmed) */}
          {(activity.status === 'confirmed' || activity.status === 'sold') && activity.dealId && dealDetails[activity.dealId] && (
            <div className="mt-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
              <h5 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-emerald-600" />
                Deal Confirmed! Verification Codes
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                  <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Your Code</div>
                  <div className="text-lg font-bold text-blue-700 font-mono">
                    BUY-{dealDetails[activity.dealId].buyerVerificationCode}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-orange-200 shadow-sm">
                  <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Seller Code</div>
                  <div className="text-lg font-bold text-orange-700 font-mono">
                    SEL-{dealDetails[activity.dealId].sellerVerificationCode}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200 shadow-sm">
                  <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Admin Code</div>
                  <div className="text-lg font-bold text-purple-700 font-mono">
                    ADM-{dealDetails[activity.dealId].rmVerificationCode}
                  </div>
                </div>
              </div>
              <p className="text-xs text-emerald-700">
                Please share these codes with the Relationship Manager to complete the transaction.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-dark-900">My Bids & Offers</h2>
        <span className="text-xs text-dark-500 bg-dark-100 px-3 py-1 rounded-full font-semibold">
          {activities.length} Total
        </span>
      </div>

      {/* Submenu Tabs */}
      <div className="flex gap-2 mb-3 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => { setActiveSubmenu('bids'); setStatusFilter('active'); }}
          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeSubmenu === 'bids'
              ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:bg-gray-200'
          }`}
        >
          <TrendingUp size={18} />
          Bids Placed
          {activities.filter(a => a.type === 'bid' && activeStatuses.includes(a.status)).length > 0 && (
             <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
               {activities.filter(a => a.type === 'bid' && activeStatuses.includes(a.status)).length}
             </span>
          )}
        </button>
        <button
          onClick={() => { setActiveSubmenu('offers'); setStatusFilter('active'); }}
          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeSubmenu === 'offers'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:bg-gray-200'
          }`}
        >
          <TrendingDown size={18} />
          Offers Made
          {activities.filter(a => a.type === 'offer' && activeStatuses.includes(a.status)).length > 0 && (
             <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
               {activities.filter(a => a.type === 'offer' && activeStatuses.includes(a.status)).length}
             </span>
          )}
        </button>
      </div>

      {/* Active/Expired Toggle */}
      <div className="flex items-center justify-end gap-3 mb-4">
        <button
          onClick={() => setStatusFilter('active')}
          className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
            statusFilter === 'active' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:bg-gray-100'
          }`}
        >
          Active ({currentCounts.activeCount})
        </button>
        <button
          onClick={() => setStatusFilter('expired')}
          className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
            statusFilter === 'expired' ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:bg-gray-100'
          }`}
        >
          History ({currentCounts.expiredCount})
        </button>
      </div>

      {/* Content */}
      {filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          {statusFilter === 'active' ? (
            <Clock className="text-gray-300 mb-3" size={48} />
          ) : (
            <CheckCircle className="text-gray-300 mb-3" size={48} />
          )}
          <p className="text-gray-600 font-medium mb-2">
            No {statusFilter === 'active' ? 'active' : 'past'} {activeSubmenu === 'bids' ? 'bids' : 'offers'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Required Section */}
          {actionRequiredActivities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider px-1">
                <AlertTriangle size={16} />
                Action Required
              </div>
              {actionRequiredActivities.map(activity => renderActivityCard(activity, true))}
              
              {otherActivities.length > 0 && (
                <div className="border-t border-gray-200 my-6 pt-4">
                  <div className="flex items-center gap-2 text-gray-400 font-bold text-sm uppercase tracking-wider px-1 mb-4">
                    <Clock size={16} />
                    Waiting for Response
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other Activities */}
          <div className="space-y-4">
            {otherActivities.map(activity => renderActivityCard(activity, false))}
          </div>
        </div>
      )}

      {/* Counter Modal */}
      {showCounterModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCounterModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <RotateCcw size={20} />
                Send Counter Offer
              </h3>
              <p className="text-sm opacity-90 mt-1">{selectedActivity.listing.companyName}</p>
            </div>
            
            <form onSubmit={handleCounterSubmit} className="p-6">
              <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Current Status</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedActivity.counterHistory?.length > 0 
                        ? selectedActivity.counterHistory[selectedActivity.counterHistory.length - 1].price 
                        : selectedActivity.price)}
                    </p>
                    <p className="text-sm text-gray-500">Current Price / Share</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{selectedActivity.quantity}</p>
                    <p className="text-sm text-gray-500">Shares</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-bold text-gray-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    required
                    value={counterQuantity}
                    onChange={(e) => setCounterQuantity(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCounterModal(false)}
                  className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === selectedActivity._id}
                  className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading === selectedActivity._id ? <Loader className="animate-spin" /> : <ArrowRight size={18} />}
                  Send Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBidsOffersTab;
