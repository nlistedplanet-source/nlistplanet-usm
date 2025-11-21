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
  return (
    <div className="bg-white rounded-xl shadow-md p-5 w-full max-w-md mx-auto border border-gray-100 relative">
      {/* Top Row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-semibold">21 Nov</span>
        <button
          className={`px-4 py-1 rounded-full text-sm font-bold shadow-sm ${isSell ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'}`}
          onClick={onPrimary}
        >
          {isSell ? 'Buy' : 'Sell'}
        </button>
      </div>
      {/* Company Row */}
      <div className="flex items-center gap-3 mb-3">
        {companyLogo ? (
          <img src={companyLogo} alt={companyName} className="w-10 h-10 rounded-full object-cover border" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg text-gray-600 border">
            {companyName?.[0] || 'C'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-800 truncate">{companyName}</span>
            <span className="text-xs text-gray-500 font-mono">({companySymbol})</span>
            <span className="relative group ml-1">
              <Info size={15} className="text-blue-400 cursor-pointer" />
              <div className="hidden group-hover:block absolute z-10 left-0 top-6 bg-white border border-gray-200 rounded shadow-lg p-2 text-xs text-gray-700 min-w-[180px]">
                <div><b>PAN:</b> {companyPan}</div>
                <div><b>ISIN:</b> {companyIsin}</div>
                <div><b>CIN:</b> {companyCin}</div>
              </div>
            </span>
          </div>
        </div>
      </div>
      {/* Details */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">Price (incl. fees):</span>
          <span className="font-bold text-gray-900 text-base">{formatPriceNoDecimals(price)}</span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">{isSell ? 'Shares Available:' : 'Shares Required:'}</span>
          <span className="font-semibold text-gray-800">{formatNumber(shares)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{isSell ? 'Seller:' : 'Buyer:'}</span>
          <span className="text-sm text-gray-700 font-mono">@{user}</span>
        </div>
      </div>
      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          className={`flex-1 py-2 rounded-lg font-semibold text-sm ${isSell ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
          onClick={onSecondary}
        >
          {isSell ? 'Bid' : 'Offer'}
        </button>
        <button
          className="flex-1 py-2 rounded-lg font-semibold text-sm bg-gray-50 text-gray-700 hover:bg-gray-100"
          onClick={onShare}
        >
          Share
        </button>
      </div>
    </div>
  );
};

export default MarketplaceCard;
