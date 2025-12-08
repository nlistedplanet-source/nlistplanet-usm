import React, { useState, useRef } from 'react';
import { Share2, Zap, Edit, Trash2, CheckCircle, XCircle, MessageSquare, Loader, Eye, Info, ChevronDown, ChevronUp, DollarSign, Ban } from 'lucide-react';
import { formatCurrency, formatDate, formatNumber, numberToWords, formatShortAmount, formatShortQuantity } from '../../utils/helpers';
import * as htmlToImage from 'html-to-image';
import { listingsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const MyPostCard = ({ listing, onShare, onBoost, onDelete, onRefresh }) => {
  const [actionLoading, setActionLoading] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [bidsExpanded, setBidsExpanded] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyPrice, setModifyPrice] = useState('');
  const [modifyQuantity, setModifyQuantity] = useState('');
  const [modifyMinQuantity, setModifyMinQuantity] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [soldPrice, setSoldPrice] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const shareDomRef = useRef(null);

  const isSell = listing.type === 'sell';
  const bidsArray = (isSell ? listing.bids : listing.offers) || [];
  const pendingBids = bidsArray.filter(b => b.status === 'pending' || b.status === 'countered');
  const acceptedBids = bidsArray.filter(b => b.status === 'accepted');
  const activeBidsCount = pendingBids.length;
  
  // Use seller's desired price (what they entered) for display
  const sellerPrice = isSell ? (listing.sellerDesiredPrice || listing.price) : (listing.buyerMaxPrice || listing.price);
  const totalAmount = sellerPrice * listing.quantity;
  
  // Define at component level for use in share DOM node
  const script = listing.companyId?.ScriptName || listing.companyName || 'Company';
  const price = formatCurrency(sellerPrice);
  const qty = formatShortQuantity(listing.quantity || 0);

  const handleAccept = async (bid) => {
    try {
      setActionLoading(bid._id);
      await listingsAPI.acceptBid(listing._id, bid._id);
      toast.success('Bid accepted successfully! 🎉');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept bid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bid) => {
    try {
      setActionLoading(bid._id);
      await listingsAPI.rejectBid(listing._id, bid._id);
      toast.success('Bid rejected');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject bid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounterClick = (bid) => {
    setSelectedBid(bid);
    setCounterPrice(bid.price.toString());
    setCounterQuantity(bid.quantity.toString());
    setShowCounterModal(true);
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(selectedBid._id);
      await listingsAPI.counterBid(listing._id, selectedBid._id, {
        price: parseFloat(counterPrice),
        quantity: parseInt(counterQuantity)
      });
      toast.success('Counter offer sent successfully! 💬');
      setShowCounterModal(false);
      setSelectedBid(null);
      setCounterPrice('');
      setCounterQuantity('');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setActionLoading('delete');
      await listingsAPI.delete(listing._id);
      toast.success('Listing deleted successfully! 🗑️');
      setShowDeleteModal(false);
      // Immediately remove card from UI
      if (onDelete) onDelete(listing._id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 404) {
        toast.error('Listing not found or already deleted');
        // Still remove from UI if 404 (already deleted)
        setShowDeleteModal(false);
        if (onDelete) onDelete(listing._id);
        if (onRefresh) onRefresh();
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete listing');
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Mark as Sold (externally sold)
  const handleSoldClick = () => {
    setSoldPrice(sellerPrice.toString());
    setShowSoldModal(true);
  };

  const handleSoldConfirm = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('sold');
      await listingsAPI.markAsSold(listing._id, { soldPrice: parseFloat(soldPrice) });
      toast.success('Listing marked as sold! 💰');
      setShowSoldModal(false);
      setSoldPrice('');
      if (onDelete) onDelete(listing._id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Mark sold error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as sold');
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel listing (don't want to sell/buy anymore)
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('cancel');
      await listingsAPI.cancel(listing._id, { reason: cancelReason });
      toast.success('Listing cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      if (onDelete) onDelete(listing._id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel listing');
    } finally {
      setActionLoading(null);
    }
  };

  const handleModify = () => {
    setModifyPrice(sellerPrice.toString());
    setModifyQuantity(listing.quantity.toString());
    setModifyMinQuantity(listing.minQuantity?.toString() || '1');
    setShowModifyModal(true);
  };

  const handleModifySubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('modify');
      const updateData = {
        price: parseFloat(modifyPrice),
        quantity: parseInt(modifyQuantity),
        minQuantity: parseInt(modifyMinQuantity)
      };
      await listingsAPI.update(listing._id, updateData);
      toast.success('Listing updated successfully! 🎉');
      setShowModifyModal(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Modify error:', error);
      toast.error(error.response?.data?.message || 'Failed to update listing. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = async () => {
    // Main site referral link for tracking
    const referralLink = `https://nlistplanet.com/listing/${listing._id}?ref=${listing.user?._id || 'guest'}&source=share`;
    
    // Get company sector
    const sector = listing.companyId?.Sector || listing.companyId?.sector || 'Unlisted Share';
    const highlights = [
      `Sector: ${sector}`,
      'Pre-IPO Investment Opportunity',
      'Verified on NlistPlanet'
    ];
    
    // Professional Share Caption
    const caption = `━━━━━━━━━━━━━━━━━━━━━
   📈 N L I S T P L A N E T
      Trade Unlisted Shares
━━━━━━━━━━━━━━━━━━━━━

🏷️ *UNLISTED SHARE*

═══════════════════════════

        ${isSell ? '🟢 *SELLING*' : '🔵 *BUYING*'}

━━━━━━━━━━━━━━━━━━━━━

🏢 *${script}*
    ${sector}

${highlights.map(h => `✦ ${h}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━
  💰 PRICE       ${price}/share
  📦 QUANTITY    ${qty} shares
━━━━━━━━━━━━━━━━━━━━━

👉 *View & Trade:* ${referralLink}

═══════════════════════════

⚠️ *IMPORTANT DISCLAIMER*

• Unlisted shares are NOT traded on NSE/BSE
• HIGH RISK investment - Do your research
• NlistPlanet is a marketplace, not an advisor

━━━━━━━━━━━━━━━━━━━━━
🔒 Verified • Secure • Trusted
━━━━━━━━━━━━━━━━━━━━━`;

    try {
      // First: Try html-to-image DOM capture (pixel-perfect)
      if (shareDomRef.current && htmlToImage?.toBlob) {
        try {
          const blob = await htmlToImage.toBlob(shareDomRef.current, { cacheBust: true });
          if (blob) {
            const file = new File([blob], `${script.replace(/\s+/g,'_')}_share.png`, { type: 'image/png' });
            // Try native share with file + caption
            if (navigator.canShare?.({ files: [file] })) {
              try {
                await navigator.share({ files: [file], title: `${script} on NlistPlanet`, text: caption });
                toast.success('Shared successfully! 🎉');
                return;
              } catch (e) {
                console.warn('navigator.share(files) failed:', e);
              }
            }
            // Fallback: copy caption + download image
            await navigator.clipboard.writeText(caption);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${script.replace(/\s+/g,'_')}_share.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Caption copied & image downloaded! Paste caption + attach image on WhatsApp.');
            return;
          }
        } catch (e) {
          console.warn('html-to-image failed, trying native share:', e);
        }
      }

      // Native share with text + referral link
      if (navigator.share) {
        try {
          await navigator.share({ title: `${script} on NlistPlanet`, text: caption, url: referralLink });
          toast.success('Shared successfully! 🎉');
          return;
        } catch (e) {
          if (e.name === 'AbortError') return;
          console.warn('navigator.share(text) failed:', e);
        }
      }

      // Fallback: Open WhatsApp directly
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;
      window.open(whatsappUrl, '_blank');
      toast.success('Opening WhatsApp... 📱');
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Unable to share. Please try again.');
    }
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/listing/${listing._id}?ref=${listing.user?._id || 'guest'}&source=share`;
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard! 📋');
  };

  // Sorted bids - only pending/countered for active bids section
  const sortedBids = [...pendingBids].sort((a, b) => {
    if (sortBy === 'highest') return b.price - a.price;
    if (sortBy === 'lowest') return a.price - b.price;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <>
      <div className="bg-white rounded-md shadow-sm hover:shadow transition-all border border-gray-300 overflow-hidden mb-3">
        {/* Header - Status Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              listing.status === 'active' ? 'bg-green-100 text-green-700 border-2 border-green-400' :
              'bg-gray-100 text-gray-700 border-2 border-gray-400'
            }`}>
              🟢 {listing.status?.toUpperCase() || 'ACTIVE'}
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold border-2 ${
              isSell ? 'bg-red-50 text-red-700 border-red-400' : 'bg-green-50 text-green-700 border-green-400'
            }`}>
              {isSell ? 'SELL' : 'BUY'} Post
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1">
              <span className="text-gray-500">{isSell ? 'Bids' : 'Offers'} Received</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full ml-1">{activeBidsCount}</span>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="font-bold text-gray-900">{listing.views || 0}</span>
            </span>
          </div>
        </div>

        {/* Company Info */}
        <div className="px-3 py-2 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {listing.companyId?.Logo || listing.companyId?.logo ? (
              <img 
                src={listing.companyId.Logo || listing.companyId.logo} 
                alt={listing.companyId?.ScriptName || listing.companyName}
                className="w-10 h-10 rounded-md object-cover border border-purple-300 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm border border-purple-300">
                {(listing.companyId?.ScriptName || listing.companyName)?.charAt(0) || 'C'}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {listing.companyId?.ScriptName || listing.companyName || 'Unknown'}
                </h3>
                <div className="group relative">
                  <Info size={16} className="text-blue-500 cursor-help" />
                  <div className="absolute left-0 top-6 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-2xl z-50">
                    <p className="font-bold text-sm mb-2">{listing.companyName || 'Company Details'}</p>
                    <div className="space-y-1.5">
                      <p><span className="text-gray-400">Sector:</span> {listing.companyId?.Sector || listing.companyId?.sector || 'N/A'}</p>
                      <p><span className="text-gray-400">ISIN:</span> {listing.companyId?.ISIN || 'N/A'}</p>
                      <p><span className="text-gray-400">PAN:</span> {listing.companyId?.PAN || 'N/A'}</p>
                      <p><span className="text-gray-400">CIN:</span> {listing.companyId?.CIN || 'N/A'}</p>
                      {listing.companyId?.EPS && <p><span className="text-gray-400">EPS:</span> ₹{listing.companyId.EPS}</p>}
                      {listing.companyId?.PERatio && <p><span className="text-gray-400">PE Ratio:</span> {listing.companyId.PERatio}</p>}
                      {listing.companyId?.MarketCap && <p><span className="text-gray-400">Market Cap:</span> {listing.companyId.MarketCap}</p>}
                      {listing.companyId?.RegistrationDate && <p><span className="text-gray-400">Registration:</span> {listing.companyId.RegistrationDate}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5">{listing.companyId?.Sector || listing.companyId?.sector || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Price Table */}
        <div className="px-3 py-2 border-b border-gray-200">
          <table className="w-full border-2 border-gray-400">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-gray-400 px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase">Final Price</th>
                <th className="border-2 border-gray-400 px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase">Quantity</th>
                <th className="border-2 border-gray-400 px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase">Min Lot</th>
                <th className="border-2 border-gray-400 px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="border-2 border-gray-400 px-2 py-2 text-center">
                  <div className="text-sm font-bold text-gray-900 cursor-help" title={numberToWords(sellerPrice)}>
                    {formatCurrency(sellerPrice)}
                  </div>
                </td>
                <td className="border-2 border-gray-400 px-2 py-2 text-center">
                  <div className="text-sm font-bold text-gray-900 cursor-help" title={`${listing.quantity?.toLocaleString('en-IN')} shares`}>
                    {formatShortQuantity(listing.quantity || 0)}
                  </div>
                </td>
                <td className="border-2 border-gray-400 px-2 py-2 text-center">
                  <div className="text-sm font-bold text-gray-900 cursor-help" title={`${(listing.minQuantity || 1).toLocaleString('en-IN')} shares`}>
                    {formatShortQuantity(listing.minQuantity || 1)}
                  </div>
                </td>
                <td className="border-2 border-gray-400 px-2 py-2 text-center">
                  <div className="text-sm font-bold text-green-600 cursor-help" title={numberToWords(totalAmount)}>
                    {formatShortAmount(totalAmount)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="px-3 py-1 border-b border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
          <button onClick={handleShare} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button onClick={() => onBoost && onBoost(listing._id)} className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm">
            <Zap className="w-3.5 h-3.5" /> Boost
          </button>
          <button onClick={handleModify} disabled={actionLoading === 'modify'} className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm disabled:opacity-50">
            <Edit className="w-3.5 h-3.5" /> Modify
          </button>
          {/* Sold button - mark as externally sold */}
          <button onClick={handleSoldClick} disabled={actionLoading === 'sold'} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm disabled:opacity-50">
            <DollarSign className="w-3.5 h-3.5" /> Sold
          </button>
          {/* Cancel button - only show if no pending bids */}
          {activeBidsCount === 0 ? (
            <button onClick={handleCancelClick} disabled={actionLoading === 'cancel'} className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm disabled:opacity-50">
              <Ban className="w-3.5 h-3.5" /> Cancel
            </button>
          ) : null}
          <button onClick={handleDeleteClick} disabled={actionLoading === 'delete'} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>

        {/* Bids Table - Collapsible */}
        {pendingBids.length > 0 && (
          <div className="px-3 py-2">
            <button 
              onClick={() => setBidsExpanded(!bidsExpanded)}
              className="w-full bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-2 rounded-md border border-gray-400 flex items-center justify-between hover:from-blue-200 hover:to-purple-200 transition-colors"
            >
              <h4 className="font-bold text-gray-900 text-[11px]">Bids ({activeBidsCount})</h4>
              {bidsExpanded ? <ChevronUp className="w-4 h-4 text-gray-700" /> : <ChevronDown className="w-4 h-4 text-gray-700" />}
            </button>
            
            {bidsExpanded && (
              <div className="border-2 border-gray-400 border-t-0 rounded-b-lg overflow-hidden shadow-lg mt-0">
                <div className="bg-gray-50 px-3 py-1 border-b border-gray-300 flex justify-end">
                    <select className="text-[11px] border border-gray-400 rounded px-2 py-1 bg-white font-semibold" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="latest">Sort: Latest</option>
                    <option value="highest">Sort: Highest Price</option>
                    <option value="lowest">Sort: Lowest Price</option>
                  </select>
                </div>
                <table className="w-full bg-white">
                  <thead className="bg-gray-100 border-b-2 border-gray-400">
                    <tr>
                        <th className="px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase border-r-2 border-gray-300">#</th>
                        <th className="px-2 py-1 text-left text-[11px] font-bold text-gray-700 uppercase border-r-2 border-gray-300">{isSell ? 'Buyer' : 'Seller'}</th>
                        <th className="px-2 py-1 text-left text-[11px] font-bold text-gray-700 uppercase border-r-2 border-gray-300">Price</th>
                        <th className="px-2 py-1 text-left text-[11px] font-bold text-gray-700 uppercase border-r-2 border-gray-300">Qty</th>
                        <th className="px-2 py-1 text-left text-[11px] font-bold text-gray-700 uppercase border-r-2 border-gray-300">Total</th>
                        <th className="px-2 py-1 text-left text-[11px] font-bold text-gray-700 uppercase border-r-2 border-gray-300">Status</th>
                        <th className="px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-300">
                    {sortedBids.map((bid, index) => {
                      // Show the actual bid price (what buyer is paying)
                      const displayPrice = bid.originalPrice || bid.price;
                      const bidTotal = displayPrice * bid.quantity;
                      return (
                        <tr key={bid._id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-2 py-1 text-[11px] font-bold text-gray-900 border-r-2 border-gray-200 text-center">{index + 1}</td>
                            <td className="px-2 py-1 text-[11px] border-r-2 border-gray-200">
                              <div className="font-bold text-blue-700 text-[11px]">@{bid.user?.username || bid.username || 'trader_' + (index + 1)}</div>
                              <div className="text-[10px] text-gray-600 mt-0.5">⭐ {bid.user?.rating?.toFixed(1) || '4.5'}</div>
                            </td>
                            <td className="px-2 py-1 text-[11px] font-bold text-gray-900 border-r-2 border-gray-200 cursor-help" title={numberToWords(displayPrice)}>{formatCurrency(displayPrice)}</td>
                            <td className="px-2 py-1 text-[11px] font-bold text-gray-900 border-r-2 border-gray-200 cursor-help" title={`${bid.quantity?.toLocaleString('en-IN')} shares`}>{formatShortQuantity(bid.quantity || 0)}</td>
                            <td className="px-2 py-1 text-[11px] border-r-2 border-gray-200">
                              <div className="font-bold text-green-600 cursor-help text-[11px]" title={numberToWords(bidTotal)}>{formatShortAmount(bidTotal)}</div>
                            </td>
                            <td className="px-2 py-1 text-[11px] border-r-2 border-gray-200">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border-2 ${
                              bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-400' :
                              bid.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-400' :
                              bid.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-400' :
                              bid.status === 'countered' ? 'bg-blue-100 text-blue-800 border-blue-400' :
                              'bg-gray-100 text-gray-800 border-gray-400'
                            }`}>{bid.status || 'Pending'}</span>
                          </td>
                            <td className="px-2 py-1 text-[11px]">
                            {(bid.status === 'pending' || bid.status === 'countered') && (
                              <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleAccept(bid)} disabled={actionLoading === bid._id} className="flex flex-col items-center p-1 hover:bg-green-100 rounded-md transition-colors border border-green-300 bg-green-50">
                                    <span className="text-base">✅</span>
                                    <span className="text-[11px] font-bold text-green-700 mt-0.5">Accept</span>
                                  </button>
                                  <button onClick={() => handleReject(bid)} disabled={actionLoading === bid._id} className="flex flex-col items-center p-1 hover:bg-red-100 rounded-md transition-colors border border-red-300 bg-red-50">
                                    <span className="text-base">❌</span>
                                    <span className="text-[11px] font-bold text-red-700 mt-0.5">Reject</span>
                                  </button>
                                  <button onClick={() => handleCounterClick(bid)} disabled={actionLoading === bid._id} className="flex flex-col items-center p-1 hover:bg-blue-100 rounded-md transition-colors border border-blue-300 bg-blue-50">
                                    <span className="text-base">💬</span>
                                    <span className="text-[11px] font-bold text-blue-700 mt-0.5">Counter</span>
                                  </button>
                              </div>
                            )}
                            {bid.status === 'accepted' && <div className="text-center font-bold text-green-700">✅ Done</div>}
                            {bid.status === 'rejected' && <div className="text-center font-bold text-red-700">❌ Rejected</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Accepted Bids Section */}
        {acceptedBids.length > 0 && (
          <div className="px-3 py-2">
            <button 
              onClick={() => setBidsExpanded(!bidsExpanded)}
              className="w-full bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-2 rounded-md border-2 border-green-400 flex items-center justify-between hover:from-green-200 hover:to-emerald-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✅</span>
                <h4 className="font-bold text-green-800 text-[11px]">Accepted ({acceptedBids.length})</h4>
              </div>
              {bidsExpanded ? <ChevronUp className="w-4 h-4 text-green-700" /> : <ChevronDown className="w-4 h-4 text-green-700" />}
            </button>
            
            {bidsExpanded && (
              <div className="border-2 border-green-400 border-t-0 rounded-b-lg overflow-hidden shadow-lg mt-0">
                <table className="w-full bg-white">
                  <thead className="bg-green-50 border-b-2 border-green-400">
                    <tr>
                      <th className="px-2 py-1 text-center text-[11px] font-bold text-green-800 uppercase border-r border-green-300 w-8">#</th>
                      <th className="px-2 py-1 text-left text-[11px] font-bold text-green-800 uppercase border-r border-green-300">{isSell ? 'Buyer' : 'Seller'}</th>
                      <th className="px-2 py-1 text-left text-[11px] font-bold text-green-800 uppercase border-r border-green-300">Price</th>
                      <th className="px-2 py-1 text-left text-[11px] font-bold text-green-800 uppercase border-r border-green-300">Qty</th>
                      <th className="px-2 py-1 text-left text-[11px] font-bold text-green-800 uppercase border-r border-green-300">Total</th>
                      <th className="px-2 py-1 text-left text-[11px] font-bold text-green-800 uppercase border-r border-green-300">Date</th>
                      <th className="px-2 py-1 text-center text-[11px] font-bold text-green-800 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-200">
                    {acceptedBids.map((bid, index) => {
                      const displayPrice = bid.originalPrice || bid.price;
                      const bidTotal = displayPrice * bid.quantity;
                      return (
                        <tr key={bid._id} className="hover:bg-green-50 transition-colors">
                          <td className="px-2 py-1 text-[11px] font-bold text-gray-900 border-r border-green-200 text-center">{index + 1}</td>
                          <td className="px-2 py-1 text-[11px] border-r border-green-200">
                            <div className="font-bold text-green-700 text-[11px]">@{bid.user?.username || bid.username || 'trader_' + (index + 1)}</div>
                            <div className="text-[10px] text-gray-600 mt-0.5">⭐ {bid.user?.rating?.toFixed(1) || '4.5'}</div>
                          </td>
                          <td className="px-2 py-1 text-[11px] font-bold text-gray-900 border-r border-green-200 cursor-help" title={numberToWords(displayPrice)}>{formatCurrency(displayPrice)}</td>
                          <td className="px-2 py-1 text-[11px] font-bold text-gray-900 border-r border-green-200 cursor-help" title={`${bid.quantity?.toLocaleString('en-IN')} shares`}>{formatShortQuantity(bid.quantity || 0)}</td>
                          <td className="px-2 py-1 text-[11px] border-r border-green-200">
                            <div className="font-bold text-green-600 cursor-help text-[11px]" title={numberToWords(bidTotal)}>{formatShortAmount(bidTotal)}</div>
                          </td>
                          <td className="px-2 py-1 text-[10px] text-gray-500 border-r border-green-200">{formatDate(bid.updatedAt || bid.createdAt)}</td>
                          <td className="px-2 py-1 text-center">
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-bold border border-green-400">
                              ✓ Accepted
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Hidden DOM node for html-to-image capture (offscreen) */}
      <div ref={shareDomRef} style={{ position: 'absolute', left: '-10000px', top: 0, width: 1200, padding: 24, background: 'white' }}>
        <div style={{ borderRadius: 16, border: `8px solid ${isSell ? '#F59E0B' : '#10B981'}`, padding: 24, background: isSell ? '#FFF7ED' : '#F0FFF4', width: 1152 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ color: '#6B7280', fontSize: 16 }}>{formatDate(new Date())}</div>
            <div style={{ color: isSell ? '#B45309' : '#065F46', fontWeight: 700 }}>#UnlistedShare</div>
          </div>
          <h2 style={{ fontSize: 40, margin: '12px 0', color: '#0F172A' }}>{listing.companyId?.ScriptName || listing.companyName || 'Company'}</h2>
          <div style={{ color: '#F97316', marginBottom: 8 }}>{listing.companyId?.Sector || listing.companyId?.sector || 'Sector'}</div>
          <div style={{ color: '#374151', marginBottom: 18 }}>@{listing.user?.username || 'trader'}  ✓ Verified</div>
          <div style={{ borderRadius: 12, padding: 16, background: isSell ? '#FEF3C7' : '#ECFDF5', marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#6B7280', fontSize: 14 }}>Ask Price</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#B91C1C' }}>{price}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#111827', fontSize: 14 }}>Quantity</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{qty}</div>
              </div>
            </div>
          </div>
          <div style={{ color: '#374151', fontSize: 18 }}>Check out this unlisted share of <strong>{listing.companyId?.ScriptName || listing.companyName}</strong> listed on Nlist Planet. Explore more and make your offer now!</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, color: '#6B7280', fontSize: 14 }}>
            <div>nlistplanet.com/share/{listing._id?.slice(-6)}</div>
            <div>{formatDate(new Date())}</div>
          </div>
        </div>
      </div>

      {/* Modify Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowModifyModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border-4 border-purple-400" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold">✏️ Modify Listing</h3>
              <p className="text-sm opacity-90 mt-1">{listing.companyName || script} - {isSell ? 'SELL' : 'BUY'} Post</p>
            </div>
            <form onSubmit={handleModifySubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Ask Price (per share) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={modifyPrice}
                  onChange={(e) => setModifyPrice(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900"
                  placeholder="Enter price per share"
                />
                {modifyPrice && (
                  <p className="text-purple-600 text-sm mt-1 font-medium italic">
                    {numberToWords(parseFloat(modifyPrice))} Rupees Only
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Total Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={modifyQuantity}
                  onChange={(e) => setModifyQuantity(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900"
                  placeholder="Enter total quantity"
                />
                {modifyQuantity && (
                  <p className="text-purple-600 text-sm mt-1 font-medium italic">
                    {numberToWords(parseInt(modifyQuantity))} Shares
                  </p>
                )}
              </div>
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Lot Size *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={modifyMinQuantity}
                  onChange={(e) => setModifyMinQuantity(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900"
                  placeholder="Enter minimum lot size"
                />
                {modifyMinQuantity && (
                  <p className="text-purple-600 text-sm mt-1 font-medium italic">
                    {numberToWords(parseInt(modifyMinQuantity))} Shares Minimum
                  </p>
                )}
              </div>
              {modifyPrice && modifyQuantity && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-5 border-2 border-purple-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-800 font-bold text-lg">New Total Amount:</span>
                    <span className="text-2xl font-bold text-purple-900">{formatCurrency(parseFloat(modifyPrice) * parseInt(modifyQuantity))}</span>
                  </div>
                  <p className="text-purple-700 text-sm font-medium italic text-right">
                    {numberToWords(parseFloat(modifyPrice) * parseInt(modifyQuantity))} Rupees Only
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModifyModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-400 transition-colors border-2 border-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'modify' || !modifyPrice || !modifyQuantity || !modifyMinQuantity}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-purple-700"
                >
                  {actionLoading === 'modify' ? (
                    <><Loader className="animate-spin" size={20} />Updating...</>
                  ) : (
                    <><Edit size={20} />Update Listing</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Delete Listing</h3>
                  <p className="text-red-100 text-sm mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-dark-700 mb-2">
                Are you sure you want to delete this listing?
              </p>
              <p className="text-dark-500 text-sm mb-4">
                <strong className="text-dark-700">{script}</strong> • {price} • {qty} shares
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm flex items-start gap-2">
                  <Info size={16} className="mt-0.5 flex-shrink-0" />
                  <span>All active bids and offers will be automatically cancelled.</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading === 'delete'}
                className="flex-1 px-4 py-2.5 bg-dark-100 text-dark-700 rounded-xl font-semibold hover:bg-dark-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading === 'delete'}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'delete' ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sold Modal - Mark as externally sold */}
      {showSoldModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Mark as Sold</h3>
                  <p className="text-green-100 text-sm mt-0.5">Share sold outside platform</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSoldConfirm} className="p-6">
              <p className="text-dark-700 mb-2">
                <strong className="text-dark-900">{script}</strong> • {qty} shares
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-amber-800 text-sm flex items-start gap-2">
                  <Info size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Mark this listing as sold when you've completed the sale outside our platform.</span>
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Sold Price (per share) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold text-gray-900"
                  placeholder="Enter sold price per share"
                />
                {soldPrice && (
                  <p className="text-green-600 text-sm mt-1 font-medium italic">
                    {numberToWords(parseFloat(soldPrice))} Rupees Only
                  </p>
                )}
              </div>

              {soldPrice && (
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 mb-5 border-2 border-green-300">
                  <div className="flex items-center justify-between">
                    <span className="text-green-800 font-bold">Total Sold Amount:</span>
                    <span className="text-xl font-bold text-green-900">{formatCurrency(parseFloat(soldPrice) * (listing.quantity || 0))}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowSoldModal(false); setSoldPrice(''); }}
                  disabled={actionLoading === 'sold'}
                  className="flex-1 px-4 py-2.5 bg-dark-100 text-dark-700 rounded-xl font-semibold hover:bg-dark-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'sold' || !soldPrice}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === 'sold' ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <DollarSign size={18} />
                      Mark as Sold
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal - User doesn't want to sell/buy anymore */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Ban size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Cancel Listing</h3>
                  <p className="text-gray-200 text-sm mt-0.5">Move to history</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleCancelConfirm} className="p-6">
              <p className="text-dark-700 mb-2">
                Are you sure you want to cancel this listing?
              </p>
              <p className="text-dark-500 text-sm mb-4">
                <strong className="text-dark-700">{script}</strong> • {price} • {qty} shares
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Reason (optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 font-medium text-gray-900"
                  placeholder="Why are you cancelling this listing?"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                  disabled={actionLoading === 'cancel'}
                  className="flex-1 px-4 py-2.5 bg-dark-100 text-dark-700 rounded-xl font-semibold hover:bg-dark-200 transition-all disabled:opacity-50"
                >
                  Keep Listing
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'cancel'}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === 'cancel' ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Ban size={18} />
                      Cancel Listing
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Counter Modal */}
      {showCounterModal && selectedBid && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowCounterModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border-4 border-purple-400" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold">💬 Counter Offer</h3>
              <p className="text-sm opacity-90 mt-1">{listing.companyName} - {isSell ? 'SELL' : 'BUY'} Post</p>
            </div>
            <form onSubmit={handleCounterSubmit} className="p-6">
              <div className="bg-blue-50 rounded-xl p-4 mb-5 border-2 border-blue-200">
                <p className="text-sm font-bold text-gray-700 mb-3">Original {isSell ? 'Bid' : 'Offer'} by <span className="text-blue-700">@{selectedBid.user?.username || selectedBid.username || 'Unknown'}</span></p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-blue-300">
                    <span className="text-gray-600 block mb-1">Price per share:</span>
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(selectedBid.price)}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-300">
                    <span className="text-gray-600 block mb-1">Quantity:</span>
                    <span className="font-bold text-gray-900 text-lg">{selectedBid.quantity} shares</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Counter Price (per share) *</label>
                <input type="number" required min="1" step="0.01" value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900" placeholder="Enter your counter price" />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Quantity *</label>
                <input type="number" required min="1" value={counterQuantity} onChange={(e) => setCounterQuantity(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900" placeholder="Enter quantity" />
              </div>
              {counterPrice && counterQuantity && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-5 border-2 border-purple-300">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-800 font-bold text-lg">Total Amount:</span>
                    <span className="text-2xl font-bold text-purple-900">{formatCurrency(parseFloat(counterPrice) * parseInt(counterQuantity))}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCounterModal(false)} className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-400 transition-colors border-2 border-gray-400">Cancel</button>
                <button type="submit" disabled={actionLoading === selectedBid._id || !counterPrice || !counterQuantity} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-purple-700">
                  {actionLoading === selectedBid._id ? (<><Loader className="animate-spin" size={20} />Sending...</>) : (<><MessageSquare size={20} />Send Counter</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MyPostCard;
