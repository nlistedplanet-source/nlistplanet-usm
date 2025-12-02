import React from 'react';
import { Calendar, Package, TrendingUp, Share2, Zap, MessageCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatNumber, calculateTotalWithFee } from '../utils/helpers';

const ListingCard = ({ listing, onBidOffer, onShare, onBoost, isOwner }) => {
  const isSell = listing.type === 'sell';
  const totalPrice = calculateTotalWithFee(listing.price);
  const bidsCount = isSell ? listing.bids?.length || 0 : listing.offers?.length || 0;

  return (
    <div className={`card-mobile relative ${listing.isBoosted ? 'ring-2 ring-primary-500' : ''}`}>
      {/* Boosted Badge */}
      {listing.isBoosted && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Zap size={12} fill="white" />
          BOOSTED
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {(listing.companyId?.logo || listing.companyId?.Logo) ? (
            <img
              src={listing.companyId.logo || listing.companyId.Logo}
              alt={listing.companyName}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {!(listing.companyId?.logo || listing.companyId?.Logo) ? (
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-bold text-lg">
                {listing.companyName?.[0] || 'C'}
              </span>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary-100 items-center justify-center hidden">
              <span className="text-primary-700 font-bold text-lg">
                {listing.companyName?.[0] || 'C'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0 group relative">
            <h3 className="font-bold text-lg text-dark-900 leading-tight">
              {listing.companyId?.scriptName || listing.companyName}
            </h3>
            <p className="text-xs text-dark-500">{listing.companyId?.sector || 'Company'}</p>
            
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-dark-900 text-white text-xs rounded-lg p-3 shadow-xl z-20 min-w-[250px]">
              <div className="space-y-1.5">
                <div className="font-semibold border-b border-dark-700 pb-1 mb-2">{listing.companyName}</div>
                {listing.companyId?.sector && (
                  <div><span className="text-dark-400">Sector:</span> {listing.companyId.sector}</div>
                )}
                {listing.companyId?.isin && (
                  <div><span className="text-dark-400">ISIN:</span> {listing.companyId.isin}</div>
                )}
                {listing.companyId?.pan && (
                  <div><span className="text-dark-400">PAN:</span> {listing.companyId.pan}</div>
                )}
                {listing.companyId?.cin && (
                  <div><span className="text-dark-400">CIN:</span> {listing.companyId.cin}</div>
                )}
                {listing.companyId?.registrationDate && (
                  <div><span className="text-dark-400">Registered:</span> {formatDate(listing.companyId.registrationDate)}</div>
                )}
                {listing.companySegmentation && (
                  <div className="pt-1 mt-1 border-t border-dark-700">
                    <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                      {listing.companySegmentation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isSell ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {isSell ? 'SELL' : 'BUY'}
        </div>
      </div>

      {/* Description */}
      {listing.description && (
        <p className="text-sm text-dark-600 mb-3 line-clamp-2">
          {listing.description}
        </p>
      )}

      {/* Price & Quantity */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-dark-50 rounded-lg p-3">
          <p className="text-xs text-dark-500 mb-1">
            {isSell ? 'Buyer Pays' : 'Seller Gets'}
          </p>
          <p className="text-lg font-bold text-dark-900">{formatCurrency(totalPrice)}</p>
          <p className="text-xs text-dark-500 mt-1">
            {isSell ? `Base: ${formatCurrency(listing.price)} + 2% fee` : `Base: ${formatCurrency(listing.price)} (incl. fee)`}
          </p>
        </div>
        <div className="bg-dark-50 rounded-lg p-3">
          <p className="text-xs text-dark-500 mb-1">Quantity</p>
          <p className="text-lg font-bold text-dark-900">{formatNumber(listing.quantity)}</p>
          <p className="text-xs text-dark-500 mt-1">
            Min: {formatNumber(listing.minLot)}
          </p>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-primary-50 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-dark-600">Total Amount:</span>
          <span className="text-xl font-bold text-primary-700">
            {formatCurrency(totalPrice * listing.quantity)}
          </span>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-xs text-dark-500 mb-3">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          {formatDate(listing.createdAt)}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={14} />
          {bidsCount} {isSell ? 'Bids' : 'Offers'}
        </div>
        <div className="flex items-center gap-1">
          <Package size={14} />
          @{listing.username}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isOwner && (
          <button
            onClick={() => onBidOffer(listing)}
            className="flex-1 btn-mobile btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
          >
            <TrendingUp size={18} />
            {isSell ? 'Place Bid' : 'Make Offer'}
          </button>
        )}
        
        <button
          onClick={() => onShare(listing)}
          className={`btn-mobile btn-secondary text-sm py-2.5 flex items-center justify-center gap-2 ${
            isOwner ? 'flex-1' : 'px-4'
          }`}
        >
          <Share2 size={18} />
          {isOwner && 'Share & Earn'}
        </button>

        {isOwner && !listing.isBoosted && (
          <button
            onClick={() => onBoost(listing._id)}
            className="btn-mobile bg-yellow-500 text-white text-sm py-2.5 flex items-center justify-center gap-2 px-4"
          >
            <Zap size={18} />
            Boost
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;