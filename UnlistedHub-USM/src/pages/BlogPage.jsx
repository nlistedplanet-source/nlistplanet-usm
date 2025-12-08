import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  Eye, 
  TrendingUp, 
  ChevronRight,
  Loader,
  Filter,
  Newspaper,
  ArrowRight,
  ExternalLink,
  Calendar,
  Tag,
  BookOpen,
  Languages,
  Sparkles,
  Flame,
  BarChart3,
  Building2,
  Briefcase,
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
  const [allNews, setAllNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showHindi, setShowHindi] = useState(true); // Default to Hindi

  // Category Icons & Hindi names
  const categoryConfig = {
    'IPO': { icon: TrendingUp, hindi: 'आईपीओ', color: 'from-purple-500 to-indigo-600', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    'Market': { icon: BarChart3, hindi: 'बाज़ार', color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    'Company': { icon: Building2, hindi: 'कंपनी', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    'Unlisted': { icon: Sparkles, hindi: 'अनलिस्टेड', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    'Pre-IPO': { icon: Flame, hindi: 'प्री-आईपीओ', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
    'Analysis': { icon: Briefcase, hindi: 'विश्लेषण', color: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
    'General': { icon: Globe, hindi: 'सामान्य', color: 'from-gray-500 to-slate-600', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }
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

  // Fetch all news for section view
  const fetchAllNews = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/news?limit=50`);
      if (response.data.success) {
        setAllNews(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch all news:', error);
    }
  };

  // Fetch featured news
  const fetchFeatured = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/news/featured?limit=4`);
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
    fetchAllNews();
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
    return new Date(date).toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} मिनट पहले`;
    if (diffHours < 24) return `${diffHours} घंटे पहले`;
    if (diffDays < 7) return `${diffDays} दिन पहले`;
    return formatDate(date);
  };

  const getCategoryColor = (category) => {
    const config = categoryConfig[category] || categoryConfig['General'];
    return `${config.bg} ${config.text} ${config.border}`;
  };

  // Group news by category
  const getNewsByCategory = (categoryName) => {
    return allNews.filter(item => item.category === categoryName).slice(0, 4);
  };

  // News Card Component - Modern Design
  const NewsCard = ({ item, size = 'normal' }) => {
    const config = categoryConfig[item.category] || categoryConfig['General'];
    const IconComponent = config.icon;
    
    return (
      <article
        onClick={() => navigate(`/blog/${item._id}`)}
        className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100/50 hover:border-emerald-200 hover:-translate-y-1 ${
          size === 'large' ? 'md:col-span-2' : ''
        }`}
      >
        {/* Gradient Border Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} style={{ padding: '2px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }} />
        
        {/* Thumbnail */}
        <div className={`relative overflow-hidden ${size === 'large' ? 'h-56' : 'h-44'}`}>
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <IconComponent size={48} className="text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.bg} ${config.text} border ${config.border} backdrop-blur-sm`}>
            <IconComponent size={12} />
            {showHindi ? config.hindi : item.category}
          </div>

          {/* Time Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white">
            {getTimeAgo(item.publishedAt)}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors ${
            size === 'large' ? 'text-xl' : 'text-base'
          }`}>
            {showHindi && item.hindiTitle ? item.hindiTitle : item.title}
          </h3>
          <p className={`text-gray-600 text-sm line-clamp-2 mb-4 ${size === 'large' ? 'line-clamp-3' : ''}`}>
            {showHindi && item.hindiSummary ? item.hindiSummary : item.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-emerald-500" />
                {item.readTime} मिनट
              </span>
              <span className="flex items-center gap-1">
                <Eye size={12} className="text-blue-500" />
                {item.views || 0}
              </span>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 font-medium group-hover:translate-x-1 transition-transform">
              पढ़ें <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </article>
    );
  };

  // Category Section Component
  const CategorySection = ({ categoryName }) => {
    const categoryNews = getNewsByCategory(categoryName);
    if (categoryNews.length === 0) return null;
    
    const config = categoryConfig[categoryName] || categoryConfig['General'];
    const IconComponent = config.icon;

    return (
      <section className="mb-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-r ${config.color} text-white shadow-lg`}>
              <IconComponent size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {showHindi ? config.hindi : categoryName}
              </h2>
              <p className="text-sm text-gray-500">
                {showHindi ? `${categoryName} से जुड़ी ताज़ा खबरें` : `Latest ${categoryName} news`}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCategoryChange(categoryName)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text} hover:shadow-md transition-all`}
          >
            {showHindi ? 'सभी देखें' : 'View All'}
            <ChevronRight size={16} />
          </button>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {categoryNews.map((item, idx) => (
            <NewsCard key={item._id} item={item} size={idx === 0 ? 'large' : 'normal'} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <TopBar />
      
      {/* Hero Section - Compact */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left Side - Title */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-3">
                <Newspaper size={14} className="text-emerald-400" />
                <span className="text-emerald-300 text-sm font-medium">NlistPlanet न्यूज़</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {showHindi ? 'ताज़ा खबरें और अपडेट्स' : 'Latest News & Updates'}
              </h1>
              <p className="text-gray-400 text-sm max-w-md">
                {showHindi 
                  ? 'अनलिस्टेड शेयर्स, प्री-आईपीओ और मार्केट की ताज़ा खबरें हिंदी में पढ़ें'
                  : 'Stay updated with unlisted shares, pre-IPO and market news'
                }
              </p>
            </div>

            {/* Right Side - Search & Toggle */}
            <div className="flex-1 max-w-md">
              {/* Language Toggle */}
              <div className="flex items-center justify-end gap-3 mb-3">
                <span className="text-gray-400 text-xs">भाषा:</span>
                <div className="flex items-center bg-white/10 rounded-full p-0.5 backdrop-blur-sm">
                  <button
                    onClick={() => setShowHindi(false)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      !showHindi 
                        ? 'bg-white text-gray-900' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setShowHindi(true)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      showHindi 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder={showHindi ? "खबरें खोजें..." : "Search news..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    {showHindi ? 'खोजें' : 'Search'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter - Sticky */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Globe size={14} />
              {showHindi ? 'सभी खबरें' : 'All News'}
            </button>
            {categories.map((cat) => {
              const config = categoryConfig[cat.name] || categoryConfig['General'];
              const IconComponent = config.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.name
                      ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent size={14} />
                  {showHindi ? config.hindi : cat.name}
                  <span className="text-xs opacity-70">({cat.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Section - Only on All News */}
        {featuredNews.length > 0 && selectedCategory === 'all' && currentPage === 1 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                <Flame size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {showHindi ? '🔥 ट्रेंडिंग खबरें' : '🔥 Trending Stories'}
                </h2>
                <p className="text-sm text-gray-500">
                  {showHindi ? 'सबसे ज्यादा पढ़ी गई खबरें' : 'Most read stories'}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredNews.map((item, index) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/blog/${item._id}`)}
                  className={`group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 relative ${
                    index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                >
                  <div className={`relative ${index === 0 ? 'h-72 md:h-full' : 'h-44'}`}>
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Newspaper size={48} className="text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {/* Trending Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                      <Flame size={12} />
                      #{index + 1} Trending
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className={`font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors ${
                        index === 0 ? 'text-xl md:text-2xl' : 'text-base'
                      }`}>
                        {showHindi && item.hindiTitle ? item.hindiTitle : item.title}
                      </h3>
                      <p className={`text-gray-300 ${index === 0 ? 'line-clamp-2' : 'line-clamp-1'} text-sm mb-3`}>
                        {showHindi && item.hindiSummary ? item.hindiSummary : item.summary}
                      </p>
                      <div className="flex items-center gap-3 text-gray-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {getTimeAgo(item.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {item.views || 0} views
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section-wise News Display - Only on All News */}
        {selectedCategory === 'all' && currentPage === 1 && !loading && (
          <>
            {categories.slice(0, 4).map((cat) => (
              <CategorySection key={cat.name} categoryName={cat.name} />
            ))}
          </>
        )}

        {/* Regular News Grid - For category filter or pagination */}
        {(selectedCategory !== 'all' || currentPage > 1) && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="text-emerald-500" size={22} />
                {selectedCategory === 'all' 
                  ? (showHindi ? 'सभी खबरें' : 'All Articles')
                  : (showHindi ? `${categoryConfig[selectedCategory]?.hindi || selectedCategory} खबरें` : `${selectedCategory} News`)
                }
              </h2>
              <span className="text-gray-500 text-sm">
                {showHindi ? `पृष्ठ ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </span>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
                    <div className="h-44 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer"></div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="h-3 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-5 w-full bg-gray-200 rounded"></div>
                      <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                      <div className="space-y-2 pt-2">
                        <div className="h-3 w-full bg-gray-100 rounded"></div>
                        <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
                <style>{`
                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                  .skeleton-shimmer {
                    animation: shimmer 1.5s infinite;
                  }
                `}</style>
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-2xl">
                <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {showHindi ? 'कोई खबर नहीं मिली' : 'No news found'}
                </h3>
                <p className="text-gray-500">
                  {showHindi ? 'कृपया अपनी खोज बदलकर देखें' : 'Try adjusting your search or filters'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                  <NewsCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (selectedCategory !== 'all' || currentPage > 1) && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm"
            >
              {showHindi ? '← पिछला' : '← Previous'}
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
                  className={`w-10 h-10 rounded-xl font-medium transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
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
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm"
            >
              {showHindi ? 'अगला →' : 'Next →'}
            </button>
          </div>
        )}

        {/* Load More for Section View */}
        {selectedCategory === 'all' && currentPage === 1 && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setCurrentPage(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
            >
              {showHindi ? 'और खबरें देखें' : 'Load More News'}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 text-white py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            {showHindi ? '🚀 अनलिस्टेड शेयर्स में निवेश करें' : '🚀 Invest in Unlisted Shares'}
          </h2>
          <p className="text-emerald-200 mb-5 text-sm">
            {showHindi 
              ? 'NlistPlanet पर प्री-आईपीओ और अनलिस्टेड शेयर्स खरीदें-बेचें'
              : 'Buy & Sell pre-IPO and unlisted shares on NlistPlanet'
            }
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg text-sm"
          >
            {showHindi ? 'मार्केटप्लेस देखें' : 'Explore Marketplace'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
