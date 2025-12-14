import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Phone, Mail, User, Building2, 
  TrendingUp, Package, DollarSign, Calendar, Eye, Loader, 
  AlertCircle, X, Sparkles
} from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AcceptedDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, [filterStatus]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      
      const response = await adminAPI.getAcceptedDeals(params);
      setDeals(response.data.data.deals);
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Failed to fetch accepted deals:', error);
      toast.error('Failed to load accepted deals');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeal = async () => {
    if (!selectedDeal) return;

    try {
      setProcessing(true);
      await adminAPI.closeDeal(
        selectedDeal.dealId,
        selectedDeal.listingId,
        selectedDeal.bidId || selectedDeal.offerId,
        closingNotes
      );
      toast.success('Deal closed successfully');
      setShowCloseModal(false);
      setClosingNotes('');
      setSelectedDeal(null);
      fetchDeals();
    } catch (error) {
      console.error('Failed to close deal:', error);
      toast.error('Failed to close deal');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'accepted': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Accepted' },
      'pending_seller_confirmation': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'Pending Seller' },
      'pending_buyer_confirmation': { bg: 'bg-orange-100', text: 'text-orange-800', icon: Clock, label: 'Pending Buyer' },
      'confirmed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Confirmed' }
    };
    
    const badge = badges[status] || badges.accepted;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const DealDetailsModal = () => {
    if (!selectedDeal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Deal Details</h2>
                <p className="text-sm text-purple-100">{selectedDeal.company}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              {getStatusBadge(selectedDeal.status)}
            </div>

            {/* Company & Deal Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600 mb-1">Company</p>
                <div className="flex items-center gap-2">
                  {selectedDeal.companyLogo && (
                    <img src={selectedDeal.companyLogo} alt="" className="w-8 h-8 rounded object-cover" />
                  )}
                  <p className="font-semibold text-gray-900">{selectedDeal.companySymbol}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="font-semibold text-gray-900 capitalize">{selectedDeal.type} Listing</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Quantity</p>
                <p className="font-semibold text-gray-900">{selectedDeal.quantity.toLocaleString('en-IN')} shares</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Agreed Price</p>
                <p className="font-semibold text-green-600">{formatCurrency(selectedDeal.agreedPrice)}</p>
              </div>
            </div>

            {/* Platform Fee Breakdown */}
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign size={18} className="text-purple-600" />
                Platform Fee Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Buyer Pays</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(selectedDeal.buyerOfferedPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Seller Receives</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(selectedDeal.sellerReceivesPrice)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-purple-200">
                  <span className="text-sm font-bold text-purple-600">Platform Fee (2%)</span>
                  <span className="font-bold text-purple-600">{formatCurrency(selectedDeal.platformFee)}</span>
                </div>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User size={18} className="text-green-600" />
                Buyer Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Username:</span>
                  <span className="font-semibold text-gray-900">@{selectedDeal.buyer.username}</span>
                </div>
                {selectedDeal.buyer.fullName && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Full Name:</span>
                    <span className="font-semibold text-gray-900">{selectedDeal.buyer.fullName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-900">{selectedDeal.buyer.email}</span>
                </div>
                {selectedDeal.buyer.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-900">{selectedDeal.buyer.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Details */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Seller Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Username:</span>
                  <span className="font-semibold text-gray-900">@{selectedDeal.seller.username}</span>
                </div>
                {selectedDeal.seller.fullName && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Full Name:</span>
                    <span className="font-semibold text-gray-900">{selectedDeal.seller.fullName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-900">{selectedDeal.seller.email}</span>
                </div>
                {selectedDeal.seller.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-900">{selectedDeal.seller.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-gray-600" />
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold text-gray-900">{formatDate(selectedDeal.createdAt)}</span>
                </div>
                {selectedDeal.buyerAcceptedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buyer Accepted</span>
                    <span className="font-semibold text-gray-900">{formatDate(selectedDeal.buyerAcceptedAt)}</span>
                  </div>
                )}
                {selectedDeal.sellerAcceptedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller Accepted</span>
                    <span className="font-semibold text-gray-900">{formatDate(selectedDeal.sellerAcceptedAt)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-semibold text-gray-900">{formatDate(selectedDeal.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedDeal.status === 'confirmed' && (
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowCloseModal(true);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all"
              >
                Close Deal
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CloseDealModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900">Close Deal</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Are you sure you want to close this deal? This action marks the deal as completed.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Notes (Optional)
          </label>
          <textarea
            value={closingNotes}
            onChange={(e) => setClosingNotes(e.target.value)}
            placeholder="Add any notes about this deal closure..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows="3"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowCloseModal(false);
              setClosingNotes('');
            }}
            disabled={processing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCloseDeal}
            disabled={processing}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader className="animate-spin" size={16} />
                Closing...
              </>
            ) : (
              'Close Deal'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <Sparkles size={24} />
              <span className="text-3xl font-bold">{stats.total}</span>
            </div>
            <p className="text-purple-100 font-medium">Total Deals</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <Clock size={24} />
              <span className="text-3xl font-bold">{stats.accepted}</span>
            </div>
            <p className="text-yellow-100 font-medium">Accepted</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle size={24} />
              <span className="text-3xl font-bold">{stats.pendingConfirmation}</span>
            </div>
            <p className="text-blue-100 font-medium">Pending</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle size={24} />
              <span className="text-3xl font-bold">{stats.confirmed}</span>
            </div>
            <p className="text-green-100 font-medium">Confirmed</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { value: '', label: 'All Deals' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'pending_seller_confirmation', label: 'Pending Seller' },
            { value: 'pending_buyer_confirmation', label: 'Pending Buyer' },
            { value: 'confirmed', label: 'Confirmed' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                filterStatus === tab.value
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {deals.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No accepted deals found</p>
            <p className="text-sm text-gray-500 mt-1">Deals will appear here when users accept bids or offers</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Platform Fee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deals.map((deal) => (
                  <tr key={deal._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {deal.companyLogo && (
                          <img src={deal.companyLogo} alt="" className="w-8 h-8 rounded object-cover" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{deal.companySymbol}</p>
                          <p className="text-xs text-gray-500">{deal.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        deal.type === 'sell' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {deal.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{deal.quantity.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-green-600">{formatCurrency(deal.agreedPrice)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-purple-600">{formatCurrency(deal.platformFee)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">@{deal.buyer.username}</p>
                      <p className="text-xs text-gray-500">{deal.buyer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">@{deal.seller.username}</p>
                      <p className="text-xs text-gray-500">{deal.seller.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(deal.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{formatDate(deal.updatedAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedDeal(deal);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} className="text-purple-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailsModal && <DealDetailsModal />}
      {showCloseModal && <CloseDealModal />}
    </div>
  );
};

export default AcceptedDeals;
