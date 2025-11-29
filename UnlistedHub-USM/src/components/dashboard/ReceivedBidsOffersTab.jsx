import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, TrendingDown, CheckCircle, XCircle, MessageCircle, X, DollarSign, Package } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ReceivedBidsOffersTab = () => {
  const [activeSubmenu, setActiveSubmenu] = useState('bids'); // 'bids' or 'offers'
  const [bids, setBids] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [counterData, setCounterData] = useState({ price: '', quantity: '', message: '' });

  useEffect(() => {
    fetchReceivedBidsOffers();
  }, []);

  const fetchReceivedBidsOffers = async () => {
    try {
      setLoading(true);
      
      // Fetch sell listings with bids
      const sellResponse = await listingsAPI.getMy({ type: 'sell' });
      const allBids = [];
      sellResponse.data.data.forEach(listing => {
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

      // Fetch buy listings with offers
      const buyResponse = await listingsAPI.getMy({ type: 'buy' });
      const allOffers = [];
      buyResponse.data.data.forEach(listing => {
        listing.offers?.forEach(offer => {
          allOffers.push({
            ...offer,
            listing: {
              _id: listing._id,
              companyName: listing.companyName,
              price: listing.price,
              quantity: listing.quantity
            }
          });
        });
      });
      setOffers(allOffers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error('Failed to fetch bids and offers');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (item) => {
    try {
      setActionLoading(item._id);
      await listingsAPI.acceptBid(item.listing._id, item._id);
      toast.success(`${activeSubmenu === 'bids' ? 'Bid' : 'Offer'} accepted successfully! 🎉`);
      fetchReceivedBidsOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to accept ${activeSubmenu === 'bids' ? 'bid' : 'offer'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (item) => {
    try {
      setActionLoading(item._id);
      await listingsAPI.rejectBid(item.listing._id, item._id);
      toast.success(`${activeSubmenu === 'bids' ? 'Bid' : 'Offer'} rejected`);
      fetchReceivedBidsOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to reject ${activeSubmenu === 'bids' ? 'bid' : 'offer'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounterClick = (item) => {
    setSelectedItem(item);
    setCounterData({
      price: item.price.toString(),
      quantity: item.quantity.toString(),
      message: ''
    });
    setShowCounterModal(true);
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(selectedItem._id);
      await listingsAPI.counterBid(
        selectedItem.listing._id,
        selectedItem._id,
        {
          price: parseFloat(counterData.price),
          quantity: parseInt(counterData.quantity),
          message: counterData.message
        }
      );
      toast.success('Counter offer sent successfully! 💬');
      setShowCounterModal(false);
      setSelectedItem(null);
      setCounterData({ price: '', quantity: '', message: '' });
      fetchReceivedBidsOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  const currentData = activeSubmenu === 'bids' ? bids : offers;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-primary-600 mb-3" size={40} />
        <p className="text-dark-600">Loading received bids & offers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-dark-900">Received Bids & Offers</h2>
        <span className="text-xs text-dark-500 bg-dark-100 px-3 py-1 rounded-full font-semibold">
          {bids.length + offers.length} Total
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
          Bids on My Sells
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeSubmenu === 'bids' ? 'bg-white/20' : 'bg-gray-300'
          }`}>
            {bids.length}
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
          Offers on My Buys
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeSubmenu === 'offers' ? 'bg-white/20' : 'bg-gray-300'
          }`}>
            {offers.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {currentData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-dark-50 rounded-2xl">
          {activeSubmenu === 'bids' ? (
            <TrendingUp className="text-dark-300 mb-3" size={48} />
          ) : (
            <TrendingDown className="text-dark-300 mb-3" size={48} />
          )}
          <p className="text-dark-600 font-medium mb-2">
            No {activeSubmenu === 'bids' ? 'bids' : 'offers'} received yet
          </p>
          <p className="text-dark-500 text-sm text-center">
            {activeSubmenu === 'bids' 
              ? 'Bids will appear here when someone places a bid on your sell posts'
              : 'Offers will appear here when someone makes an offer on your buy requests'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentData.map((item, index) => (
            <div key={index} className="card-mobile">
              {/* Listing Info */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-dark-900">{item.listing.companyName}</h4>
                  <p className="text-xs text-dark-500">Your listed price: {formatCurrency(item.listing.price)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              {/* Bid/Offer Details */}
              <div className="bg-dark-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-dark-600">{activeSubmenu === 'bids' ? 'Bidder' : 'Seller'}:</span>
                  <span className="font-semibold text-dark-900">@{item.username}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-dark-600">{activeSubmenu === 'bids' ? 'Bid' : 'Offer'} Price:</span>
                  <span className="font-bold text-primary-700">{formatCurrency(item.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-600">Quantity:</span>
                  <span className="font-semibold text-dark-900">{item.quantity} shares</span>
                </div>
              </div>

              {/* Counter History */}
              {item.counterHistory && item.counterHistory.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-dark-600 mb-2">Counter Offer History:</p>
                  <div className="space-y-2">
                    {item.counterHistory.map((counter, idx) => (
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
              <p className="text-xs text-dark-500">{formatDate(item.createdAt)}</p>

              {/* Actions */}
              {item.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => handleAccept(item)}
                    disabled={actionLoading === item._id}
                    className="flex-1 btn-mobile bg-green-600 text-white text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === item._id ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    Accept
                  </button>
                  <button 
                    onClick={() => handleReject(item)}
                    disabled={actionLoading === item._id}
                    className="flex-1 btn-mobile bg-red-600 text-white text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === item._id ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <XCircle size={18} />
                    )}
                    Reject
                  </button>
                  <button 
                    onClick={() => handleCounterClick(item)}
                    disabled={actionLoading === item._id}
                    className="btn-mobile btn-secondary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Counter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Counter Offer Modal */}
      {showCounterModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCounterModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Counter Offer</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedItem.listing.companyName}</p>
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
              {/* Original Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Original {activeSubmenu === 'bids' ? 'Bid' : 'Offer'} by @{selectedItem.username}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Price:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(selectedItem.price)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-700">Quantity:</span>
                  <span className="font-bold text-gray-900">{selectedItem.quantity} shares</span>
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
                  placeholder={`Add a message for the ${activeSubmenu === 'bids' ? 'bidder' : 'seller'}...`}
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
                disabled={actionLoading === selectedItem._id || !counterData.price}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading === selectedItem._id ? (
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

export default ReceivedBidsOffersTab;
