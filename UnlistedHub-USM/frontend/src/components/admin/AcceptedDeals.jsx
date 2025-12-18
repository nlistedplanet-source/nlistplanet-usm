import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, XCircle, Clock, Phone, Mail, User, Building2, 
  TrendingUp, Package, DollarSign, Calendar, Eye, Loader, 
  AlertCircle, X, Sparkles, Key, ShieldCheck
} from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AcceptedDeals = ({ defaultFilter = '' }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState(defaultFilter);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [newStatus, setNewStatus] = useState('completed');
  const [statusRemark, setStatusRemark] = useState('');

  useEffect(() => {
    fetchDeals();
  }, [filterStatus]);

  // Lock body scroll when any modal is open to prevent background scroll/jumps
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (showDetailsModal || showCloseModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showDetailsModal, showCloseModal]);

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
        statusRemark,
        newStatus
      );
      
      const statusMessages = {
        completed: 'Deal marked as completed',
        cancelled: 'Deal marked as cancelled',
        on_hold: 'Deal put on hold'
      };
      toast.success(statusMessages[newStatus] || 'Deal updated successfully');
      
      setShowCloseModal(false);
      setStatusRemark('');
      setNewStatus('completed');
      setSelectedDeal(null);
      fetchDeals();
    } catch (error) {
      console.error('Failed to update deal:', error);
      toast.error('Failed to update deal status');
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

    const modalRef = useRef(null);

    // Calculate correct prices based on listing type
    // SELL listing: Seller gets their asking price, Buyer pays +2%
    // BUY listing: Buyer pays their budget, Seller gets -2%
    let buyerPays, sellerReceives, platformFee;
    
    if (selectedDeal.type === 'sell') {
      // Sell listing: seller gets agreedPrice, buyer pays extra 2%
      sellerReceives = selectedDeal.agreedPrice;
      buyerPays = selectedDeal.agreedPrice * 1.02;
      platformFee = selectedDeal.agreedPrice * 0.02;
    } else {
      // Buy listing: buyer pays agreedPrice, seller gets 2% less
      buyerPays = selectedDeal.agreedPrice;
      sellerReceives = selectedDeal.agreedPrice * 0.98;
      platformFee = selectedDeal.agreedPrice * 0.02;
    }

    const closeModal = () => {
      setShowDetailsModal(false);
      setSelectedDeal(null);
    };

    const handleClose = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeModal();
    };

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    };

    // Focus modal and handle escape key
    useEffect(() => {
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      };

      window.addEventListener('keydown', handleEsc);
      const el = modalRef.current;
      if (el) {
        el.focus({ preventScroll: true });
      }

      return () => {
        window.removeEventListener('keydown', handleEsc);
      };
    }, []);

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto focus:outline-none"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10 pointer-events-auto">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Deal Details</h2>
                <p className="text-sm text-purple-100">{selectedDeal.company}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              onMouseDown={handleClose}
              aria-label="Close"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer pointer-events-auto"
            >
              <X size={20} onClick={handleClose} className="pointer-events-none" />
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
                  <span className="text-sm text-gray-600">Buyer Pays (per share)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(buyerPays)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Seller Receives (per share)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(sellerReceives)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-purple-200">
                  <span className="text-sm font-bold text-purple-600">Platform Fee (per share)</span>
                  <span className="font-bold text-purple-600">{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-purple-300 bg-purple-100 -mx-4 px-4 py-2 rounded-b-lg mt-2">
                  <span className="text-sm font-bold text-purple-800">Total Platform Earnings</span>
                  <span className="font-bold text-purple-800">{formatCurrency(platformFee * selectedDeal.quantity)}</span>
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
                  <Phone size={14} className="text-green-600" />
                  <span className="text-sm text-gray-600">Mobile:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedDeal.buyer.phoneNumber || selectedDeal.buyer.phone || 'Not provided'}
                  </span>
                  {(selectedDeal.buyer.phoneNumber || selectedDeal.buyer.phone) && (
                    <a 
                      href={`tel:${selectedDeal.buyer.phoneNumber || selectedDeal.buyer.phone}`}
                      className="text-green-600 hover:text-green-700 text-xs underline"
                    >
                      Call
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-900">{selectedDeal.buyer.email}</span>
                </div>
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
                  <Phone size={14} className="text-blue-600" />
                  <span className="text-sm text-gray-600">Mobile:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedDeal.seller.phoneNumber || selectedDeal.seller.phone || 'Not provided'}
                  </span>
                  {(selectedDeal.seller.phoneNumber || selectedDeal.seller.phone) && (
                    <a 
                      href={`tel:${selectedDeal.seller.phoneNumber || selectedDeal.seller.phone}`}
                      className="text-blue-600 hover:text-blue-700 text-xs underline"
                    >
                      Call
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-900">{selectedDeal.seller.email}</span>
                </div>
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

            {/* Verification Codes Section */}
            {selectedDeal.verificationCodes && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-amber-600" />
                  Two-Way Verification Codes
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                    <p className="text-xs text-gray-500 mb-1">Buyer Code</p>
                    <p className="text-lg font-bold text-green-600 font-mono tracking-wider">
                      {selectedDeal.verificationCodes.buyerCode || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                    <p className="text-xs text-gray-500 mb-1">Seller Code</p>
                    <p className="text-lg font-bold text-blue-600 font-mono tracking-wider">
                      {selectedDeal.verificationCodes.sellerCode || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                    <p className="text-xs text-gray-500 mb-1">RM Code</p>
                    <p className="text-lg font-bold text-purple-600 font-mono tracking-wider">
                      {selectedDeal.verificationCodes.rmCode || 'N/A'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-amber-700 mt-3 text-center">
                  ⚠️ These codes are used for two-way verification between buyer and seller
                </p>
              </div>
            )}

            {/* Action Buttons - Status Change */}
            {selectedDeal.status === 'confirmed' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle size={18} className="text-gray-600" />
                  Change Deal Status
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Mark Completed clicked');
                      setNewStatus('completed');
                      setShowDetailsModal(false);
                      setShowCloseModal(true);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={18} className="pointer-events-none" />
                    <span className="pointer-events-none">Mark Completed</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Mark Cancelled clicked');
                      setNewStatus('cancelled');
                      setShowDetailsModal(false);
                      setShowCloseModal(true);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle size={18} className="pointer-events-none" />
                    <span className="pointer-events-none">Mark Cancelled</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Put On Hold clicked');
                    setNewStatus('on_hold');
                    setShowDetailsModal(false);
                    setShowCloseModal(true);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock size={18} className="pointer-events-none" />
                  <span className="pointer-events-none">Put On Hold</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CloseDealModal = () => {
    const getStatusInfo = () => {
      switch (newStatus) {
        case 'completed':
          return {
            title: 'Mark Deal as Completed',
            description: 'This will mark the deal as successfully completed. Both parties have received their assets.',
            icon: CheckCircle,
            iconColor: 'text-green-600',
            buttonColor: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
            buttonText: 'Mark Completed'
          };
        case 'cancelled':
          return {
            title: 'Mark Deal as Cancelled',
            description: 'This will mark the deal as cancelled. Please provide a reason for cancellation.',
            icon: XCircle,
            iconColor: 'text-red-600',
            buttonColor: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
            buttonText: 'Mark Cancelled'
          };
        case 'on_hold':
          return {
            title: 'Put Deal On Hold',
            description: 'This will put the deal on hold. Please provide a reason.',
            icon: Clock,
            iconColor: 'text-yellow-600',
            buttonColor: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
            buttonText: 'Put On Hold'
          };
        default:
          return {
            title: 'Update Deal Status',
            description: 'Update the deal status.',
            icon: AlertCircle,
            iconColor: 'text-gray-600',
            buttonColor: 'from-gray-500 to-gray-600',
            buttonText: 'Update'
          };
      }
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowCloseModal(false);
            setStatusRemark('');
            setNewStatus('completed');
          }
        }}
      >
        <div 
          className="bg-white rounded-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <StatusIcon className={`w-6 h-6 ${statusInfo.iconColor}`} />
            <h2 className="text-xl font-bold text-gray-900">{statusInfo.title}</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            {statusInfo.description}
          </p>

          {/* Deal Summary */}
          {selectedDeal && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold text-gray-900">{selectedDeal.company}</p>
              <p className="text-gray-600">{selectedDeal.quantity.toLocaleString('en-IN')} shares @ {formatCurrency(selectedDeal.agreedPrice)}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remark / Notes {newStatus !== 'completed' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={statusRemark}
              onChange={(e) => setStatusRemark(e.target.value)}
              placeholder={
                newStatus === 'completed' 
                  ? "Add any notes about this deal (optional)..." 
                  : "Please provide reason for this action..."
              }
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="3"
              required={newStatus !== 'completed'}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel clicked');
                setShowCloseModal(false);
                setStatusRemark('');
                setNewStatus('completed');
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={processing}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span className="pointer-events-none">Cancel</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mark Completed button clicked');
                handleCloseDeal();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={processing || (newStatus !== 'completed' && !statusRemark.trim())}
              className={`flex-1 px-4 py-2 bg-gradient-to-r ${statusInfo.buttonColor} text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer`}
            >
              {processing ? (
                <>
                  <Loader className="animate-spin pointer-events-none" size={16} />
                  <span className="pointer-events-none">Processing...</span>
                </>
              ) : (
                <span className="pointer-events-none">{statusInfo.buttonText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{deal.companySymbol}</p>
                            {deal.postId && (
                              <span className="text-[9px] font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                {deal.postId}
                              </span>
                            )}
                          </div>
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
