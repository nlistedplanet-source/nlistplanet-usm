import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ShareCardGenerator = ({ listing, onClose }) => {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);

  // Generate share link and caption
  const generateShareData = async () => {
    try {
      setLoading(true);
      const response = await api.post('/share/create', {
        listingId: listing._id
      });
      setShareData(response.data.data);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to generate share link');
      console.error(error);
      return null;
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
        link.download = `nlistplanet-${listing.company?.name || 'share'}.png`;
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
      link.download = `nlistplanet-${listing.company?.name || 'share'}.png`;
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold text-white mb-4">Share Listing</h3>

        {/* Share Card - 1080x1080px Instagram format */}
        <div className="mb-4">
          <div 
            ref={cardRef} 
            className="w-full aspect-square bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl overflow-hidden"
            style={{ width: '1080px', height: '1080px', transform: 'scale(0.35)', transformOrigin: 'top left' }}
          >
            {/* Card Header */}
            <div className="p-16 pb-8">
              <div className="text-sm text-orange-600 mb-4">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div className="text-right text-orange-600 font-bold text-2xl">#UnlistedShare</div>
            </div>

            {/* Company Info */}
            <div className="px-16">
              <h1 className="text-7xl font-bold text-gray-900 leading-tight mb-12">
                {listing.company?.name || listing.companyName}
              </h1>

              {/* Category Badge */}
              <div className="inline-block bg-orange-100 text-orange-800 px-8 py-3 rounded-full text-2xl font-semibold mb-16">
                {listing.company?.sector || 'Unlisted Share'}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4 mb-16">
                <div className="text-2xl text-gray-600">@{listing.user?.username || 'trader'}</div>
                <div className="text-2xl text-green-600">✓ Verified</div>
              </div>

              {/* Price Box */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-3xl p-12 mb-16">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-2xl text-gray-600 mb-2">Ask Price</div>
                    <div className="text-7xl font-bold text-red-600">₹{listing.price}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl text-gray-600 mb-2">Quantity</div>
                    <div className="text-7xl font-bold text-gray-900">
                      {listing.quantity >= 100000 
                        ? `${(listing.quantity / 100000).toFixed(1)}L` 
                        : listing.quantity >= 1000
                        ? `${(listing.quantity / 1000).toFixed(1)}K`
                        : listing.quantity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-2xl text-gray-700 mb-16 leading-relaxed">
                Check out this unlisted share of {listing.company?.name || listing.companyName} listed on Nlist Planet. Explore more and make your offer now!
              </p>
            </div>

            {/* Footer */}
            <div className="px-16 pb-16">
              <div className="text-xl text-gray-500">nlistplanet.com/share/{listing._id?.substring(0, 6)}</div>
              <div className="text-xl text-gray-400 mt-2">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            disabled={loading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 size={18} />
            {loading ? 'Generating...' : 'Share'}
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
        </div>

        {/* Caption Preview */}
        {shareData && (
          <div className="mt-4 bg-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-2">Caption (will be copied):</div>
            <p className="text-sm text-gray-300 whitespace-pre-line">{shareData.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCardGenerator;
