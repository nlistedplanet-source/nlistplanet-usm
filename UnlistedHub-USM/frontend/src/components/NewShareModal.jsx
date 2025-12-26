import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Download, X, Copy, Check, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../utils/api';

const NewShareModal = ({ listing, onClose }) => {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateShareData();
  }, []);

  const generateShareData = async () => {
    try {
      const response = await axios.post('/share/create', { listingId: listing._id });
      setShareData(response.data.data);
      return response.data.data;
    } catch (error) {
      const companyName = listing.companyId?.name || listing.companyId?.CompanyName || listing.companyName || 'Company';
      const sector = listing.companyId?.sector || listing.companyId?.Sector || 'Unlisted Share';
      const highlights = listing.companyId?.highlights || ['Pre-IPO Investment', 'Verified Trading', 'Secure Platform'];
      const fallbackData = {
        shareId: `share_${Date.now()}`,
        shareUrl: `${window.location.origin}/listing/${listing._id}`,
        caption: `💎 ${companyName}\n📊 ${sector}\n\n✨ Highlights:\n${highlights.slice(0, 3).map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\n🔗 ${window.location.origin}/listing/${listing._id}\n\n#UnlistedShares #NlistPlanet`
      };
      setShareData(fallbackData);
      return fallbackData;
    }
  };

  const generateCardImage = async () => {
    if (!cardRef.current) return null;
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      toast.error('Failed to generate image');
      return null;
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const data = shareData || await generateShareData();
      const imageDataUrl = await generateCardImage();
      if (!imageDataUrl) { setLoading(false); return; }

      const blob = await (await fetch(imageDataUrl)).blob();
      const file = new File([blob], `nlistplanet-share.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'NlistPlanet', text: data.caption, files: [file] });
        toast.success('Shared!');
      } else {
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = 'nlistplanet-share.png';
        link.click();
        await navigator.clipboard.writeText(data.caption);
        toast.success('Downloaded & caption copied!');
      }
      onClose();
    } catch (e) {
      if (e.name !== 'AbortError') toast.error('Share failed');
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    setLoading(true);
    const imageDataUrl = await generateCardImage();
    if (imageDataUrl) {
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = 'nlistplanet-share.png';
      link.click();
      toast.success('Downloaded!');
    }
    setLoading(false);
  };

  const copyCaption = async () => {
    if (shareData?.caption) {
      await navigator.clipboard.writeText(shareData.caption);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const companyName = listing.companyId?.scriptName || listing.companyId?.name || listing.companyId?.CompanyName || listing.companyName || 'Company';
  const sector = listing.companyId?.sector || listing.companyId?.Sector || 'Unlisted Share';
  const logo = listing.companyId?.logo || listing.companyId?.Logo;
  const highlights = listing.companyId?.highlights || ['Pre-IPO Investment Opportunity', 'Verified on NlistPlanet', 'Secure P2P Trading'];
  const username = listing.userId?.username || 'trader';
  const isBuy = listing.type === 'buy';

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl w-full max-w-sm p-3 relative border border-gray-700 my-2">
        
        {/* Close */}
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white z-10">
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Share2 className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Share Listing</h3>
            <p className="text-xs text-gray-400">Create & share your card</p>
          </div>
        </div>

        {/* Card Preview Container */}
        <div className="mb-3 bg-gray-800 rounded-xl p-2 overflow-hidden">
          <div 
            ref={cardRef}
            className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 text-gray-900"
            style={{ width: '100%', minHeight: '280px' }}
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className={`text-xs font-semibold ${isBuy ? 'text-emerald-600' : 'text-orange-600'}`}>
                {isBuy ? '💰 #BuyingOpportunity' : '🚀 #UnlistedShares'}
              </span>
            </div>

            {/* Company Info */}
            <div className="flex items-center gap-2 mb-3">
              {logo && <img src={logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white border" crossOrigin="anonymous" />}
              <div>
                <h2 className="text-lg font-bold text-gray-900">{companyName}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{sector}</span>
              </div>
            </div>

            {/* Message */}
            <div className={`rounded-lg p-3 mb-3 ${isBuy ? 'bg-emerald-50 border border-emerald-200' : 'bg-orange-50 border border-orange-200'}`}>
              <p className="text-sm text-gray-700">
                {isBuy ? '💰 ' : '🚀 '}
                {isBuy ? 'Looking to buy' : 'Selling'} <span className={`font-semibold ${isBuy ? 'text-emerald-700' : 'text-orange-700'}`}>{companyName}</span> unlisted shares. Contact on <span className="font-semibold text-blue-600">NListPlanet.com</span>
              </p>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-600">@{username}</span>
                <span className="text-xs text-green-600">✓ Verified</span>
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">🚀 Highlights</div>
              <div className="space-y-1">
                {highlights.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center flex-shrink-0 ${isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{i + 1}</span>
                    <span className="text-xs text-gray-700">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-400">nlistplanet.com</div>
              <div className={`text-sm font-bold ${isBuy ? 'text-emerald-600' : 'text-orange-600'}`}>NlistPlanet</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleShare}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : <Share2 size={14} />}
            Share
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Download size={14} />
            Download
          </button>
        </div>

        {/* Caption */}
        {shareData && (
          <div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Caption</span>
              <button onClick={copyCaption} className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-300 line-clamp-2">{shareData.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewShareModal;
