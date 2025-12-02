import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Edit, Trash2, RotateCcw } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor, calculateTotalWithFee } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyBidsOffersTab = () => {
  const [activeSubmenu, setActiveSubmenu] = useState('bids'); // 'bids' or 'offers'
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => {
            // Group counter history into rounds
            const rounds = [];
            const counterHistory = activity.counterHistory || [];
            
            // Round 1: Initial bid + seller's first counter (if any)
            const round1 = {
              roundNumber: 1,
              yourBid: {
                price: calculateTotalWithFee(activity.price),
                quantity: activity.quantity
              },
              sellerCounter: counterHistory.length > 0 && counterHistory[0].by === 'seller' ? {
                price: calculateTotalWithFee(counterHistory[0].price),
                quantity: counterHistory[0].quantity,
                username: activity.listing.owner?.username
              } : null
            };
            rounds.push(round1);
            
            // Subsequent rounds
            for (let i = 1; i < counterHistory.length; i++) {
              const counter = counterHistory[i];
              if (counter.by === 'buyer') {
                // Your counter offer starts a new round
                rounds.push({
                  roundNumber: rounds.length + 1,
                  yourBid: {
                    price: calculateTotalWithFee(counter.price),
                    quantity: counter.quantity
                  },
                  sellerCounter: counterHistory[i + 1] && counterHistory[i + 1].by === 'seller' ? {
                    price: calculateTotalWithFee(counterHistory[i + 1].price),
                    quantity: counterHistory[i + 1].quantity,
                    username: activity.listing.owner?.username
                  } : null
                });
              }
            }
            
            // Determine if actions should be shown
            const latestRound = rounds[rounds.length - 1];
            const showActions = activity.status === 'countered' && latestRound.sellerCounter;
            const waitingForSeller = !latestRound.sellerCounter && counterHistory.length > 0;
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow transition-all border border-gray-200 overflow-hidden mb-2 p-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                  <div className="flex-1">
                    <h4 className="font-bold text-dark-900 text-sm">{activity.listing.companyName}</h4>
                    <p className="text-[10px] text-dark-500 mt-0.5">
                      {activity.type === 'bid' ? 'Seller' : 'Buyer'}: @{activity.listing.owner?.username || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-dark-500">
                      Listed Price: {formatCurrency(calculateTotalWithFee(activity.listing.listingPrice))} x {activity.listing.quantity} shares
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>

                {/* Negotiation Rounds */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-dark-700 flex items-center gap-1">
                    <RotateCcw size={12} />
                    Negotiation History
                  </h5>
                  
                  {rounds.map((round, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-md overflow-hidden">
                      {/* Round Header */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-2 py-1 border-b border-gray-200">
                        <p className="text-[10px] font-bold text-purple-700">Round {round.roundNumber}</p>
                      </div>
                      
                      {/* Your Bid */}
                      <div className="p-2 bg-green-50 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-semibold text-green-700">
                            Your {round.roundNumber === 1 ? 'Bid' : 'Counter'}:
                          </span>
                          <span className="text-xs font-bold text-green-800">
                            {formatCurrency(round.yourBid.price)}
                          </span>
                        </div>
                        <p className="text-[10px] text-green-600">
                          {round.yourBid.quantity} shares
                        </p>
                        
                        {/* Modify/Delete buttons only on Round 1 and if pending */}
                        {round.roundNumber === 1 && activity.status === 'pending' && (
                          <div className="flex gap-1 mt-1">
                            <button className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center gap-0.5">
                              <Edit size={10} />
                              Modify
                            </button>
                            <button className="flex-1 px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-semibold hover:bg-red-200 transition-colors flex items-center justify-center gap-0.5">
                              <Trash2 size={10} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Seller Counter */}
                      {round.sellerCounter ? (
                        <div className="p-2 bg-orange-50">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-semibold text-orange-700">
                              {activity.type === 'bid' ? 'Seller' : 'Buyer'} (@{round.sellerCounter.username}) Counter:
                            </span>
                            <span className="text-xs font-bold text-orange-800">
                              {formatCurrency(round.sellerCounter.price)}
                            </span>
                          </div>
                          <p className="text-[10px] text-orange-600 mb-1">
                            {round.sellerCounter.quantity} shares
                          </p>
                          
                          {/* Action buttons only on latest round */}
                          {idx === rounds.length - 1 && showActions && (
                            <div className="flex gap-1 mt-1">
                              <button className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-[10px] font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-0.5">
                                <CheckCircle size={10} />
                                Accept
                              </button>
                              <button className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-[10px] font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-0.5">
                                <XCircle size={10} />
                                Reject
                              </button>
                              <button className="flex-1 px-2 py-1 bg-purple-600 text-white rounded text-[10px] font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-0.5">
                                <RotateCcw size={10} />
                                Counter
                              </button>
                            </div>
                          )}
                        </div>
                      ) : idx === rounds.length - 1 && waitingForSeller ? (
                        <div className="p-2 bg-blue-50">
                          <p className="text-[10px] text-blue-700 italic flex items-center gap-1">
                            <Clock size={12} />
                            Waiting for {activity.type === 'bid' ? 'seller' : 'buyer'} response...
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Footer - Timestamp */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-[10px] text-dark-500">
                    Created: {formatDate(activity.createdAt)}
                  </p>
                </div>

                {/* Final Status Messages */}
                {activity.status === 'accepted' && (
                  <div className="mt-2 flex items-center gap-1 bg-green-100 p-2 rounded-lg border border-green-300">
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-[10px] text-green-800 font-bold">✓ Deal Accepted!</span>
                  </div>
                )}
                {activity.status === 'rejected' && (
                  <div className="mt-2 flex items-center gap-1 bg-red-100 p-2 rounded-lg border border-red-300">
                    <XCircle size={14} className="text-red-600" />
                    <span className="text-[10px] text-red-800 font-bold">✗ Bid Rejected</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBidsOffersTab;
