import React, { useState } from 'react';
import { X, DollarSign, Package, MessageCircle, Send } from 'lucide-react';
import { listingsAPI } from '../utils/api';
import { formatCurrency, calculateTotalWithFee } from '../utils/helpers';
import toast from 'react-hot-toast';

const BidOfferModal = ({ listing, onClose, onSuccess }) => {
  const isSell = listing.type === 'sell';
  const [formData, setFormData] = useState({
    price: listing.price.toString(),
    quantity: listing.minLot.toString()
  });
  const [loading, setLoading] = useState(false);

  const totalAmount = calculateTotalWithFee(parseFloat(formData.price || 0)) * parseInt(formData.quantity || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const quantity = parseInt(formData.quantity);
    if (quantity < listing.minLot) {
      toast.error(`Minimum lot size is ${listing.minLot}`);
      return;
    }
    if (quantity > listing.quantity) {
      toast.error(`Maximum available quantity is ${listing.quantity}`);
      return;
    }

    setLoading(true);
    try {
      await listingsAPI.placeBid(listing._id, {
        price: parseFloat(formData.price),
        quantity: quantity
      });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place bid/offer');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        {/* Modal Content */}
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isSell ? 'Place Bid' : 'Make Offer'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Listing Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-bold text-lg">
                    {listing.companyName[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{listing.companyName}</h4>
                  <p className="text-sm text-gray-600">@{listing.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Listed Price</p>
                  <p className="font-bold text-gray-900">{formatCurrency(listing.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="font-bold text-gray-900">{listing.quantity} shares</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Price per Share <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter your price"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                {formData.price && parseFloat(formData.price) !== listing.price && (
                  <p className={`text-xs mt-1 ${
                    parseFloat(formData.price) > listing.price
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {parseFloat(formData.price) > listing.price
                      ? `+${formatCurrency(parseFloat(formData.price) - listing.price)} higher than listed`
                      : `${formatCurrency(listing.price - parseFloat(formData.price))} lower than listed`
                    }
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Number of shares"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    required
                    min={listing.minLot}
                    max={listing.quantity}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min: {listing.minLot} | Max: {listing.quantity} shares
                </p>
              </div>

              {/* Total Amount */}
              <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-orange-900 leading-relaxed">
                  <strong>Note:</strong> Unlisted shares are a high-risk & low-liquidity product. Please research the company's background thoroughly before investing.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    {isSell ? 'Place Bid' : 'Make Offer'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default BidOfferModal;