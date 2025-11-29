import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, CheckCircle, XCircle, MessageCircle, X, DollarSign, Package } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BidsTab = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [counterData, setCounterData] = useState({ price: '', quantity: '', message: '' });

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMy({ type: 'sell' });
      // Extract all bids from sell listings
      const allBids = [];
      response.data.data.forEach(listing => {
        listing.bids?.forEach(bid => {
          allBids.push({
            ...bid,
            listing: {
              _id: listing._id,
              companyName: listing.companyName,
              price: listing.price,
              quantity: listing.quantity
            }
          });
        });
      });
      setBids(allBids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error('Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bid) => {
    try {
      setActionLoading(bid._id);
      await listingsAPI.acceptBid(bid.listing._id, bid._id);
      toast.success('Bid accepted successfully! 🎉');
      fetchBids();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept bid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bid) => {
    try {
      setActionLoading(bid._id);
      await listingsAPI.rejectBid(bid.listing._id, bid._id);
      toast.success('Bid rejected');
      fetchBids();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject bid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounterClick = (bid) => {
    setSelectedBid(bid);
    setCounterData({
      price: bid.price.toString(),
      quantity: bid.quantity.toString(),
      message: ''
    });
    setShowCounterModal(true);
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(selectedBid._id);
      await listingsAPI.counterBid(
        selectedBid.listing._id,
        selectedBid._id,
        {
          price: parseFloat(counterData.price),
          quantity: parseInt(counterData.quantity),
          message: counterData.message
        }
      );
      toast.success('Counter offer sent successfully! 💬');
      setShowCounterModal(false);
      setSelectedBid(null);
      setCounterData({ price: '', quantity: '', message: '' });
      fetchBids();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-primary-600 mb-3" size={40} />
        <p className="text-dark-600">Loading bids...</p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-dark-50 rounded-2xl">
        <TrendingUp className="text-dark-300 mb-3" size={48} />
        <p className="text-dark-600 font-medium mb-2">No bids received yet</p>
        <p className="text-dark-500 text-sm text-center">
          Bids will appear here when someone places a bid on your sell posts
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-dark-900 mb-4">Bids Received ({bids.length})</h2>
      
      <div className="space-y-3">
        {bids.map((bid, index) => (
          <div key={index} className="card-mobile">
            {/* Listing Info */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-dark-900">{bid.listing.companyName}</h4>
                <p className="text-xs text-dark-500">Your listed price: {formatCurrency(bid.listing.price)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bid.status)}`}>
                {bid.status}
              </span>
            </div>

            {/* Bid Details */}
            <div className="bg-dark-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-600">Bidder:</span>
                <span className="font-semibold text-dark-900">@{bid.username}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-600">Bid Price:</span>
                <span className="font-bold text-primary-700">{formatCurrency(bid.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600">Quantity:</span>
                <span className="font-semibold text-dark-900">{bid.quantity} shares</span>
              </div>
            </div>

            {/* Counter History */}
            {bid.counterHistory && bid.counterHistory.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-dark-600 mb-2">Counter Offer History:</p>
                <div className="space-y-2">
                  {bid.counterHistory.map((counter, idx) => (
                    <div key={idx} className="bg-dark-50 rounded-lg p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Round {counter.round} ({counter.by}):</span>
                        <span className="text-primary-600 font-bold">{formatCurrency(counter.price)}</span>
                      </div>
                      {counter.message && <p className="text-dark-600 mt-1">{counter.message}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-dark-500">{formatDate(bid.createdAt)}</p>

            {/* Actions */}
            {bid.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => handleAccept(bid)}
                  disabled={actionLoading === bid._id}
                  className="flex-1 btn-mobile bg-green-600 text-white text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === bid._id ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Accept
                </button>
                <button 
                  onClick={() => handleReject(bid)}
                  disabled={actionLoading === bid._id}
                  className="flex-1 btn-mobile bg-red-600 text-white text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === bid._id ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                  Reject
                </button>
                <button 
                  onClick={() => handleCounterClick(bid)}
                  disabled={actionLoading === bid._id}
                  className="btn-mobile btn-secondary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Counter
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Counter Offer Modal */}
      {showCounterModal && selectedBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCounterModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Counter Offer</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedBid.listing.companyName}</p>
              </div>
              <button
                onClick={() => setShowCounterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleCounterSubmit} className="p-6">
              {/* Original Bid Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Original Bid by @{selectedBid.username}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Price:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(selectedBid.price)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-700">Quantity:</span>
                  <span className="font-bold text-gray-900">{selectedBid.quantity} shares</span>
                </div>
              </div>

              {/* Counter Price Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Counter Price (per share)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={counterData.price}
                    onChange={(e) => setCounterData({ ...counterData, price: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Enter your counter price"
                  />
                </div>
              </div>

              {/* Counter Quantity Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity (optional - leave as is to keep same)
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  <input
                    type="number"
                    min="1"
                    value={counterData.quantity}
                    onChange={(e) => setCounterData({ ...counterData, quantity: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={counterData.message}
                  onChange={(e) => setCounterData({ ...counterData, message: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                  placeholder="Add a message for the bidder..."
                />
              </div>

              {/* Total Amount Display */}
              {counterData.price && counterData.quantity && (
                <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(parseFloat(counterData.price) * parseInt(counterData.quantity))}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={actionLoading === selectedBid._id || !counterData.price}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading === selectedBid._id ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle size={20} />
                    Send Counter Offer
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidsTab;