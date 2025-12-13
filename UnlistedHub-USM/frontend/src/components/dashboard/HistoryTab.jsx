import React, { useState, useEffect } from 'react';
import { Loader, Archive, CheckCircle, XCircle, Trash2, Filter, Calendar, TrendingUp, TrendingDown, ShieldCheck, Eye } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, formatShortQuantity, formatShortAmount, numberToWords } from '../../utils/helpers';
import toast from 'react-hot-toast';
import VerificationCodesModal from '../VerificationCodesModal';

const HistoryTab = () => {
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState([]);
  const [completedDeals, setCompletedDeals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'sold', 'cancelled', 'expired'
  const [activeView, setActiveView] = useState('transactions'); // 'transactions', 'listings'
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showCodesModal, setShowCodesModal] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch completed deals (Transactions)
      try {
        const dealsResponse = await listingsAPI.getCompletedDeals();
        setCompletedDeals(dealsResponse.data.data || []);
      } catch (e) {
        console.error('Failed to fetch deals:', e);
      }

      // Fetch inactive listings (sold, cancelled, expired)
      try {
        const response = await listingsAPI.getMy({ status: 'inactive' });
        setHistoryItems(response.data.data || []);
      } catch (e) {
        console.error('Failed to fetch listings:', e);
      }

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-dark-900">History & Transactions</h2>
          <p className="text-xs text-dark-500 mt-1">Your past listings and completed deals</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setActiveView('transactions')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeView === 'transactions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed Deals ({completedDeals.length})
        </button>
        <button
          onClick={() => setActiveView('listings')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeView === 'listings'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past Listings ({historyItems.length})
        </button>
      </div>

      {/* Transactions View */}
      {activeView === 'transactions' && (
        <div className="space-y-4">
          {completedDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <ShieldCheck className="text-gray-300 mb-3" size={48} />
              <p className="text-gray-600 font-medium mb-1">No completed deals yet</p>
              <p className="text-gray-500 text-xs">Your confirmed transactions will appear here</p>
            </div>
          ) : (
            completedDeals.map((deal) => (
              <div key={deal._id} className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{deal.companyName}</h3>
                      <p className="text-xs text-gray-500">
                        {deal.userRole === 'buyer' ? 'Bought from' : 'Sold to'} @{deal.userRole === 'buyer' ? deal.sellerUsername : deal.buyerUsername}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(deal.totalAmount)}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      CONFIRMED
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Price/Share</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(deal.agreedPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Quantity</p>
                      <p className="font-semibold text-gray-900">{deal.quantity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(deal.createdAt)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDeal(deal);
                      setShowCodesModal(true);
                    }}
                    className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View Verification Codes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Listings View */}
      {activeView === 'listings' && (
        <>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl overflow-x-auto w-fit">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('sold')}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                filterStatus === 'sold'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sold
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                filterStatus === 'cancelled'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cancelled
            </button>
            <button
              onClick={() => setFilterStatus('expired')}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                filterStatus === 'expired'
                  ? 'bg-white text-gray-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
        </>
      )}

      {/* Verification Codes Modal */}
      {showCodesModal && selectedDeal && (
        <VerificationCodesModal
          deal={selectedDeal}
          onClose={() => {
            setShowCodesModal(false);
            setSelectedDeal(null);
          }}
        />
      )}
    </div>
  );
};

export default HistoryTab;
