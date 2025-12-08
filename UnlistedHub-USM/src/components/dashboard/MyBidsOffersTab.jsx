import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, RotateCcw, MessageCircle } from 'lucide-react';
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

  // Define which statuses are "active" vs "expired"
  const activeStatuses = ['pending', 'countered'];
  const expiredStatuses = ['accepted', 'rejected', 'expired', 'completed', 'cancelled'];

  useEffect(() => {
    fetchMyActivity();
  }, []);

  const fetchMyActivity = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMyPlacedBids();
      setActivities(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch your activity');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (activity) => {
    try {
      setActionLoading(activity._id);
      await listingsAPI.acceptBid(activity.listing._id, activity._id);
      toast.success('Counter offer accepted! 🎉');
      fetchMyActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (activity) => {
    try {
      setActionLoading(activity._id);
      await listingsAPI.rejectBid(activity.listing._id, activity._id);
      toast.success('Counter offer rejected');
      fetchMyActivity();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounterClick = (activity) => {
    setSelectedActivity(activity);
    setCounterPrice(activity.price.toString());
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

  // Filter activities based on submenu and status
  const filteredActivities = activities.filter(activity => {
    // First filter by type (bids vs offers)
    const typeMatch = activeSubmenu === 'bids' 
      ? activity.type === 'bid' 
      : activity.type === 'offer';
    
    if (!typeMatch) return false;
    
    // Then filter by status (active vs expired)
    // Also check if listing is deleted (listing might be null or have isActive = false)
    const isListingDeleted = !activity.listing || activity.listing.isActive === false;
    const isActive = activeStatuses.includes(activity.status) && !isListingDeleted;
    
    if (statusFilter === 'active') {
      return isActive;
    } else {
      return !isActive; // expired, rejected, completed, or listing deleted
    }
  });

  // Count for badges
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
          onClick={() => {
            setActiveSubmenu('bids');
            setStatusFilter('active');
          }}
          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeSubmenu === 'bids'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <TrendingUp size={18} />
          Bids Placed
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeSubmenu === 'bids' ? 'bg-white/20' : 'bg-gray-300'
          }`}>
            {activities.filter(a => a.type === 'bid').length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveSubmenu('offers');
            setStatusFilter('active');
          }}
          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeSubmenu === 'offers'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <TrendingDown size={18} />
          Offers Made
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeSubmenu === 'offers' ? 'bg-white/20' : 'bg-gray-300'
          }`}>
            {activities.filter(a => a.type === 'offer').length}
          </span>
        </button>
      </div>

      {/* Active/Expired Toggle - Small Switch */}
      <div className="flex items-center justify-end gap-3 mb-4">
        <span className={`text-xs font-medium ${statusFilter === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
          Active ({currentCounts.activeCount})
        </span>
        <button
          onClick={() => setStatusFilter(statusFilter === 'active' ? 'expired' : 'active')}
          className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
            statusFilter === 'expired' ? 'bg-gray-400' : 'bg-emerald-500'
          }`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
            statusFilter === 'expired' ? 'left-8' : 'left-1'
          }`} />
        </button>
        <span className={`text-xs font-medium ${statusFilter === 'expired' ? 'text-gray-700' : 'text-gray-400'}`}>
          Expired ({currentCounts.expiredCount})
        </span>
      </div>

      {/* Content */}
      {filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-dark-50 rounded-2xl">
          {statusFilter === 'active' ? (
            <Clock className="text-dark-300 mb-3" size={48} />
          ) : (
            <CheckCircle className="text-dark-300 mb-3" size={48} />
          )}
          <p className="text-dark-600 font-medium mb-2">
            No {statusFilter === 'active' ? 'active' : 'expired/completed'} {activeSubmenu === 'bids' ? 'bids' : 'offers'}
          </p>
          <p className="text-dark-500 text-sm text-center">
            {statusFilter === 'active'
              ? `Your active ${activeSubmenu === 'bids' ? 'bids' : 'offers'} will appear here`
              : `${activeSubmenu === 'bids' ? 'Bids' : 'Offers'} that are expired, rejected, or completed will appear here`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const isBid = activity.type === 'bid';
            const counterHistory = activity.counterHistory || [];
            const listingPrice = activity.listing?.displayPrice || activity.listing?.listingPrice || activity.listing?.price || 0;
            const hasCounterHistory = counterHistory.length > 0;
            const isListingDeleted = !activity.listing || activity.listing.isActive === false;
            const showActions = activity.status === 'countered' && statusFilter === 'active';
            
            return (
              <div key={activity._id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${statusFilter === 'expired' ? 'border-gray-200 opacity-75' : 'border-gray-200'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 ${statusFilter === 'expired' ? 'bg-gray-100' : 'bg-gray-50'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{activity.listing?.companyName || 'Deleted Listing'}</h4>
                      {isListingDeleted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">DELETED</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {isBid ? 'Seller' : 'Buyer'}: @{activity.listing?.owner?.username || 'Unknown'}
                    </p>
                    {!isListingDeleted && (
                      <p className="text-xs text-gray-500">
                        Listed Price: {formatCurrency(listingPrice)} x {activity.listing?.quantity || 0} shares
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    activity.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    activity.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    activity.status === 'countered' ? 'bg-purple-100 text-purple-700' :
                    activity.status === 'expired' ? 'bg-gray-100 text-gray-600' :
                    activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.status}
                  </span>
                </div>

                {/* Negotiation History Table */}
                <div className="p-4">
                  <h5 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                    <RotateCcw size={14} />
                    Negotiation History
                  </h5>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">Round</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">By</th>
                          <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-700">Price</th>
                          <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-700">Quantity</th>
                          <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Round 1: Your Initial Bid */}
                        <tr className="bg-green-50 hover:bg-green-100">
                          <td className="border border-gray-300 px-3 py-2 text-xs font-bold text-purple-700">Round 1</td>
                          <td className="border border-gray-300 px-3 py-2 text-xs font-semibold text-green-700">Your {isBid ? 'Bid' : 'Offer'}</td>
                          <td className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-right">{formatCurrency(activity.price)}</td>
                          <td className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-right">{activity.quantity} shares</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            {activity.status === 'pending' && !hasCounterHistory && (
                              <span className="text-xs text-yellow-600 font-medium">⏳ Waiting...</span>
                            )}
                          </td>
                        </tr>
                        
                        {/* Counter History Rows */}
                        {counterHistory.map((counter, idx) => {
                          const isSellerCounter = counter.by === 'seller';
                          const roundNum = Math.floor(idx / 2) + 1 + (idx % 2 === 0 ? 0 : 0);
                          const isLatestRow = idx === counterHistory.length - 1;
                          const canTakeAction = isLatestRow && showActions && isSellerCounter;
                          
                          // Viewer perspective:
                          // - If isBid (buyer viewing their bids on SELL listings):
                          //   - Seller's counter: buyer sees ×1.02 (what they'll pay)
                          //   - Buyer's counter: shows as-is (their own entered price)
                          // - If !isBid (seller viewing their offers on BUY listings):
                          //   - Buyer's counter: seller sees ×0.98 (what they'll receive)
                          //   - Seller's counter: shows as-is (their own entered price)
                          let displayPrice;
                          if (isBid) {
                            // Buyer viewing - seller's counter needs ×1.02
                            displayPrice = isSellerCounter ? calculateBuyerPays(counter.price) : counter.price;
                          } else {
                            // Seller viewing - buyer's counter needs ×0.98
                            displayPrice = !isSellerCounter ? calculateSellerGets(counter.price) : counter.price;
                          }
                          
                          return (
                            <tr key={idx} className={`${isSellerCounter ? 'bg-orange-50 hover:bg-orange-100' : 'bg-blue-50 hover:bg-blue-100'}`}>
                              <td className="border border-gray-300 px-3 py-2 text-xs font-bold text-purple-700">
                                {counter.round ? `Round ${counter.round}` : `#${idx + 1}`}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-xs font-semibold">
                                <span className={isSellerCounter ? 'text-orange-700' : 'text-blue-700'}>
                                  {isSellerCounter 
                                    ? `${isBid ? 'Seller' : 'Buyer'} (@${activity.listing.owner?.username}) Counter` 
                                    : 'Your Counter'
                                  }
                                </span>
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-right">
                                {formatCurrency(displayPrice)}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-right">
                                {counter.quantity} shares
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                {canTakeAction && (
                                  <div className="flex items-center justify-center gap-1">
                                    <button 
                                      onClick={() => handleAccept(activity)} 
                                      disabled={actionLoading === activity._id}
                                      className="px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                    >
                                      <CheckCircle size={12} />
                                      Accept
                                    </button>
                                    <button 
                                      onClick={() => handleReject(activity)} 
                                      disabled={actionLoading === activity._id}
                                      className="px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                    >
                                      <XCircle size={12} />
                                      Reject
                                    </button>
                                    <button 
                                      onClick={() => handleCounterClick(activity)} 
                                      disabled={actionLoading === activity._id}
                                      className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                    >
                                      <RotateCcw size={12} />
                                      Counter
                                    </button>
                                  </div>
                                )}
                                {!canTakeAction && isLatestRow && !isSellerCounter && activity.status === 'countered' && (
                                  <span className="text-xs text-blue-600 font-medium">⏳ Waiting for response...</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Created: {formatDate(activity.createdAt)}
                  </p>
                  
                  {/* Status Messages */}
                  {activity.status === 'accepted' && (
                    <div className="flex items-center gap-1 text-green-700">
                      <CheckCircle size={14} />
                      <span className="text-xs font-bold">✓ Deal Accepted!</span>
                    </div>
                  )}
                  {activity.status === 'rejected' && (
                    <div className="flex items-center gap-1 text-red-700">
                      <XCircle size={14} />
                      <span className="text-xs font-bold">✗ Rejected</span>
                    </div>
                  )}
                  {activity.status === 'pending' && (
                    <div className="flex items-center gap-1 text-yellow-700">
                      <Clock size={14} />
                      <span className="text-xs font-bold">⏳ Waiting for response...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Counter Modal */}
      {showCounterModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowCounterModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold">💬 Send Counter Offer</h3>
              <p className="text-sm opacity-90 mt-1">{selectedActivity.listing.companyName}</p>
            </div>
            <form onSubmit={handleCounterSubmit} className="p-6">
              <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-200">
                <p className="text-sm font-bold text-gray-700 mb-3">Current {selectedActivity.type === 'bid' ? 'Bid' : 'Offer'}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-blue-300">
                    <span className="text-gray-600 block mb-1">Price per share:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(selectedActivity.price)}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-300">
                    <span className="text-gray-600 block mb-1">Quantity:</span>
                    <span className="font-bold text-gray-900">{selectedActivity.quantity} shares</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Counter Price (per share) *</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  step="0.01" 
                  value={counterPrice} 
                  onChange={(e) => setCounterPrice(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900" 
                  placeholder="Enter your counter price" 
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Quantity *</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={counterQuantity} 
                  onChange={(e) => setCounterQuantity(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900" 
                  placeholder="Enter quantity" 
                />
              </div>
              {counterPrice && counterQuantity && (
                <div className="bg-purple-50 rounded-xl p-4 mb-5 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-800 font-bold">Total Amount:</span>
                    <span className="text-xl font-bold text-purple-900">{formatCurrency(parseFloat(counterPrice) * parseInt(counterQuantity))}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCounterModal(false)} 
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading === selectedActivity._id || !counterPrice || !counterQuantity} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading === selectedActivity._id ? (
                    <><Loader className="animate-spin" size={20} />Sending...</>
                  ) : (
                    <><MessageCircle size={20} />Send Counter</>
                  )}
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
