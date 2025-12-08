import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  ChevronRight,
  Newspaper,
  ArrowRight,
  Calendar,
  ExternalLink,
  TrendingUp,
  Flame,
  Globe
} from 'lucide-react';
import axios from 'axios';
import TopBar from '../components/TopBar';

// API_BASE should be base URL without /api suffix
const API_BASE = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, '') || 'https://nlistplanet-usm-v8dc.onrender.com';

const BlogPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Category colors
  const categoryColors = {
    'IPO': 'bg-purple-500',
    'Market': 'bg-blue-500',
    'Company': 'bg-green-500',
    'Unlisted': 'bg-amber-500',
    'Pre-IPO': 'bg-rose-500',
    'Analysis': 'bg-indigo-500',
    'General': 'bg-gray-500'
  };

  // Fetch news
  const fetchNews = async (page = 1, category = 'all', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(category !== 'all' && { category }),
        ...(search && { search })
      });

      const response = await axios.get(`${API_BASE}/api/news?${params}`);
      
      if (response.data.success) {
        setNews(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured news
  const fetchFeatured = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/news/featured?limit=3`);
      if (response.data.success) {
        setFeaturedNews(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch featured:', error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/news/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchFeatured();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchNews(currentPage, selectedCategory, searchQuery);
  }, [currentPage, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNews(1, selectedCategory, searchQuery);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchParams(category !== 'all' ? { category } : {});
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-IN', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Inshorts-style News Card
  const InshortsCard = ({ item }) => {
    const categoryColor = categoryColors[item.category] || categoryColors['General'];
    
    // Use Hindi title and summary if available
    const displayTitle = item.hindiTitle || item.title;
    const displaySummary = item.hindiSummary || item.summary;
    
    // Extract source name from sourceUrl or use default
    const getSourceName = (url) => {
      if (!url) return 'NlistPlanet';
      try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '').split('.')[0].charAt(0).toUpperCase() + 
               hostname.replace('www.', '').split('.')[0].slice(1);
      } catch {
        return 'NlistPlanet';
      }
    };
    
    const sourceName = item.source || getSourceName(item.sourceUrl);

    return (
      <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
        {/* Image Section */}
        <div 
          onClick={() => navigate(`/blog/${item._id}`)}
          className="relative h-48 overflow-hidden cursor-pointer"
        >
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full ${categoryColor} flex items-center justify-center`}>
              <Newspaper size={48} className="text-white/50" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${categoryColor}`}>
            {item.category}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Hindi Headline */}
          <h3 
            onClick={() => navigate(`/blog/${item._id}`)}
            className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors leading-snug"
          >
            {displayTitle}
          </h3>
          
          {/* Hindi Summary - 60 words style */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
            {displaySummary}
          </p>

          {/* Footer: Date & Source */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* Date */}
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Calendar size={14} />
              <span>{formatDate(item.publishedAt)}</span>
            </div>
            
            {/* Source - Clickable */}
            {item.sourceUrl ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold hover:text-emerald-700 transition-colors"
              >
                <span>{sourceName}</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <span className="text-gray-400 text-xs">NlistPlanet</span>
            )}
          </div>
        </div>
      </article>
    );
  };

  // Featured Card - Large Inshorts style
  const FeaturedCard = ({ item, index }) => {
    const categoryColor = categoryColors[item.category] || categoryColors['General'];
    const displayTitle = item.hindiTitle || item.title;
    const displaySummary = item.hindiSummary || item.summary;
    
    const getSourceName = (url) => {
      if (!url) return 'NlistPlanet';
      try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '').split('.')[0].charAt(0).toUpperCase() + 
               hostname.replace('www.', '').split('.')[0].slice(1);
      } catch {
        return 'NlistPlanet';
      }
    };
    
    const sourceName = item.source || getSourceName(item.sourceUrl);

    return (
      <article 
        onClick={() => navigate(`/blog/${item._id}`)}
        className={`relative rounded-2xl overflow-hidden cursor-pointer group ${
          index === 0 ? 'md:col-span-2 md:row-span-2' : ''
        }`}
      >
        <div className={`relative ${index === 0 ? 'h-80 md:h-full min-h-[400px]' : 'h-52'}`}>
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className={`w-full h-full ${categoryColor} flex items-center justify-center`}>
              <Newspaper size={64} className="text-white/30" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
          {/* Trending Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${categoryColor}`}>
              {item.category}
            </span>
            {index === 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center gap-1">
                <Flame size={12} />
                Trending
              </span>
            )}
          </div>
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className={`font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors leading-snug ${
              index === 0 ? 'text-2xl md:text-3xl' : 'text-lg'
            }`}>
              {displayTitle}
            </h3>
            
            <p className={`text-gray-300 mb-3 leading-relaxed ${
              index === 0 ? 'line-clamp-3 text-base' : 'line-clamp-2 text-sm'
            }`}>
              {displaySummary}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <Calendar size={12} />
                {formatDate(item.publishedAt)}
              </span>
              {item.sourceUrl ? (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-emerald-400 text-xs font-semibold hover:text-emerald-300 flex items-center gap-1"
                >
                  {sourceName}
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-gray-500 text-xs">NlistPlanet</span>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 mb-2">
                <Newspaper size={14} className="text-emerald-400" />
                <span className="text-emerald-300 text-sm font-medium">NlistPlanet News</span>
              </div>
              <h1 className="text-2xl font-bold">Latest Market News</h1>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All News
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.name
                    ? `${categoryColors[cat.name] || 'bg-gray-500'} text-white shadow-md`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
                <span className="text-xs opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Section */}
        {featuredNews.length > 0 && selectedCategory === 'all' && currentPage === 1 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="text-emerald-500" size={22} />
              <h2 className="text-xl font-bold text-gray-900">Trending</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredNews.map((item, index) => (
                <FeaturedCard key={item._id} item={item} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* News Grid - Inshorts Style */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'Latest News' : `${selectedCategory} News`}
            </h2>
            <span className="text-gray-500 text-sm">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-full bg-gray-200 rounded" />
                    <div className="h-5 w-3/4 bg-gray-200 rounded" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gray-100 rounded" />
                      <div className="h-3 w-5/6 bg-gray-100 rounded" />
                      <div className="h-3 w-4/6 bg-gray-100 rounded" />
                    </div>
                    <div className="flex justify-between pt-3">
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl">
              <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No news found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <InshortsCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            Ready to Trade Unlisted Shares?
          </h2>
          <p className="text-emerald-100 mb-5 text-sm">
            Join NlistPlanet and access exclusive pre-IPO investment opportunities.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg text-sm"
          >
            Explore Marketplace
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
