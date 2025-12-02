import React, { useState, useEffect } from 'react';
import { Loader, Archive, CheckCircle, XCircle, Trash2, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, formatShortQuantity, formatShortAmount, numberToWords } from '../../utils/helpers';
import toast from 'react-hot-toast';

const HistoryTab = () => {
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'sold', 'cancelled', 'expired'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Fetch inactive listings (sold, cancelled, expired)
      const response = await listingsAPI.getMy({ status: 'inactive' });
      setHistoryItems(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = historyItems.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sold':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'cancelled':
        return <Trash2 className="text-red-600" size={18} />;
      case 'expired':
        return <XCircle className="text-gray-600" size={18} />;
      default:
        return <Archive className="text-gray-600" size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sold':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-400';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-400';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-primary-600 mb-3" size={40} />
        <p className="text-dark-600">Loading history...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-dark-900">History</h2>
          <p className="text-xs text-dark-500 mt-1">Your past listings and transactions</p>
        </div>
        <span className="text-xs text-dark-500 bg-dark-100 px-3 py-1 rounded-full font-semibold">
          {filteredItems.length} Items
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
            filterStatus === 'all'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('sold')}
          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
            filterStatus === 'sold'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Sold
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
            filterStatus === 'cancelled'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Cancelled
        </button>
        <button
          onClick={() => setFilterStatus('expired')}
          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
            filterStatus === 'expired'
              ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Expired
        </button>
      </div>

      {/* History Items */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-dark-50 rounded-2xl">
          <Archive className="text-dark-300 mb-3" size={48} />
          <p className="text-dark-600 font-medium mb-2">No history items</p>
          <p className="text-dark-500 text-sm text-center">
            {filterStatus === 'all'
              ? 'Your completed listings will appear here'
              : `No ${filterStatus} listings found`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isSell = item.type === 'sell';
            const price = isSell ? (item.sellerDesiredPrice || item.price) : (item.buyerMaxPrice || item.price);
            const totalAmount = price * item.quantity;

            return (
              <div key={item._id} className="bg-white rounded-lg shadow-sm hover:shadow transition-all border border-gray-200 overflow-hidden p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <div>
                      <h4 className="font-bold text-dark-900 text-sm">{item.companyName}</h4>
                      <p className="text-[10px] text-dark-500">{item.companyId?.Sector || item.companyId?.sector || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border-2 ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isSell ? 'bg-red-50 text-red-700 border-red-400' : 'bg-green-50 text-green-700 border-green-400'
                    }`}>
                      {isSell ? 'SELL' : 'BUY'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <div className="text-[10px] text-gray-600 mb-0.5">Price per share</div>
                    <div className="font-bold text-sm text-gray-900 cursor-help" title={numberToWords(price)}>
                      {formatCurrency(price)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <div className="text-[10px] text-gray-600 mb-0.5">Quantity</div>
                    <div className="font-bold text-sm text-gray-900 cursor-help" title={`${item.quantity?.toLocaleString('en-IN')} shares`}>
                      {formatShortQuantity(item.quantity)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <div className="text-[10px] text-gray-600 mb-0.5">Total Amount</div>
                    <div className="font-bold text-sm text-green-600 cursor-help" title={numberToWords(totalAmount)}>
                      {formatShortAmount(totalAmount)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <div className="text-[10px] text-gray-600 mb-0.5">Bids/Offers</div>
                    <div className="font-bold text-sm text-blue-600">
                      {isSell ? (item.bids?.length || 0) : (item.offers?.length || 0)}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {item.status === 'sold' && item.soldPrice && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-800 font-semibold">Final Sale Price:</span>
                      <span className="text-sm font-bold text-amber-900">{formatCurrency(item.soldPrice)}</span>
                    </div>
                  </div>
                )}

                {/* Footer - Dates */}
                <div className="flex items-center justify-between text-[10px] text-dark-500 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>Created: {formatDate(item.createdAt)}</span>
                  </div>
                  <div>
                    Updated: {formatDate(item.updatedAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
