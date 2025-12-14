import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../utils/api';

const AdBanner = ({ position, className = '' }) => {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await api.get(`/ads?position=${position}`);
        if (response.data.success && response.data.data.length > 0) {
          setAds(response.data.data);
          // Track impression for the first ad
          trackImpression(response.data.data[0]._id);
        }
      } catch (error) {
        console.error('Failed to fetch ads:', error);
      }
    };

    fetchAds();
  }, [position]);

  // Rotate ads if multiple are available
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => {
        const nextIndex = (prev + 1) % ads.length;
        trackImpression(ads[nextIndex]._id);
        return nextIndex;
      });
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval);
  }, [ads]);

  const trackImpression = async (adId) => {
    try {
      await api.post(`/ads/${adId}/impression`);
    } catch (error) {
      // Silent fail for analytics
    }
  };

  const handleClick = async () => {
    const ad = ads[currentAdIndex];
    try {
      await api.post(`/ads/${ad._id}/click`);
      window.open(ad.targetUrl, '_blank');
    } catch (error) {
      console.error('Failed to track click:', error);
      // Still open URL even if tracking fails
      window.open(ad.targetUrl, '_blank');
    }
  };

  if (!isVisible || ads.length === 0) return null;

  const currentAd = ads[currentAdIndex];

  return (
    <div className={`relative group overflow-hidden rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Close Button (Optional - maybe only for certain positions) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
        }}
        className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X size={12} />
      </button>

      {/* Ad Content */}
      <div 
        onClick={handleClick}
        className="cursor-pointer relative w-full h-full"
      >
        <img 
          src={currentAd.imageUrl} 
          alt={currentAd.title}
          className="w-full h-full object-cover"
        />
        
        {/* Optional Overlay Text if needed */}
        {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white font-bold text-sm">{currentAd.title}</p>
        </div> */}
        
        {/* Ad Badge */}
        <span className="absolute bottom-1 right-1 bg-black/30 text-white text-[9px] px-1 rounded">
          Ad
        </span>
      </div>
    </div>
  );
};

export default AdBanner;
