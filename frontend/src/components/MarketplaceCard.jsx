import React from 'react';
import { Info } from 'lucide-react';
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
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 w-full border ${borderAccent} relative hover:shadow-md transition-shadow`}>
      {/* Top Row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-semibold">21 Nov 2025</span>
        <div className={`w-2/12 h-1 rounded-t-lg absolute left-0 top-0 ${accentColor}`}></div>
      </div>
      {/* Company Row */}
      <div className="flex items-center gap-2 mb-2">
        {companyLogo ? (
          <img src={companyLogo} alt={companyName} className="w-8 h-8 rounded-full object-cover border" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-base text-gray-600 border">
            {companyName?.[0] || 'C'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-base text-gray-900 truncate">{companyName}</span>
            <span className="text-xs text-gray-500 font-mono">({companySymbol})</span>
            <span className="relative group ml-1">
              <Info size={13} className="text-blue-400 cursor-pointer" />
              <div className="hidden group-hover:block absolute z-10 left-0 top-5 bg-white border border-gray-200 rounded shadow-lg p-1.5 text-xs text-gray-700 min-w-[160px]">
                <div><b>PAN:</b> {companyPan}</div>
                <div><b>ISIN:</b> {companyIsin}</div>
                <div><b>CIN:</b> {companyCin}</div>
              </div>
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs text-gray-500">{isSell ? 'Financial Services' : 'Manufacturing'}</span>
            <span className="text-xs text-gray-400">@{user}</span>
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
              onClick={onSecondary}
            >
              View Details
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
              onClick={onSecondary}
            >
              View Details
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
