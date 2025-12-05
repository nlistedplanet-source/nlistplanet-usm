import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, Loader, Search, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const API_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'https://nlistplanet-usm-v8dc.onrender.com';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, draft
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'General',
    thumbnail: '',
    sourceUrl: '',
    sourceName: 'NlistPlanet',
    author: 'NlistPlanet Team',
    tags: '',
    isPublished: true,
    isFeatured: false
  });

  const categories = ['IPO', 'Market', 'Company', 'Unlisted', 'Pre-IPO', 'General', 'Analysis'];

  useEffect(() => {
    fetchNews();
  }, [filter]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/news?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNews(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingNews 
        ? `${API_URL}/api/admin/news/${editingNews._id}`
        : `${API_URL}/api/admin/news`;
      
      const method = editingNews ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingNews ? 'News updated!' : 'News created!');
        setShowModal(false);
        resetForm();
        fetchNews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to save news');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('News deleted!');
        fetchNews();
      }
    } catch (error) {
      toast.error('Failed to delete news');
    }
  };

  const togglePublish = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/admin/news/${id}/toggle-publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNews();
      toast.success('Status updated!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleFeatured = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/admin/news/${id}/toggle-featured`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNews();
      toast.success('Featured status updated!');
    } catch (error) {
      toast.error('Failed to update featured');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: 'General',
      thumbnail: '',
      sourceUrl: '',
      sourceName: 'NlistPlanet',
      author: 'NlistPlanet Team',
      tags: '',
      isPublished: true,
      isFeatured: false
    });
    setEditingNews(null);
  };

  const openEditModal = (item) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      summary: item.summary,
      content: item.content || '',
      category: item.category,
      thumbnail: item.thumbnail || '',
      sourceUrl: item.sourceUrl || '',
      sourceName: item.sourceName || 'NlistPlanet',
      author: item.author || 'NlistPlanet Team',
      tags: item.tags?.join(', ') || '',
      isPublished: item.isPublished,
      isFeatured: item.isFeatured
    });
    setShowModal(true);
  };

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All News</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Add News
        </button>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">No news found</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-4">
                {/* Thumbnail */}
                {item.thumbnail && (
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.isFeatured && (
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      )}
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        item.isPublished 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.summary}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{item.category}</span>
                      <span>•</span>
                      <span>{formatDate(item.publishedAt || item.createdAt)}</span>
                      <span>•</span>
                      <span>{item.views || 0} views</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFeatured(item._id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.isFeatured 
                            ? 'text-yellow-600 bg-yellow-50' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star size={16} />
                      </button>
                      <button
                        onClick={() => togglePublish(item._id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.isPublished 
                            ? 'text-green-600 bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title="Toggle Publish"
                      >
                        {item.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto bg-white rounded-2xl p-6 z-50 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingNews ? 'Edit News' : 'Add New News'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Summary * (60-80 words)</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Source URL</label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  placeholder="https://source.com/article"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  placeholder="IPO, Market, Stocks"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {editingNews ? 'Update News' : 'Create News'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default NewsManagement;
