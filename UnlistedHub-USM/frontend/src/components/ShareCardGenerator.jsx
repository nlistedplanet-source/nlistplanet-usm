import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Download, X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../utils/api';
import { calculateBuyerPays } from '../utils/helpers';

const ShareCardGenerator = ({ listing, onClose }) => {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Generate share link and caption
  const generateShareData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/share/create', {
        listingId: listing._id
      });
      setShareData(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Share API error:', error);
      // Generate fallback data if API fails
      const companyName = listing.companyId?.name || listing.companyName || 'Company';
      const sector = listing.companyId?.sector || 'Unlisted Share';
      const highlights = listing.companyId?.highlights || [
        'Pre-IPO Investment Opportunity',
        'Verified on NlistPlanet',
        `${sector} Sector`,
        'Direct Peer-to-Peer Trading'
      ];
      
      const highlightsList = highlights.slice(0, 4).map((h, i) => `${i + 1}. ${h}`).join('\n');
      
      const fallbackData = {
        shareId: `fallback_${listing._id}_${Date.now()}`,
        shareUrl: `${window.location.origin}/listing/${listing._id}`,
        caption: `💎 Premium Investment Opportunity\n\n🏢 ${companyName}\n📊 ${sector}\n\n✨ Investment Highlights:\n${highlightsList}\n\n👉 Explore this opportunity:\n${window.location.origin}/listing/${listing._id}\n\n🔒 Verified Trading on NlistPlanet\n\n#UnlistedShares #Investment #PreIPO #${sector.replace(/\s+/g, '')} #NlistPlanet`
      };
      setShareData(fallbackData);
      toast.error('Using offline mode for share');
      return fallbackData;
    } finally {
      setLoading(false);
    }
  };

  // Generate card image
  const generateCardImage = async () => {
    if (!cardRef.current) return null;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        ignoreElements: (element) => {
          // Ignore external stylesheets to avoid CORS issues
          return element.tagName === 'LINK' && element.rel === 'stylesheet';
        },
        onclone: (clonedDoc) => {
          // Remove external fonts to avoid CORS issues
          const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          links.forEach(link => {
            if (link.href.includes('fonts.googleapis.com')) {
              link.remove();
            }
          });
        }
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Card generation error:', error);
      toast.error('Failed to generate card');
      return null;
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      setLoading(true);

      // Generate share data if not already generated
      let data = shareData;
      if (!data) {
        data = await generateShareData();
        if (!data) return;
      }

      // Generate card image
      const imageDataUrl = await generateCardImage();
      if (!imageDataUrl) return;

      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'share-card.png', { type: 'image/png' });

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Investment Opportunity',
          text: data.caption,
          files: [file]
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback: Download image and copy caption
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = `nlistplanet-${listing.companyId?.name || listing.companyName || 'share'}.png`;
        link.click();
        
        // Copy caption to clipboard
        await navigator.clipboard.writeText(data.caption);
        toast.success('Card downloaded & caption copied!');
      }

      onClose();
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    } finally {
      setLoading(false);
    }
  };

  // Handle download only
  const handleDownload = async () => {
    try {
      setLoading(true);

      const imageDataUrl = await generateCardImage();
      if (!imageDataUrl) return;

      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = `nlistplanet-${listing.companyId?.name || listing.companyName || 'share'}.png`;
      link.click();

      toast.success('Card downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    } finally {
      setLoading(false);
    }
  };

  // Load share data on mount
  React.useEffect(() => {
    generateShareData();
  }, []);

  // Determine card theme based on listing type
  const isBuyListing = listing.type === 'buy';
  const cardTheme = isBuyListing ? {
    gradient: 'from-emerald-50 to-teal-50',
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    priceBoxGradient: 'from-teal-100 to-emerald-100',
    priceLabel: 'Bid Price',
    priceColor: 'text-emerald-600',
    icon: '�',
    hashtag: '#InvestmentOpportunity',
    description: `Seeking ${listing.companyId?.name || listing.companyName} shares for my investment portfolio. Connect with sellers on NlistPlanet for verified unlisted share trading.`
  } : {
    gradient: 'from-orange-50 to-amber-50',
    accentColor: 'text-orange-600',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    priceBoxGradient: 'from-yellow-100 to-orange-100',
    priceLabel: 'Ask Price',
    priceColor: 'text-red-600',
    icon: '🚀',
    hashtag: '#UnlistedShares',
    description: `Premium investment opportunity in ${listing.companyId?.name || listing.companyName}. Connect with serious investors on NlistPlanet for verified unlisted share trading.`
  };

  const basePrice = Number(listing.price || listing.listingPrice || 0);
  const displayPrice = isBuyListing ? basePrice : calculateBuyerPays(basePrice);
  const formattedDisplayPrice = Number.isFinite(displayPrice)
    ? displayPrice.toFixed(displayPrice % 1 === 0 ? 0 : 2)
    : '0';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 relative my-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white z-10"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold text-white mb-4">Share Listing</h3>

        {/* Share Card Preview - Scaled to fit */}
        <div className={`mb-4 overflow-hidden rounded-xl bg-gradient-to-br ${cardTheme.gradient} relative`} style={{ width: '100%', paddingBottom: '100%' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{ width: '100%', height: '100%', transform: 'scale(1)', transformOrigin: 'center' }}>
              <div 
                ref={cardRef} 
                className={`w-full h-full bg-gradient-to-br ${cardTheme.gradient} overflow-hidden`}
                style={{ 
                  width: '1080px', 
                  height: '1080px',
                  transform: 'scale(0.36)',
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              >
            {/* Card Header */}
            <div className="p-16 pb-8 flex items-start justify-between">
              <div className={`text-sm ${cardTheme.accentColor}`}>
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className={`text-right ${cardTheme.accentColor} font-bold text-2xl flex items-center justify-end gap-2`}>
                <span className="text-3xl">{cardTheme.icon}</span>
                <span>{cardTheme.hashtag}</span>
              </div>
            </div>

            {/* Company Info with Logo */}
            <div className="px-16">
              <div className="flex items-center gap-6 mb-12">
                {listing.companyId?.logo && (
                  <img 
                    src={listing.companyId.logo} 
                    alt="Company Logo" 
                    className="w-24 h-24 rounded-2xl object-contain bg-white shadow-xl border-2 border-gray-200"
                    crossOrigin="anonymous"
                  />
                )}
                <h1 className="text-7xl font-bold text-gray-900 leading-tight">
                  {listing.companyId?.scriptName || listing.companyId?.name || listing.companyName}
                </h1>
              </div>

              {/* Category Badge */}
              <div className={`inline-block ${cardTheme.badgeBg} ${cardTheme.badgeText} px-8 py-3 rounded-full text-2xl font-semibold mb-16`}>
                {listing.companyId?.sector || 'Unlisted Share'}
              </div>

              {/* Connecting Message */}
              <div className={`bg-gradient-to-r ${cardTheme.priceBoxGradient} rounded-2xl p-8 mb-12 border-2 ${cardTheme.badgeBg} shadow-lg`}>
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{isBuyListing ? '💰' : '🚀'}</span>
                  <div className="flex-1">
                    <p className="text-2xl text-gray-800 leading-relaxed font-medium">
                      {isBuyListing ? (
                        <>Hi! I am looking to buy <span className={`font-bold ${cardTheme.accentColor}`}>{listing.companyId?.scriptName || listing.companyId?.name || listing.companyName}</span> unlisted shares. Sellers can contact me on <span className="font-bold text-blue-600">NListPlanet.com</span></>
                      ) : (
                        <>Hi! I am selling <span className={`font-bold ${cardTheme.accentColor}`}>{listing.companyId?.scriptName || listing.companyId?.name || listing.companyName}</span> unlisted shares. Interested buyers can contact me on <span className="font-bold text-blue-600">NListPlanet.com</span></>
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-300">
                      <div className="text-xl text-gray-700 font-semibold">@{listing.userId?.username || listing.username || 'trader'}</div>
                      <div className="text-xl text-green-600 font-semibold">✓ Verified Trader</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Highlights */}
              <div className={`bg-white rounded-3xl p-12 mb-12 border-2 border-gray-200 shadow-lg`}>
                <div className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <span>🚀</span> Growth & Brand Focused
                </div>
                <div className="space-y-5">
                  {/* Company Description/Analysis */}
                  {listing.companyId?.description && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-200">
                      <p className="text-xl text-gray-800 leading-relaxed italic">
                        {listing.companyId.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Highlights List */}
                  {(listing.companyId?.highlights && listing.companyId.highlights.length > 0) ? (
                    listing.companyId.highlights.slice(0, 5).map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-2xl flex-shrink-0`}>
                          {idx + 1}
                        </div>
                        <div className="text-2xl text-gray-800 leading-relaxed pt-1">{highlight}</div>
                      </div>
                    ))
                  ) : (
                    <>
                      {listing.companyId?.sector && (
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-2xl flex-shrink-0`}>1</div>
                          <div className="text-2xl text-gray-800 leading-relaxed pt-1">{listing.companyId.sector} Sector Leader</div>
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-2xl flex-shrink-0`}>2</div>
                        <div className="text-2xl text-gray-800 leading-relaxed pt-1">Pre-IPO Investment Opportunity</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-2xl flex-shrink-0`}>3</div>
                        <div className="text-2xl text-gray-800 leading-relaxed pt-1">Verified Trading on NlistPlanet</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-2xl flex-shrink-0`}>4</div>
                        <div className="text-2xl text-gray-800 leading-relaxed pt-1">Direct Peer-to-Peer Trading Platform</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Footer with Statutory Warning and Logo */}
            <div className="px-16 pb-16">
              {/* Statutory Warning */}
              <div className="bg-red-50 border-l-4 border-red-500 p-8 mb-8 rounded-lg">
                <p className="text-xl text-red-800 font-semibold leading-relaxed">
                  ⚠️ Statutory Warning: Unlisted shares are subject to market risks. Please do your own research before investing. Past performance is not indicative of future results.
                </p>
              </div>

              {/* Footer with NlistPlanet Logo */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl text-gray-500 font-medium">nlistplanet.com</div>
                  <div className="text-lg text-gray-400 mt-1">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-16 h-16 rounded-full ${cardTheme.badgeBg} flex items-center justify-center`}>
                    <span className={`text-4xl font-bold ${cardTheme.badgeText}`}>N</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-700">NlistPlanet</div>
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            disabled={loading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 size={16} />
            {loading ? 'Loading...' : 'Share'}
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
          </button>
        </div>

        {/* Caption Preview - Compact */}
        {shareData && (
          <div className="mt-3 bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-400">Caption:</div>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareData.caption);
                  setCopied(true);
                  toast.success('Caption copied!');
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-xs"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-300 line-clamp-3">{shareData.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCardGenerator;
