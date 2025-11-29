import React, { useState } from 'react';
import { X, IndianRupee, Package, MessageCircle, Send } from 'lucide-react';
import { listingsAPI } from '../utils/api';
import { formatCurrency, calculateTotalWithFee, calculatePlatformFee, numberToWords } from '../utils/helpers';
import toast from 'react-hot-toast';

const BidOfferModal = ({ listing, onClose, onSuccess }) => {
  const isSell = listing.type === 'sell';
  
  // Calculate display price (same as marketplace card)
  // For sell posts: displayPrice = price / 0.98 (includes platform fee)
  // For buy posts: displayPrice = price (no fee)
  const displayPrice = isSell ? (listing.price / 0.98) : listing.price;
  
  const [formData, setFormData] = useState({
    price: listing.price.toString(),
    quantity: listing.minLot.toString()
  });
  const [loading, setLoading] = useState(false);

  // Correct calculation: base amount first, then fee
  const baseAmount = parseFloat(formData.price || 0) * parseInt(formData.quantity || 0);
  const platformFee = calculatePlatformFee(baseAmount);
  const totalAmount = baseAmount + platformFee;
  const amountInWords = numberToWords(totalAmount);

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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isSell ? '🎯 Secure Your Shares' : '💼 Sell Your Holdings'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isSell ? 'Make a smart investment decision' : 'Find the right buyer for your shares'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Listing Info */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-bold text-base">
                    {listing.companyName[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{listing.companyName}</h4>
                  <p className="text-xs text-gray-600">
                    @{listing.username} <span className="text-[10px] font-semibold text-emerald-600">({isSell ? 'Seller' : 'Buyer'})</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <p className="text-[10px] text-gray-500">{isSell ? 'Seller Price' : 'Want to Buy At'}</p>
                  <p className="font-bold text-sm text-gray-900">₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">{isSell ? 'Available for Sell' : 'Required Shares'}</p>
                  <p className="font-bold text-sm text-gray-900">{listing.quantity} shares</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Price */}
              <div className="relative">
                <div className="relative">
                  <IndianRupee className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors z-10 ${
                    formData.price ? 'text-emerald-600' : 'text-gray-400'
                  }`} size={18} />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.price}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setFormData({ ...formData, price: value });
                    }}
                    placeholder=" "
                    className="w-full pl-9 pr-4 py-2.5 pt-5 pb-7 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all peer text-sm"
                    required
                  />
                  <label className="absolute left-9 top-0 -translate-y-1/2 text-xs text-gray-600 transition-all duration-200 pointer-events-none bg-white px-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-emerald-600">
                    Your Price per Share <span className="text-red-500">*</span>
                  </label>
                  {formData.price && parseFloat(formData.price) > 0 && (
                    <div className="absolute bottom-0.5 left-9 right-4 text-[8px] text-gray-500 truncate leading-tight">
                      {numberToWords(parseFloat(formData.price))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="relative">
                <div className="relative">
                  <Package className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors z-10 ${
                    formData.quantity ? 'text-emerald-600' : 'text-gray-400'
                  }`} size={18} />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.quantity}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, quantity: value });
                    }}
                    placeholder=" "
                    className="w-full pl-9 pr-4 py-2.5 pt-5 pb-7 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all peer text-sm"
                    required
                  />
                  <label className="absolute left-9 top-0 -translate-y-1/2 text-xs text-gray-600 transition-all duration-200 pointer-events-none bg-white px-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-emerald-600">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  {formData.quantity && parseInt(formData.quantity) > 0 && (
                    <div className="absolute bottom-0.5 left-9 right-4 text-[8px] text-gray-500 truncate leading-tight">
                      {parseInt(formData.quantity).toLocaleString('en-IN')} shares
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Min: {listing.minLot} | Max: {listing.quantity} shares
                </p>
              </div>

              {/* Total Amount */}
              <div className="bg-emerald-50 rounded-xl p-3 border-2 border-emerald-200">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-xl font-bold text-emerald-700">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <p className="text-[9px] text-gray-600 leading-tight">
                  {amountInWords}
                </p>
              </div>

              {/* Info */}
              <div className="bg-orange-50 rounded-lg p-1.5 border border-orange-200">
                <p className="text-[9px] text-orange-800 leading-tight">
                  <strong>Note:</strong> Unlisted shares are high-risk & low-liquidity product. Check company details before investing.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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