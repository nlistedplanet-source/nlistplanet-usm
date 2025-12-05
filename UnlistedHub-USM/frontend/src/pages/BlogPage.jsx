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
  BookOpen
} from 'lucide-react';
import axios from 'axios';
import TopBar from '../components/TopBar';

const API_BASE = process.env.REACT_APP_API_URL || '';

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
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <TopBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
              <Newspaper size={16} className="text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">NlistPlanet Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Latest News & Insights
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Stay updated with the latest news on unlisted shares, pre-IPO opportunities, 
              market trends, and investment insights.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search news, companies, IPOs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
                    ? 'bg-emerald-500 text-white shadow-md'
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
        {/* Featured News */}
        {featuredNews.length > 0 && selectedCategory === 'all' && currentPage === 1 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={24} />
                Featured Stories
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredNews.map((item, index) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/blog/${item._id}`)}
                  className={`group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                    index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                >
                  <div className={`relative ${index === 0 ? 'h-80 md:h-full' : 'h-48'}`}>
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Newspaper size={48} className="text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <h3 className={`font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors ${
                        index === 0 ? 'text-2xl md:text-3xl' : 'text-lg'
                      }`}>
                        {item.title}
                      </h3>
                      <p className={`text-gray-300 ${index === 0 ? 'line-clamp-3' : 'line-clamp-2'} text-sm`}>
                        {item.summary}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-gray-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(item.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {item.readTime} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="text-emerald-500" size={24} />
              {selectedCategory === 'all' ? 'Latest Articles' : `${selectedCategory} News`}
            </h2>
            <span className="text-gray-500 text-sm">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="animate-spin text-emerald-500" size={40} />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No news found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <article
                  key={item._id}
                  onClick={() => navigate(`/blog/${item._id}`)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-emerald-200"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <Newspaper size={40} className="text-slate-400" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {item.summary}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(item.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {item.readTime} min
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {item.views || 0}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
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
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Trade Unlisted Shares?
          </h2>
          <p className="text-emerald-100 mb-6">
            Join NlistPlanet and access exclusive pre-IPO investment opportunities.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Explore Marketplace
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
