import React from 'react';
import { Info, Building2, User, Heart } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/helpers';

// Utility to format price without .00 if not needed
function formatPriceNoDecimals(price) {
  if (Number(price) % 1 === 0) return `₹${Number(price).toLocaleString('en-IN')}`;
  return `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Utility to format quantity in shorthand (1K, 10K, 1L, etc.)
function formatQuantityShort(qty) {
  const num = Number(qty);
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`; // Crore
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`; // Lakh
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`; // Thousand
  return num.toString();
}

const MarketplaceCard = ({
  type = 'sell', // 'sell' or 'buy'
  companyLogo,
  companyName,
  companySymbol,
  companySector,
  companyPan,
  companyIsin,
  companyCin,
  price,
  shares,
  user,
  onPrimary,
  onSecondary,
  onShare,
  onLike,
  isLiked = false,
}) => {
  const isSell = type === 'sell';
  // Accent color and background based on type
  // Sell post = green (buy opportunity for others)
  // Buy post = yellow (sell opportunity for others)
  const accentColor = isSell ? 'bg-emerald-500' : 'bg-yellow-400';
  const accentBg = isSell ? 'bg-emerald-50' : 'bg-yellow-50';
  const accentText = isSell ? 'text-emerald-700' : 'text-yellow-700';
  const accentHover = isSell ? 'hover:bg-emerald-100' : 'hover:bg-yellow-100';
  const borderAccent = isSell ? 'border-emerald-200' : 'border-yellow-200';
  const iconColor = isSell ? 'text-emerald-600' : 'text-yellow-600';
  
  // Logo fallback using Google S2 service for company favicon
  const logoUrl = companyLogo || `https://www.google.com/s2/favicons?domain=${companyName?.toLowerCase().replace(/\s+/g, '')}.com&sz=64`;
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 w-full border ${borderAccent} relative hover:shadow-md transition-shadow overflow-hidden`}>
      {/* Full-width Colored Line at Top */}
      <div className={`h-1 rounded-t-lg absolute left-0 top-0 right-0 ${accentColor}`}></div>
      
      {/* Top Row with Badges */}
      <div className="flex items-center justify-between mb-1.5 mt-1">
        <div className="flex gap-1">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${isSell ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {isSell ? 'Sell' : 'Buy'}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
            Unlisted
          </span>
        </div>
        <span className="text-[10px] text-gray-500 font-semibold">21 Nov</span>
      </div>
      
      {/* Company Row */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img 
            src={logoUrl} 
            alt={companyName} 
            className="w-6 h-6 object-contain transition-transform duration-300 hover:scale-125 cursor-pointer"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${companyName}&background=random&size=64`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm text-gray-900 truncate">{companySymbol || companyName}</span>
            <span className="relative group ml-0.5">
              <Info size={12} className="text-blue-500 cursor-pointer" />
              <div className="hidden group-hover:block absolute z-10 left-0 top-4 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-[10px] text-gray-700 min-w-[180px]">
                <div className="mb-0.5"><b>Company:</b> {companyName || 'N/A'}</div>
                <div className="mb-0.5"><b>PAN:</b> {companyPan || 'N/A'}</div>
                <div className="mb-0.5"><b>ISIN:</b> {companyIsin || 'N/A'}</div>
                <div><b>CIN:</b> {companyCin || 'N/A'}</div>
              </div>
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Building2 size={10} className={iconColor} />
            <span className="text-[10px] text-gray-600">{companySector || 'Financial Services'}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <User size={10} className={iconColor} />
            <span className="text-[10px] text-gray-600">{isSell ? 'Seller:' : 'Buyer:'} @{user}</span>
          </div>
        </div>
      </div>
      {/* Details */}
      <div className={`mb-1.5 rounded-lg ${accentBg} p-1.5`}> 
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] text-gray-500">Ask Price</span>
          <span className={`font-bold text-base ${accentText}`}>{formatPriceNoDecimals(price)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500">Quantity</span>
          <span className="font-semibold text-base text-gray-900">{formatQuantityShort(shares)}</span>
        </div>
      </div>
      {/* Actions */}
      <div className="flex gap-1.5 mt-1.5">
        {isSell ? (
          <>
            <button
              className="flex-1 py-1.5 rounded-lg font-semibold text-xs bg-gray-800 text-emerald-400 hover:bg-gray-900 shadow transition-colors"
              onClick={onPrimary}
            >
              Place Your Bid
            </button>
            <button
              className="flex-1 py-1.5 rounded-lg font-semibold text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={onShare}
            >
              Share
            </button>
            <button
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                isLiked 
                  ? 'bg-red-50 border-red-300 text-red-600' 
                  : 'bg-white border-gray-300 text-red-500 hover:bg-red-50'
              }`}
              onClick={onLike}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={14} className={isLiked ? 'fill-current' : ''} />
            </button>
          </>
        ) : (
          <>
            <button
              className="flex-1 py-1.5 rounded-lg font-semibold text-xs bg-gray-800 text-yellow-400 hover:bg-gray-900 shadow transition-colors"
              onClick={onPrimary}
            >
              Make Offer
            </button>
            <button
              className="flex-1 py-1.5 rounded-lg font-semibold text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={onShare}
            >
              Share
            </button>
            <button
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                isLiked 
                  ? 'bg-red-50 border-red-300 text-red-600' 
                  : 'bg-white border-gray-300 text-red-500 hover:bg-red-50'
              }`}
              onClick={onLike}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={14} className={isLiked ? 'fill-current' : ''} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplaceCard;
