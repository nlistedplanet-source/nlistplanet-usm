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
        useCORS: true
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
            <div className="p-16 pb-8">
              <div className={`text-sm ${cardTheme.accentColor} mb-4`}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div className={`text-right ${cardTheme.accentColor} font-bold text-2xl flex items-center justify-end gap-2`}>
                <span className="text-3xl">{cardTheme.icon}</span>
                <span>{cardTheme.hashtag}</span>
              </div>
            </div>

            {/* Company Info */}
            <div className="px-16">
              <h1 className="text-7xl font-bold text-gray-900 leading-tight mb-12">
                {listing.companyId?.name || listing.companyId?.scriptName || listing.companyName}
              </h1>

              {/* Category Badge */}
              <div className={`inline-block ${cardTheme.badgeBg} ${cardTheme.badgeText} px-8 py-3 rounded-full text-2xl font-semibold mb-16`}>
                {listing.companyId?.sector || 'Unlisted Share'}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4 mb-16">
                <div className="text-2xl text-gray-600">@{listing.userId?.username || listing.username || 'trader'}</div>
                <div className="text-2xl text-green-600">✓ Verified</div>
              </div>

              {/* Company Highlights */}
              <div className={`bg-gradient-to-r ${cardTheme.priceBoxGradient} rounded-3xl p-12 mb-16`}>
                <div className="text-2xl font-bold text-gray-900 mb-6">Investment Highlights</div>
                <div className="space-y-4">
                  {(listing.companyId?.highlights && listing.companyId.highlights.length > 0) ? (
                    listing.companyId.highlights.slice(0, 4).map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-xl flex-shrink-0`}>
                          {idx + 1}
                        </div>
                        <div className="text-2xl text-gray-800 leading-relaxed">{highlight}</div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-xl flex-shrink-0`}>
                          ✓
                        </div>
                        <div className="text-2xl text-gray-800 leading-relaxed">Pre-IPO Investment Opportunity</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-xl flex-shrink-0`}>
                          ✓
                        </div>
                        <div className="text-2xl text-gray-800 leading-relaxed">Verified on NlistPlanet</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-xl flex-shrink-0`}>
                          ✓
                        </div>
                        <div className="text-2xl text-gray-800 leading-relaxed">{listing.companyId?.sector || 'Unlisted Share'} Sector</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-xl flex-shrink-0`}>
                          ✓
                        </div>
                        <div className="text-2xl text-gray-800 leading-relaxed">Direct Peer-to-Peer Trading</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-2xl text-gray-700 mb-16 leading-relaxed">
                {cardTheme.description}
              </p>
            </div>

            {/* Footer */}
            <div className="px-16 pb-16">
              <div className="text-xl text-gray-500">nlistplanet.com/share/{listing._id?.substring(0, 6)}</div>
              <div className="text-xl text-gray-400 mt-2">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
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
