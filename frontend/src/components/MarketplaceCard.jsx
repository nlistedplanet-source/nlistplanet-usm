import React from 'react';
import { Info, Building2, User } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/helpers';

// Utility to format price without .00 if not needed
function formatPriceNoDecimals(price) {
  if (Number(price) % 1 === 0) return `₹${Number(price).toLocaleString('en-IN')}`;
  return `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  
  // Logo fallback using Google S2 service for company favicon
  const logoUrl = companyLogo || `https://www.google.com/s2/favicons?domain=${companyName?.toLowerCase().replace(/\s+/g, '')}.com&sz=64`;
  
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 w-full border ${borderAccent} relative hover:shadow-md transition-shadow`}>
      {/* Top Row with Badges */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1.5">
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isSell ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {isSell ? 'Sell' : 'Buy'}
          </span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
            Unlisted
          </span>
        </div>
        <span className="text-xs text-gray-500 font-semibold">21 Nov 2025</span>
        <div className={`w-2/12 h-1 rounded-t-lg absolute left-0 top-0 ${accentColor}`}></div>
      </div>
      
      {/* Company Row */}
      <div className="flex items-center gap-2 mb-2">
        <img 
          src={logoUrl} 
          alt={companyName} 
          className="w-10 h-10 rounded-full object-cover border"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${companyName}&background=random&size=64`;
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-base text-gray-900 truncate">{companySymbol || companyName}</span>
            <span className="relative group ml-1">
              <Info size={14} className="text-blue-500 cursor-pointer" />
              <div className="hidden group-hover:block absolute z-10 left-0 top-5 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs text-gray-700 min-w-[200px]">
                <div className="mb-1"><b>Company:</b> {companyName}</div>
                <div className="mb-1"><b>PAN:</b> {companyPan || 'N/A'}</div>
                <div className="mb-1"><b>ISIN:</b> {companyIsin || 'N/A'}</div>
                <div><b>CIN:</b> {companyCin || 'N/A'}</div>
              </div>
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Building2 size={12} className="text-gray-500" />
            <span className="text-xs text-gray-600">{companySector || 'Financial Services'}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <User size={12} className="text-gray-500" />
            <span className="text-xs text-gray-600">{isSell ? 'Seller:' : 'Buyer:'} @{user}</span>
          </div>
        </div>
      </div>
      {/* Details */}
      <div className={`mb-2 rounded-lg ${accentBg} p-2`}> 
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs text-gray-500">Ask Price</span>
          <span className={`font-bold text-lg ${accentText}`}>{formatPriceNoDecimals(price)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Quantity</span>
          <span className="font-semibold text-lg text-gray-900">{formatNumber(shares)} Lakh</span>
        </div>
      </div>
      {/* Actions */}
      <div className="flex gap-2 mt-2">
        {isSell ? (
          <>
            <button
              className="flex-1 py-2 rounded-lg font-semibold text-sm bg-gray-800 text-emerald-400 hover:bg-gray-900 shadow"
              onClick={onPrimary}
            >
              Place Your Bid
            </button>
            <button
              className="flex-1 py-2 rounded-lg font-semibold text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              onClick={onShare}
            >
              Share
            </button>
            <button
              className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              onClick={onShare}
              title="Share"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              className="flex-1 py-2 rounded-lg font-semibold text-sm bg-gray-800 text-yellow-400 hover:bg-gray-900 shadow"
              onClick={onPrimary}
            >
              Make Offer
            </button>
            <button
              className="flex-1 py-2 rounded-lg font-semibold text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              onClick={onShare}
            >
              Share
            </button>
            <button
              className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              onClick={onShare}
              title="Share"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplaceCard;
