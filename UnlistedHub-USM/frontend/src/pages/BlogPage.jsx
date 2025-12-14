import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, ExternalLink, BookOpen, Search, Filter } from 'lucide-react';

const BlogPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Get base API URL
  const getBaseUrl = () => {
    const envUrl = process.env.REACT_APP_API_URL || 'https://nlistplanet-usm-v8dc.onrender.com/api';
    return envUrl.replace(/\/api\/?$/, '');
  };
  const BASE_URL = getBaseUrl();

  const categories = ['All', 'IPO', 'Market', 'Unlisted', 'Startup', 'Regulatory'];

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [activeCategory, searchQuery, news]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/news?limit=100`);
      
      if (!response.ok) throw new Error('Failed to fetch news');
      
      const data = await response.json();
      setNews(data.data || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Unable to load news');
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = news;

    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(article => article.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title?.toLowerCase().includes(query) ||
        article.summary?.toLowerCase().includes(query) ||
        article.category?.toLowerCase().includes(query)
      );
    }

    setFilteredNews(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-IN', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'IPO': 'bg-purple-500',
      'Market': 'bg-blue-500',
      'Unlisted': 'bg-emerald-500',
      'Startup': 'bg-orange-500',
      'Analysis': 'bg-cyan-500',
      'Regulatory': 'bg-red-500',
      'Company': 'bg-indigo-500',
      'General': 'bg-gray-500'
    };
    return colors[category] || colors['General'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 mb-2">{error}</p>
          <button
            onClick={fetchNews}
            className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium mt-4 hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                <img 
                  src="/new_logo.png" 
                  alt="NlistPlanet" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <h1 className="text-white font-bold text-xl">Market News</h1>
                  <p className="text-gray-500 text-xs">{filteredNews.length} articles</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="pb-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeCategory === category
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* News Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No articles found</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article) => (
              <article
                key={article._id}
                className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                {/* Thumbnail - Clean, no badges */}
                <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                  {article.thumbnail ? (
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { 
                        e.target.src = '';
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-700" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Editor Headline (newspaper style) */}
                  <h2 
                    onClick={() => setSelectedArticle(article)}
                    className="text-white font-bold text-lg leading-tight mb-3 line-clamp-2 group-hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {article.editorHeadline || article.title}
                  </h2>

                  {/* Editor Crux (newspaper style summary) */}
                  <p 
                    onClick={() => setSelectedArticle(article)}
                    className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 cursor-pointer"
                  >
                    {article.editorCrux || article.summary}
                  </p>

                  {/* Footer with Category Tag & Source */}
                  <div className="flex items-center justify-between text-gray-500 text-xs pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                      {/* Category Tag at Bottom */}
                      <span className={`${getCategoryColor(article.category)} text-white text-[10px] font-bold px-2 py-1 rounded-md`}>
                        {article.category}
                      </span>
                      <span className="text-gray-600">•</span>
                      <Calendar size={14} />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    
                    {article.sourceUrl && (
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        {article.sourceName || 'Source'}
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Full Article Modal */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className={`${getCategoryColor(selectedArticle.category)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {selectedArticle.category}
                </span>
                <span className="text-gray-500 text-sm">{selectedArticle.sourceName}</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              {/* Thumbnail */}
              {selectedArticle.thumbnail && (
                <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden mb-6">
                  <img
                    src={selectedArticle.thumbnail}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Editor Headline */}
              <h1 className="text-white font-bold text-2xl leading-tight mb-2">
                {selectedArticle.editorHeadline || selectedArticle.title}
              </h1>

              {/* Original Title (if different) */}
              {selectedArticle.editorHeadline && selectedArticle.editorHeadline !== selectedArticle.title && (
                <p className="text-gray-500 text-sm mb-4 italic">Original: {selectedArticle.title}</p>
              )}

              {/* Date */}
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                <Calendar size={16} />
                <span>{formatDate(selectedArticle.publishedAt)}</span>
              </div>

              {/* Editor Crux (Newspaper Style) */}
              {selectedArticle.editorCrux && (
                <div className="mb-6 bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                  <h3 className="text-emerald-400 font-semibold text-xs mb-2 uppercase tracking-wider">Editor's Brief</h3>
                  <p className="text-gray-200 text-base leading-relaxed font-medium">
                    {selectedArticle.editorCrux}
                  </p>
                </div>
              )}

              {/* Full Original Summary */}
              <div className="mb-6">
                <h3 className="text-gray-400 font-semibold text-sm mb-2 uppercase tracking-wider">Full Story</h3>
                <p className="text-gray-300 text-base leading-relaxed">
                  {selectedArticle.summary}
                </p>
              </div>

              {/* Hindi Summary */}
              {selectedArticle.hindiSummary && (
                <div className="bg-gray-800/50 rounded-xl p-5 mb-6 border border-gray-700">
                  <h3 className="text-emerald-400 font-semibold text-sm mb-3 uppercase tracking-wider">हिंदी सारांश</h3>
                  <p className="text-gray-300 text-base leading-relaxed font-hindi">
                    {selectedArticle.hindiSummary}
                  </p>
                </div>
              )}

              {/* Source Link */}
              {selectedArticle.sourceUrl && (
                <a
                  href={selectedArticle.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                >
                  Read Full Article on {selectedArticle.sourceName}
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
