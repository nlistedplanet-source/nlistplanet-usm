import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Download, X, Copy, Check, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../utils/api';
import { calculateBuyerPays } from '../utils/helpers';

const NewShareModal = ({ listing, onClose }) => {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);

  // Generate share data on mount
  useEffect(() => {
    generateShareData();
  }, []);

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
        caption: `💎 Premium Investment Opportunity\n\n🏢 ${companyName}\n📊 ${sector}\n\n✨ Investment Highlights:\n${highlightsList}\n\n👉 Explore: ${window.location.origin}/listing/${listing._id}\n\n🔒 Verified Trading on NlistPlanet\n\n#UnlistedShares #Investment #PreIPO #${sector.replace(/\s+/g, '')} #NlistPlanet`
      };
      setShareData(fallbackData);
      toast.error('Using offline mode');
      return fallbackData;
    } finally {
      setLoading(false);
    }
  };

  const generateCardImage = async () => {
    if (!cardRef.current) return null;

    try {
      setImageGenerated(false);
      await document.fonts.ready;
      
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '1080px';
      container.style.height = '1080px';
      
      const clonedCard = cardRef.current.cloneNode(true);
      clonedCard.style.transform = 'scale(1)';
      clonedCard.style.width = '1080px';
      clonedCard.style.height = '1080px';
      
      container.appendChild(clonedCard);
      document.body.appendChild(container);

      const images = clonedCard.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(clonedCard, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 1080,
        height: 1080,
        windowWidth: 1080,
        windowHeight: 1080
      });

      document.body.removeChild(container);
      setImageGenerated(true);
      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Card generation error:', error);
      toast.error('Failed to generate card');
      return null;
    }
  };

  const handleShare = async () => {
    try {
      setLoading(true);

      let data = shareData;
      if (!data) {
        data = await generateShareData();
        if (!data) return;
      }

      const imageDataUrl = await generateCardImage();
      if (!imageDataUrl) return;

      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `nlistplanet-${listing.companyId?.name || listing.companyName || 'share'}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${listing.companyId?.name || listing.companyName} - NlistPlanet`,
          text: data.caption,
          files: [file]
        });
        toast.success('Shared successfully!');
      } else {
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = `nlistplanet-${listing.companyId?.name || listing.companyName || 'share'}.png`;
        link.click();
        
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

  const isBuyListing = listing.type === 'buy';
  const cardTheme = isBuyListing ? {
    gradient: 'from-emerald-50 to-teal-50',
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    icon: '💰',
    hashtag: '#InvestmentOpportunity'
  } : {
    gradient: 'from-orange-50 to-amber-50',
    accentColor: 'text-orange-600',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    icon: '🚀',
    hashtag: '#UnlistedShares'
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl border border-gray-700 animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-700/50 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
            <Share2 className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Share Listing</h3>
            <p className="text-sm text-gray-400">Create your investment card</p>
          </div>
        </div>

        {/* Card Preview */}
        <div className="mb-6 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700" style={{ aspectRatio: '1/1' }}>
          <div className="relative w-full h-full">
            <div 
              ref={cardRef} 
              className={`bg-gradient-to-br ${cardTheme.gradient}`}
              style={{ 
                width: '1080px', 
                height: '1080px',
                transform: 'scale(0.36)',
                transformOrigin: 'top left',
                position: 'absolute'
              }}
            >
              {/* Card Header */}
              <div className="p-16 pb-8 flex items-start justify-between">
                <div className={`text-sm ${cardTheme.accentColor}`}>
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className={`text-right ${cardTheme.accentColor} font-bold text-2xl flex items-center gap-2`}>
                  <span className="text-3xl">{cardTheme.icon}</span>
                  <span>{cardTheme.hashtag}</span>
                </div>
              </div>

              {/* Company Info */}
              <div className="px-16">
                <div className="flex items-center gap-6 mb-12">
                  {listing.companyId?.logo && (
                    <img 
                      src={listing.companyId.logo} 
                      alt="Logo" 
                      className="w-24 h-24 rounded-2xl object-contain bg-white shadow-xl border-2 border-gray-200"
                      crossOrigin="anonymous"
                    />
                  )}
                  <h1 className="text-7xl font-bold text-gray-900 leading-tight">
                    {listing.companyId?.scriptName || listing.companyId?.name || listing.companyName}
                  </h1>
                </div>

                <div className={`inline-block ${cardTheme.badgeBg} ${cardTheme.badgeText} px-8 py-3 rounded-full text-2xl font-semibold mb-16`}>
                  {listing.companyId?.sector || 'Unlisted Share'}
                </div>

                {/* Message Box */}
                <div className={`bg-gradient-to-r from-teal-100 to-emerald-100 rounded-2xl p-8 mb-12 border-2 ${cardTheme.badgeBg} shadow-lg`}>
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

                {/* Highlights */}
                <div className="bg-white rounded-3xl p-12 mb-12 border-2 border-gray-200 shadow-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <span>🚀</span> Growth & Brand Focused
                  </div>
                  <div className="space-y-5">
                    {(listing.companyId?.highlights && listing.companyId.highlights.length > 0) ? (
                      listing.companyId.highlights.slice(0, 4).map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-2xl flex-shrink-0`}>
                            {idx + 1}
                          </div>
                          <div className="text-2xl text-gray-800 leading-relaxed pt-1">{highlight}</div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-2xl`}>1</div>
                          <div className="text-2xl text-gray-800 leading-relaxed pt-1">Pre-IPO Investment Opportunity</div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full ${cardTheme.badgeBg} ${cardTheme.badgeText} flex items-center justify-center font-bold text-2xl`}>2</div>
                          <div className="text-2xl text-gray-800 leading-relaxed pt-1">Verified Trading on NlistPlanet</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-16 pb-16">
                <div className="bg-red-50 border-l-4 border-red-500 p-8 mb-8 rounded-lg">
                  <p className="text-xl text-red-800 font-semibold leading-relaxed">
                    ⚠️ Statutory Warning: Unlisted shares are subject to market risks. Please do your own research before investing.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl text-gray-500 font-medium">nlistplanet.com</div>
                    <div className="text-lg text-gray-400 mt-1">{new Date().toLocaleDateString('en-IN')}</div>
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

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleShare}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <Share2 size={18} />}
            Share
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <Download size={18} />
            Download
          </button>
        </div>

        {/* Caption */}
        {shareData && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caption Preview</div>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareData.caption);
                  setCopied(true);
                  toast.success('Caption copied!');
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">{shareData.caption}</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NewShareModal;
