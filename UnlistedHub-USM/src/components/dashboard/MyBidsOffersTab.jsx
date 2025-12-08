import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, MessageCircle, Eye, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor, numberToWords, formatShortAmount, formatShortQuantity, calculateSellerGets, calculateBuyerPays } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyBidsOffersTab = () => {
  const [activeSubmenu, setActiveSubmenu] = useState('bids'); // 'bids' or 'offers'
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');
  const [expandedCards, setExpandedCards] = useState({});

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

  const toggleCardExpand = (activityId) => {
    setExpandedCards(prev => ({
      ...prev,
      [activityId]: !prev[activityId]
    }));
  };

  // Filter activities based on submenu
  const filteredActivities = activities.filter(activity => {
    if (activeSubmenu === 'bids') {
      return activity.type === 'bid'; // Bids placed on SELL listings
    } else {
      return activity.type === 'offer'; // Offers made on BUY listings
    }
  });

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
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveSubmenu('bids')}
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
          onClick={() => setActiveSubmenu('offers')}
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

      {/* Content */}
      {filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-dark-50 rounded-2xl">
          <Clock className="text-dark-300 mb-3" size={48} />
          <p className="text-dark-600 font-medium mb-2">
            No {activeSubmenu === 'bids' ? 'bids placed' : 'offers made'} yet
          </p>
          <p className="text-dark-500 text-sm text-center">
            {activeSubmenu === 'bids' 
              ? 'Bids you place on sell listings will appear here'
              : 'Offers you make on buy requests will appear here'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => {
            const isBid = activity.type === 'bid';
            const isExpanded = expandedCards[activity._id];
            const sellerReceivesPrice = activity.sellerReceivesPrice || (activity.price * 0.98);
            const listingPrice = activity.listing.displayPrice || activity.listing.listingPrice || activity.listing.price;
            const hasCounterHistory = activity.counterHistory && activity.counterHistory.length > 0;

            return (
              <div key={activity._id} className="bg-white rounded-md shadow-sm hover:shadow transition-all border border-gray-300 overflow-hidden">
                {/* Header - Status Bar */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 border-b border-gray-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold border-2 ${
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-400' :
                      activity.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-400' :
                      activity.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-400' :
                      activity.status === 'countered' ? 'bg-blue-100 text-blue-700 border-blue-400' :
                      'bg-gray-100 text-gray-700 border-gray-400'
                    }`}>
                      {activity.status === 'pending' && '⏳'}
                      {activity.status === 'accepted' && '✅'}
                      {activity.status === 'rejected' && '❌'}
                      {activity.status === 'countered' && '💬'}
                      {' '}
                      {activity.status?.toUpperCase() || 'PENDING'}
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold border-2 ${
                      isBid ? 'bg-green-50 text-green-700 border-green-400' : 'bg-blue-50 text-blue-700 border-blue-400'
                    }`}>
                      {isBid ? '📈 BID' : '📉 OFFER'} Placed
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-600 font-semibold">{formatDate(activity.createdAt)}</span>
                </div>

                {/* Company Info */}
                <div className="px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{activity.listing.companyName}</h3>
                    </div>
                    <div className="text-xs text-gray-600">
                      Owner: <span className="font-bold text-blue-600">@{activity.listing.owner?.username || 'Unknown'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Listed at {formatCurrency(listingPrice)} • {activity.listing.quantity || 0} shares
                  </p>
                </div>

                {/* Price Table - Your Bid/Offer */}
                <div className="px-3 py-2 border-b border-gray-200">
                  <table className="w-full border-2 border-gray-400">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border-2 border-gray-400 px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase">Your {isBid ? 'Bid' : 'Offer'}</th>
                        <th className="border-2 border-gray-400 px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase">
                          {isBid ? 'You Pay' : 'You Receive'}
                        </th>
                        <th className="border-2 border-gray-400 px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase">Quantity</th>
                        <th className="border-2 border-gray-400 px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="border-2 border-gray-400 px-2 py-2 text-center">
                          <div className="text-sm font-bold text-gray-900 cursor-help" title={numberToWords(activity.price)}>
                            {formatCurrency(activity.price)}
                          </div>
                        </td>
                        <td className="border-2 border-gray-400 px-2 py-2 text-center">
                          <div className={`text-sm font-bold cursor-help ${isBid ? 'text-red-600' : 'text-green-600'}`} title={numberToWords(isBid ? activity.price : sellerReceivesPrice)}>
                            {formatCurrency(isBid ? activity.price : sellerReceivesPrice)}
                          </div>
                        </td>
                        <td className="border-2 border-gray-400 px-2 py-2 text-center">
                          <div className="text-sm font-bold text-gray-900 cursor-help" title={`${activity.quantity?.toLocaleString('en-IN')} shares`}>
                            {formatShortQuantity(activity.quantity || 0)}
                          </div>
                        </td>
                        <td className="border-2 border-gray-400 px-2 py-2 text-center">
                          <div className={`text-sm font-bold cursor-help ${isBid ? 'text-red-600' : 'text-green-600'}`} title={numberToWords((isBid ? activity.price : sellerReceivesPrice) * activity.quantity)}>
                            {formatShortAmount((isBid ? activity.price : sellerReceivesPrice) * activity.quantity)}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Actions - Show for countered status */}
                {activity.status === 'countered' && (
                  <div className="px-3 py-2 border-b border-gray-200 bg-blue-50">
                    <p className="text-[11px] font-bold text-blue-800 mb-2">💬 Owner sent a counter offer! Take action:</p>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleAccept(activity)} 
                        disabled={actionLoading === activity._id}
                        className="flex flex-col items-center px-3 py-2 hover:bg-green-100 rounded-md transition-colors border-2 border-green-300 bg-green-50 disabled:opacity-50"
                      >
                        <span className="text-lg">✅</span>
                        <span className="text-[11px] font-bold text-green-700 mt-0.5">Accept</span>
                      </button>
                      <button 
                        onClick={() => handleReject(activity)} 
                        disabled={actionLoading === activity._id}
                        className="flex flex-col items-center px-3 py-2 hover:bg-red-100 rounded-md transition-colors border-2 border-red-300 bg-red-50 disabled:opacity-50"
                      >
                        <span className="text-lg">❌</span>
                        <span className="text-[11px] font-bold text-red-700 mt-0.5">Reject</span>
                      </button>
                      <button 
                        onClick={() => handleCounterClick(activity)} 
                        disabled={actionLoading === activity._id}
                        className="flex flex-col items-center px-3 py-2 hover:bg-blue-100 rounded-md transition-colors border-2 border-blue-300 bg-blue-50 disabled:opacity-50"
                      >
                        <span className="text-lg">💬</span>
                        <span className="text-[11px] font-bold text-blue-700 mt-0.5">Counter</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Counter History - Collapsible */}
                {hasCounterHistory && (
                  <div className="px-3 py-2">
                    <button 
                      onClick={() => toggleCardExpand(activity._id)}
                      className="w-full bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-2 rounded-md border border-gray-400 flex items-center justify-between hover:from-blue-200 hover:to-purple-200 transition-colors"
                    >
                      <h4 className="font-bold text-gray-900 text-[11px]">Counter History ({activity.counterHistory.length})</h4>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-700" /> : <ChevronDown className="w-4 h-4 text-gray-700" />}
                    </button>
                    
                    {isExpanded && (
                      <div className="border-2 border-gray-400 border-t-0 rounded-b-lg overflow-hidden mt-0">
                        <table className="w-full bg-white">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border-r-2 border-gray-300 px-2 py-1 text-left text-[11px] font-bold text-gray-700 uppercase">Round</th>
                              <th className="border-r-2 border-gray-300 px-2 py-1 text-left text-[11px] font-bold text-gray-700 uppercase">By</th>
                              <th className="border-r-2 border-gray-300 px-2 py-1 text-left text-[11px] font-bold text-gray-700 uppercase">Price</th>
                              <th className="px-2 py-1 text-left text-[11px] font-bold text-gray-700 uppercase">Message</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-gray-300">
                            {activity.counterHistory.map((counter, idx) => {
                              // Viewer perspective price adjustment:
                              // - If isBid (buyer viewing their bids on SELL listings):
                              //   - Seller's counter: buyer sees ×1.02 (what they'll pay)
                              //   - Buyer's counter: shows as-is (their own entered price)
                              // - If !isBid (seller viewing their offers on BUY listings):
                              //   - Buyer's counter: seller sees ×0.98 (what they'll receive)
                              //   - Seller's counter: shows as-is (their own entered price)
                              const isSellerCounter = counter.by === 'seller';
                              let displayPrice;
                              if (isBid) {
                                displayPrice = isSellerCounter ? calculateBuyerPays(counter.price) : counter.price;
                              } else {
                                displayPrice = !isSellerCounter ? calculateSellerGets(counter.price) : counter.price;
                              }
                              
                              return (
                              <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                <td className="border-r-2 border-gray-200 px-2 py-2 text-[11px] font-bold text-gray-900">#{counter.round}</td>
                                <td className="border-r-2 border-gray-200 px-2 py-2 text-[11px] font-semibold text-blue-700">{counter.by}</td>
                                <td className="border-r-2 border-gray-200 px-2 py-2 text-[11px] font-bold text-purple-700">{formatCurrency(displayPrice)}</td>
                                <td className="px-2 py-2 text-[11px] text-gray-700">{counter.message || '—'}</td>
                              </tr>
                            );})}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Messages */}
                {activity.status === 'accepted' && (
                  <div className="px-3 py-2 bg-green-50">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-xs text-green-700 font-bold">✅ Accepted by owner! Deal completed.</span>
                    </div>
                  </div>
                )}
                {activity.status === 'rejected' && (
                  <div className="px-3 py-2 bg-red-50">
                    <div className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-600" />
                      <span className="text-xs text-red-700 font-bold">❌ Rejected by owner.</span>
                    </div>
                  </div>
                )}
                {activity.status === 'pending' && (
                  <div className="px-3 py-2 bg-yellow-50">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-yellow-600" />
                      <span className="text-xs text-yellow-700 font-bold">⏳ Waiting for owner's response...</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Counter Modal */}
      {showCounterModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowCounterModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border-4 border-purple-400" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold">💬 Send Counter Offer</h3>
              <p className="text-sm opacity-90 mt-1">{selectedActivity.listing.companyName} - Your {selectedActivity.type === 'bid' ? 'Bid' : 'Offer'}</p>
            </div>
            <form onSubmit={handleCounterSubmit} className="p-6">
              <div className="bg-blue-50 rounded-xl p-4 mb-5 border-2 border-blue-200">
                <p className="text-sm font-bold text-gray-700 mb-3">Current {selectedActivity.type === 'bid' ? 'Bid' : 'Offer'}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-blue-300">
                    <span className="text-gray-600 block mb-1">Price per share:</span>
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(selectedActivity.price)}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-300">
                    <span className="text-gray-600 block mb-1">Quantity:</span>
                    <span className="font-bold text-gray-900 text-lg">{selectedActivity.quantity} shares</span>
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900" 
                  placeholder="Enter your counter price" 
                />
                {counterPrice && (
                  <p className="text-purple-600 text-sm mt-1 font-medium italic">
                    {numberToWords(parseFloat(counterPrice))} Rupees Only
                  </p>
                )}
              </div>
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Quantity *</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={counterQuantity} 
                  onChange={(e) => setCounterQuantity(e.target.value)} 
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900" 
                  placeholder="Enter quantity" 
                />
                {counterQuantity && (
                  <p className="text-purple-600 text-sm mt-1 font-medium italic">
                    {numberToWords(parseInt(counterQuantity))} Shares
                  </p>
                )}
              </div>
              {counterPrice && counterQuantity && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-5 border-2 border-purple-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-800 font-bold text-lg">Total Amount:</span>
                    <span className="text-2xl font-bold text-purple-900">{formatCurrency(parseFloat(counterPrice) * parseInt(counterQuantity))}</span>
                  </div>
                  <p className="text-purple-700 text-sm font-medium italic text-right">
                    {numberToWords(parseFloat(counterPrice) * parseInt(counterQuantity))} Rupees Only
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCounterModal(false)} 
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-400 transition-colors border-2 border-gray-400"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading === selectedActivity._id || !counterPrice || !counterQuantity} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-purple-700"
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
