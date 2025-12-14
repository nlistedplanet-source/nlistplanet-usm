import React, { useState, useRef } from 'react';
import SoldConfirmModal from '../SoldConfirmModal';
import { Share2, Zap, Edit, Trash2, CheckCircle, XCircle, MessageSquare, Loader, Eye, Info, ChevronDown, ChevronUp, History, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatNumber, numberToWords, formatShortAmount, formatShortQuantity, calculateSellerGets } from '../../utils/helpers';
import * as htmlToImage from 'html-to-image';
import { listingsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const MyPostCard = ({ listing, onShare, onBoost, onDelete, onRefresh }) => {
  // Helper function to get proper logo URL
  const getLogoUrl = (logo) => {
    if (!logo) return null;
    // If logo is already a full URL, return it
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    // If logo is a relative path, construct full URL
    if (logo.startsWith('/')) {
      return `${window.location.origin}${logo}`;
    }
    // If logo is just a filename, assume it's in /images/logos/
    return `${window.location.origin}/images/logos/${logo}`;
  };

  const logoUrl = getLogoUrl(listing.companyId?.Logo || listing.companyId?.logo);

  const [actionLoading, setActionLoading] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [counterOffersExpanded, setCounterOffersExpanded] = useState(true);
  const [pendingBidsExpanded, setPendingBidsExpanded] = useState(true);
  const [expandedBidIds, setExpandedBidIds] = useState(new Set());
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyPrice, setModifyPrice] = useState('');
  const [modifyQuantity, setModifyQuantity] = useState('');
  const [modifyMinQuantity, setModifyMinQuantity] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [markedSold, setMarkedSold] = useState(false);
  const [soldPricePerShare, setSoldPricePerShare] = useState(null);
  const shareDomRef = useRef(null);

  const isSell = listing.type === 'sell';
  const bidsArray = (isSell ? listing.bids : listing.offers) || [];
  
  // Separate bids into Counter Offers (in-progress) and Pending Bids
  const counterOfferBids = bidsArray.filter(b => b.status === 'countered');
  const pendingBids = bidsArray.filter(b => b.status === 'pending');
  const activeBidsCount = counterOfferBids.length + pendingBids.length;
  
  // Use seller's desired price (what they entered) for display
  const sellerPrice = isSell ? (listing.sellerDesiredPrice || listing.price) : (listing.buyerMaxPrice || listing.price);
  const totalAmount = sellerPrice * listing.quantity;
  
  // Define at component level for use in share DOM node
  const script = listing.companyId?.ScriptName || listing.companyName || 'Company';
  const price = formatCurrency(sellerPrice);
  const qty = formatShortQuantity(listing.quantity || 0);

  // Helper to get latest counter info for a bid
  const getLatestCounterInfo = (bid) => {
    if (!bid.counterHistory || bid.counterHistory.length === 0) {
      return { buyerBid: bid.price, buyerQty: bid.quantity, yourPrice: null, yourQty: null, rounds: 0, latestBy: 'buyer' };
    }
    
    const history = bid.counterHistory;
    let latestBuyerCounter = null;
    let latestSellerCounter = null;
    
    // Find latest buyer and seller counters
    for (let i = history.length - 1; i >= 0; i--) {
      if (!latestBuyerCounter && history[i].by === 'buyer') {
        latestBuyerCounter = history[i];
      }
      if (!latestSellerCounter && history[i].by === 'seller') {
        latestSellerCounter = history[i];
      }
      if (latestBuyerCounter && latestSellerCounter) break;
    }
    
    const latestEntry = history[history.length - 1];
    
    return {
      buyerBid: latestBuyerCounter ? latestBuyerCounter.price : bid.price,
      buyerQty: latestBuyerCounter ? latestBuyerCounter.quantity : bid.quantity,
      yourPrice: latestSellerCounter ? latestSellerCounter.price : null,
      yourQty: latestSellerCounter ? latestSellerCounter.quantity : null,
      rounds: history.length,
      latestBy: latestEntry.by
    };
  };

  const handleAccept = async (bid) => {
    try {
      setActionLoading(bid._id);
      const response = await listingsAPI.acceptBid(listing._id, bid._id);
      const status = response.data.status;
      
      if (status === 'confirmed') {
        toast.success('Deal confirmed! 🎉');
      } else if (status === 'accepted') {
        toast.success('Accepted! Waiting for other party to confirm. ⏳');
      }
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

  const handleMarkSoldClick = () => {
    setShowSoldModal(true);
  };

  const handleConfirmSold = ({ pricePerShare }) => {
    setSoldPricePerShare(pricePerShare);
    setMarkedSold(true);
    setShowSoldModal(false);
    toast.success('Marked as Sold. Listing inactivated.');
    if (onRefresh) onRefresh();
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
    const deeplink = `${window.location.origin}/listing/${listing._id}?ref=${listing.user?._id || 'guest'}&source=share`;
    const hashtags = [`#UnlistedShare`, `#NlistPlanet`, `#${(script || '').replace(/[^a-zA-Z0-9]/g, '')}`].join(' ');
    const caption = `Check out this unlisted share of ${script} listed on Nlist Planet.\nAsk Price: ${price} • Quantity: ${qty}\n${deeplink}\n\n${hashtags}`;

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
                await navigator.share({ files: [file], title: `${script} on Nlist Planet`, text: caption });
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
          console.warn('html-to-image failed, trying canvas:', e);
        }
      }

      // Fallback: navigator.share with text + deeplink
      if (navigator.share) {
        try {
          await navigator.share({ title: `${script} on Nlist Planet`, text: caption, url: deeplink });
          toast.success('Shared successfully! 🎉');
          return;
        } catch (e) {
          console.warn('navigator.share(text) failed:', e);
        }
      }

      // Last resort: copy caption to clipboard
      await navigator.clipboard.writeText(caption);
      toast.success('Caption copied to clipboard! Share manually on WhatsApp.');
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

  // Sorted bids
  const sortedBids = [...bidsArray].sort((a, b) => {
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
              markedSold ? 'bg-amber-100 text-amber-800 border-2 border-amber-400' : (
              listing.status === 'active' ? 'bg-green-100 text-green-700 border-2 border-green-400' :
              listing.status === 'negotiating' ? 'bg-amber-100 text-amber-700 border-2 border-amber-400' :
              'bg-gray-100 text-gray-700 border-2 border-gray-400')
            }`}>
              {markedSold ? '🟠 SOLD' : 
               listing.status === 'negotiating' ? '🟠 NEGOTIATING' :
               `🟢 ${listing.status?.toUpperCase() || 'ACTIVE'}`}
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
            {markedSold && soldPricePerShare && (
              <span className="flex items-center gap-1 text-amber-800">
                <span className="bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400">Sold @ ₹{soldPricePerShare}</span>
              </span>
            )}
          </div>
        </div>

        {/* Company Info */}
        <div className="px-3 py-2 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={listing.companyId?.scriptName || listing.companyId?.ScriptName || listing.companyName}
                className="w-10 h-10 rounded-md object-cover border border-purple-300 shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm border border-purple-300"
              style={{ display: logoUrl ? 'none' : 'flex' }}
            >
              {(listing.companyId?.scriptName || listing.companyId?.ScriptName || listing.companyName)?.charAt(0) || 'C'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {listing.companyId?.scriptName || listing.companyId?.ScriptName || listing.companyName || 'Unknown'}
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
                <th className="border-2 border-gray-400 px-2 py-1 text-center text-[11px] font-bold text-gray-700 uppercase">{isSell ? 'Selling Price' : 'Buying Price'}</th>
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
                  <div className="text-sm font-bold text-gray-900 cursor-help" title={`${(listing.minLot || 1).toLocaleString('en-IN')} shares`}>
                    {formatShortQuantity(listing.minLot || 1)}
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
          <button onClick={() => onBoost && onBoost(listing._id)} className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm" disabled={markedSold}>
            <Zap className="w-3.5 h-3.5" /> Boost
          </button>
          {activeBidsCount === 0 && !markedSold && (
            <>
              <button onClick={handleModify} disabled={actionLoading === 'modify'} className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm disabled:opacity-50">
                <Edit className="w-3.5 h-3.5" /> Modify
              </button>
              <button onClick={handleDeleteClick} disabled={actionLoading === 'delete'} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}
          {!markedSold && (
            <button onClick={handleMarkSoldClick} className="px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" /> Sold
            </button>
          )}
        </div>

        {/* Two Sections: Counter Offers In-Progress + Pending Bids */}
        {bidsArray.length > 0 && (
          <div className="px-3 py-2 space-y-3">
            {/* Section 1: Counter Offers In-Progress */}
            {counterOfferBids.length > 0 && (
              <div>
                <button 
                  onClick={() => setCounterOffersExpanded(!counterOffersExpanded)}
                  className="w-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 rounded-md border-2 border-blue-400 flex items-center justify-between hover:from-blue-200 hover:to-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 text-lg">🔵</span>
                    <h4 className="font-bold text-blue-800 text-[12px]">Counter Offers In-Progress ({counterOfferBids.length})</h4>
                  </div>
                  {counterOffersExpanded ? <ChevronUp className="w-4 h-4 text-blue-700" /> : <ChevronDown className="w-4 h-4 text-blue-700" />}
                </button>
                
                {counterOffersExpanded && (
                  <div className="border-2 border-blue-400 border-t-0 rounded-b-lg overflow-hidden shadow-lg">
                    <table className="w-full bg-white">
                      <thead className="bg-blue-50 border-b-2 border-blue-400">
                        <tr>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-blue-800 uppercase border-r border-blue-300 w-8">#</th>
                          <th className="px-2 py-1.5 text-left text-[11px] font-bold text-blue-800 uppercase border-r border-blue-300">{isSell ? 'Buyer' : 'Seller'}</th>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-blue-800 uppercase border-r border-blue-300">{isSell ? 'Buyer Bid' : 'Seller Offer'}</th>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-blue-800 uppercase border-r border-blue-300">Your Price</th>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-blue-800 uppercase border-r border-blue-300 w-16">Rounds</th>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-blue-800 uppercase border-r border-blue-300">Status</th>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-blue-800 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-200">
                        {counterOfferBids.map((bid, index) => {
                          const counterInfo = getLatestCounterInfo(bid);
                          // Show actual bid price (no fee calculation)
                          const displayBuyerBid = counterInfo.buyerBid;
                          const hasCounterHistory = bid.counterHistory && bid.counterHistory.length > 0;
                          const isExpanded = expandedBidIds.has(bid._id);
                          const isLatestFromBuyer = counterInfo.latestBy === 'buyer';
                          const canShowActions = isLatestFromBuyer; // Show actions only when it's seller's turn
                          
                          return (
                            <React.Fragment key={bid._id}>
                              {/* Main Row */}
                              <tr className={`hover:bg-blue-50 transition-colors ${isLatestFromBuyer ? 'bg-orange-50' : ''}`}>
                                <td className="px-2 py-2 text-[11px] font-bold text-gray-900 border-r border-blue-200 text-center">{index + 1}</td>
                                <td className="px-2 py-2 text-[11px] border-r border-blue-200">
                                  <div className="font-bold text-blue-700">@{bid.user?.username || bid.username || 'trader_' + (index + 1)}</div>
                                  <div className="text-[10px] text-gray-500">⭐ {bid.user?.rating?.toFixed(1) || '4.5'}</div>
                                </td>
                                <td className="px-2 py-2 text-center border-r border-blue-200">
                                  <div className="text-[11px] font-bold text-gray-900">{formatCurrency(displayBuyerBid)}</div>
                                  <div className="text-[9px] text-gray-500">×{formatShortQuantity(counterInfo.buyerQty)}</div>
                                </td>
                                <td className="px-2 py-2 text-center border-r border-blue-200">
                                  {counterInfo.yourPrice ? (
                                    <>
                                      <div className="text-[11px] font-bold text-purple-700">{formatCurrency(counterInfo.yourPrice)}</div>
                                      <div className="text-[9px] text-gray-500">×{formatShortQuantity(counterInfo.yourQty)}</div>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-center border-r border-blue-200">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-bold">{counterInfo.rounds}</span>
                                </td>
                                <td className="px-2 py-2 text-center border-r border-blue-200">
                                  <div className="flex items-center justify-center gap-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      isLatestFromBuyer 
                                        ? 'bg-orange-100 text-orange-800 border border-orange-400' 
                                        : 'bg-blue-100 text-blue-800 border border-blue-400'
                                    }`}>
                                      {isLatestFromBuyer ? 'Your Turn' : 'Waiting'}
                                    </span>
                                    {hasCounterHistory && (
                                      <button
                                        onClick={() => {
                                          const newSet = new Set(expandedBidIds);
                                          if (newSet.has(bid._id)) newSet.delete(bid._id);
                                          else newSet.add(bid._id);
                                          setExpandedBidIds(newSet);
                                        }}
                                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                                        title="View counter history"
                                      >
                                        <History size={14} className="text-blue-600" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-center">
                                  {canShowActions ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <button onClick={() => handleAccept(bid)} disabled={actionLoading === bid._id} className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors border border-green-400" title="Accept">
                                        <CheckCircle size={16} className="text-green-700" />
                                      </button>
                                      <button onClick={() => handleReject(bid)} disabled={actionLoading === bid._id} className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors border border-red-400" title="Reject">
                                        <XCircle size={16} className="text-red-700" />
                                      </button>
                                      <button onClick={() => handleCounterClick(bid)} disabled={actionLoading === bid._id} className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors border border-blue-400" title="Counter">
                                        <MessageSquare size={16} className="text-blue-700" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-blue-600 italic flex items-center justify-center gap-1">
                                      <Clock size={12} /> Waiting...
                                    </span>
                                  )}
                                </td>
                              </tr>
                              
                              {/* Counter History Sub-rows */}
                              {isExpanded && hasCounterHistory && (
                                <tr>
                                  <td colSpan="7" className="p-0 bg-gray-50">
                                    <div className="px-4 py-2">
                                      <div className="text-[10px] font-bold text-gray-600 mb-2 flex items-center gap-1">
                                        <History size={12} /> Counter History
                                      </div>
                                      <table className="w-full border border-gray-300 rounded">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="px-2 py-1 text-[10px] font-bold text-gray-600 text-left border-r border-gray-300">Round</th>
                                            <th className="px-2 py-1 text-[10px] font-bold text-gray-600 text-left border-r border-gray-300">By</th>
                                            <th className="px-2 py-1 text-[10px] font-bold text-gray-600 text-center border-r border-gray-300">Price</th>
                                            <th className="px-2 py-1 text-[10px] font-bold text-gray-600 text-center border-r border-gray-300">Qty</th>
                                            <th className="px-2 py-1 text-[10px] font-bold text-gray-600 text-left">Date</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {bid.counterHistory.map((counter, cIdx) => {
                                            // Show actual counter price (no fee calculation)
                                            const counterDisplayPrice = counter.price;
                                            return (
                                              <tr key={cIdx} className={counter.by === 'seller' ? 'bg-purple-50' : 'bg-white'}>
                                                <td className="px-2 py-1 text-[10px] font-semibold text-gray-700 border-r border-gray-200">#{counter.round || cIdx + 1}</td>
                                                <td className="px-2 py-1 text-[10px] border-r border-gray-200">
                                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                    counter.by === 'seller' ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'
                                                  }`}>
                                                    {counter.by === 'seller' ? 'You' : 'Buyer'}
                                                  </span>
                                                </td>
                                                <td className="px-2 py-1 text-[10px] font-semibold text-gray-800 text-center border-r border-gray-200">{formatCurrency(counterDisplayPrice)}</td>
                                                <td className="px-2 py-1 text-[10px] text-gray-700 text-center border-r border-gray-200">{formatShortQuantity(counter.quantity)}</td>
                                                <td className="px-2 py-1 text-[9px] text-gray-500">{formatDate(counter.timestamp)}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Section 2: Pending Bids */}
            {pendingBids.length > 0 && (
              <div>
                <button 
                  onClick={() => setPendingBidsExpanded(!pendingBidsExpanded)}
                  className="w-full bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-2 rounded-md border-2 border-orange-400 flex items-center justify-between hover:from-orange-200 hover:to-amber-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 text-lg">🟠</span>
                    <h4 className="font-bold text-orange-800 text-[12px]">Pending Bids ({pendingBids.length})</h4>
                  </div>
                  {pendingBidsExpanded ? <ChevronUp className="w-4 h-4 text-orange-700" /> : <ChevronDown className="w-4 h-4 text-orange-700" />}
                </button>
                
                {pendingBidsExpanded && (
                  <div className="border-2 border-orange-400 border-t-0 rounded-b-lg overflow-hidden shadow-lg">
                    <table className="w-full bg-white">
                      <thead className="bg-orange-50 border-b-2 border-orange-400">
                        <tr>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-orange-800 uppercase border-r border-orange-300 w-8">#</th>
                          <th className="px-2 py-1.5 text-left text-[11px] font-bold text-orange-800 uppercase border-r border-orange-300">{isSell ? 'Buyer' : 'Seller'}</th>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-orange-800 uppercase border-r border-orange-300">{isSell ? 'Bid Price' : 'Offer Price'}</th>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-orange-800 uppercase border-r border-orange-300">Quantity</th>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-orange-800 uppercase border-r border-orange-300">Total</th>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-orange-800 uppercase border-r border-orange-300">Date</th>
                          <th className="px-2 py-1.5 text-center text-[11px] font-bold text-orange-800 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-200">
                        {pendingBids.map((bid, index) => {
                          // Show the actual bid price (what buyer is paying)
                          const displayPrice = bid.originalPrice || bid.price;
                          const bidTotal = displayPrice * bid.quantity;
                          
                          return (
                            <tr key={bid._id} className="hover:bg-orange-50 transition-colors">
                              <td className="px-2 py-2 text-[11px] font-bold text-gray-900 border-r border-orange-200 text-center">{index + 1}</td>
                              <td className="px-2 py-2 text-[11px] border-r border-orange-200">
                                <div className="font-bold text-orange-700">@{bid.user?.username || bid.username || 'trader_' + (index + 1)}</div>
                                <div className="text-[10px] text-gray-500">⭐ {bid.user?.rating?.toFixed(1) || '4.5'}</div>
                              </td>
                              <td className="px-2 py-2 text-center border-r border-orange-200">
                                <div className="text-[12px] font-bold text-gray-900">{formatCurrency(displayPrice)}</div>
                              </td>
                              <td className="px-2 py-2 text-center border-r border-orange-200">
                                <div className="text-[11px] font-bold text-gray-900">{formatShortQuantity(bid.quantity)}</div>
                              </td>
                              <td className="px-2 py-2 text-center border-r border-orange-200">
                                <div className="text-[11px] font-bold text-green-600">{formatShortAmount(bidTotal)}</div>
                              </td>
                              <td className="px-2 py-2 text-center border-r border-orange-200">
                                <div className="text-[10px] text-gray-500">{formatDate(bid.createdAt)}</div>
                              </td>
                              <td className="px-2 py-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button onClick={() => handleAccept(bid)} disabled={actionLoading === bid._id} className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors border border-green-400" title="Accept">
                                    <CheckCircle size={16} className="text-green-700" />
                                  </button>
                                  <button onClick={() => handleReject(bid)} disabled={actionLoading === bid._id} className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors border border-red-400" title="Reject">
                                    <XCircle size={16} className="text-red-700" />
                                  </button>
                                  <button onClick={() => handleCounterClick(bid)} disabled={actionLoading === bid._id} className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors border border-blue-400" title="Counter">
                                    <MessageSquare size={16} className="text-blue-700" />
                                  </button>
                                </div>
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

            {/* No Active Bids */}
            {counterOfferBids.length === 0 && pendingBids.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No active bids yet</p>
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

      {/* Sold Confirm Modal */}
      {showSoldModal && (
        <SoldConfirmModal
          listing={listing}
          onClose={() => setShowSoldModal(false)}
          onSubmit={handleConfirmSold}
        />
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
