import React from 'react';
import { Calendar, ExternalLink, Share2 } from 'lucide-react';

/**
 * InshortsNewsCard - Vertical swipe-style news card
 * Shows Hindi summary with image, like Inshorts app
 */
const InshortsNewsCard = ({ article, onShare }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('hi-IN', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'IPO': 'bg-purple-500',
      'Market': 'bg-blue-500',
      'Unlisted': 'bg-emerald-500',
      'Startup': 'bg-orange-500',
      'Regulatory': 'bg-red-500',
      'Company': 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      'IPO': 'from-purple-600 to-purple-800',
      'Market': 'from-blue-600 to-blue-800',
      'Unlisted': 'from-emerald-600 to-emerald-800',
      'Startup': 'from-orange-600 to-orange-800',
      'Regulatory': 'from-red-600 to-red-800',
      'Company': 'from-indigo-600 to-indigo-800'
    };
    return gradients[category] || 'from-gray-600 to-gray-800';
  };

  const handleShare = () => {
    if (onShare) {
      onShare(article);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-950 snap-start">
      {/* Image Section - Top 45% */}
      <div className={`h-[45%] relative bg-gradient-to-br ${getCategoryGradient(article.category)} overflow-hidden`}>
        {article.thumbnail ? (
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white/20 text-6xl font-bold">
              {article.category}
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`${getCategoryColor(article.category)} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
            {article.category}
          </span>
        </div>

        {/* Source Badge */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <span className="text-white text-xs font-medium">{article.sourceName}</span>
        </div>

        {/* Inshorts Logo Style Indicator */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <div className="w-1 h-8 bg-emerald-400 rounded-full"></div>
            <div className="w-1 h-6 bg-emerald-400/60 rounded-full"></div>
            <div className="w-1 h-4 bg-emerald-400/30 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Content Section - Bottom 55% */}
      <div className="h-[55%] bg-gray-950 px-5 py-4 flex flex-col overflow-hidden">
        {/* English Title */}
        <h2 className="text-white font-bold text-lg leading-tight mb-3 line-clamp-2">
          {article.title}
        </h2>

        {/* Hindi Summary (Inshorts Style) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide mb-4">
          {article.hindiSummary ? (
            <div className="space-y-3">
              <p className="text-gray-300 text-base leading-relaxed font-hindi">
                {article.hindiSummary}
              </p>
              
              {/* Divider */}
              <div className="border-t border-gray-800 pt-3">
                <p className="text-gray-400 text-sm leading-relaxed">
                  {article.summary}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-base leading-relaxed">
              {article.summary}
            </p>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-3">
          <div className="flex items-center justify-between">
            {/* Date */}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar size={16} />
              <span>{formatDate(article.publishedAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 active:scale-95 transition-all"
              >
                <Share2 size={16} />
              </button>

              {/* Read More Link */}
              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                >
                  पूरा पढ़ें
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Swipe Indicator (Optional) */}
        <div className="flex justify-center mt-2">
          <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default InshortsNewsCard;
