import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Calendar,
  Share2,
  Bookmark,
  ExternalLink,
  Tag,
  Newspaper,
  Loader,
  ChevronRight,
  User
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import TopBar from '../components/TopBar';

// API_BASE should be base URL without /api suffix
const API_BASE = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, '') || 'https://nlistplanet-usm-v8dc.onrender.com';

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/news/${id}`);
        
        if (response.data.success) {
          setArticle(response.data.data);
          setRelatedNews(response.data.related || []);
        }
      } catch (error) {
        console.error('Failed to fetch article:', error);
        toast.error('Failed to load article');
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
      window.scrollTo(0, 0);
    }
  }, [id, navigate]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'IPO': 'bg-purple-100 text-purple-700 border-purple-200',
      'Market': 'bg-blue-100 text-blue-700 border-blue-200',
      'Company': 'bg-green-100 text-green-700 border-green-200',
      'Unlisted': 'bg-amber-100 text-amber-700 border-amber-200',
      'Pre-IPO': 'bg-rose-100 text-rose-700 border-rose-200',
      'Analysis': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'General': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || colors['General'];
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `${article.title} - Read on NlistPlanet Blog`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: shareText,
          url: shareUrl
        });
      } catch (e) {
        if (e.name !== 'AbortError') {
          navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Article not found</h2>
          <button
            onClick={() => navigate('/blog')}
            className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <TopBar />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => navigate('/blog')}
              className="text-gray-500 hover:text-emerald-600 flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Blog
            </button>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-700 truncate">{article.title.substring(0, 50)}...</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border mb-4 ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-6">
            <span className="flex items-center gap-1.5">
              <User size={16} />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={16} />
              {formatDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              {article.readTime} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={16} />
              {article.views} views
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Share2 size={18} />
              Share
            </button>
            {article.sourceUrl && article.sourceName !== 'NlistPlanet' && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ExternalLink size={18} />
                Source: {article.sourceName}
              </a>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {article.thumbnail && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        {/* Summary - Highlighted */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-6 rounded-r-xl mb-8">
          <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-2">Summary</h2>
          <p className="text-gray-800 text-lg leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Full Content */}
        {article.content && (
          <div className="prose prose-lg max-w-none mb-8">
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }}
            />
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 pt-6 border-t border-gray-200">
            <Tag size={18} className="text-gray-400" />
            {article.tags.map((tag, idx) => (
              <span 
                key={idx}
                onClick={() => navigate(`/blog?search=${tag}`)}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>Disclaimer:</strong> This article is for informational purposes only and does not constitute 
            financial advice. Unlisted shares carry high risk. Always do your own research before investing.
          </p>
        </div>
      </article>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedNews.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/blog/${item._id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="h-32 overflow-hidden">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Newspaper size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-2">
                      {formatDate(item.publishedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Interested in Unlisted Shares?
          </h2>
          <p className="text-gray-300 mb-6">
            Trade pre-IPO shares on NlistPlanet marketplace
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors"
          >
            Explore Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
