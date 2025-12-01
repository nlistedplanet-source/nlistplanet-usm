import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  X,
  Package
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, timeAgo, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyPostsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // all, open, closed
  const [selectedListing, setSelectedListing] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMyListings();
      setListings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    await fetchMyListings();
    setRefreshing(false);
    haptic.success();
  };

  const handleDeleteListing = async () => {
    if (!selectedListing) return;

    try {
      haptic.medium();
      await listingsAPI.delete(selectedListing._id);
      haptic.success();
      toast.success('Post deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedListing(null);
      fetchMyListings();
    } catch (error) {
      haptic.error();
      console.error('Failed to delete listing:', error);
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const openActionSheet = (listing) => {
    haptic.light();
    setSelectedListing(listing);
    setShowActionSheet(true);
  };

  const closeActionSheet = () => {
    haptic.light();
    setShowActionSheet(false);
    setTimeout(() => setSelectedListing(null), 300);
  };

  const handleViewDetails = () => {
    closeActionSheet();
    navigate(`/listing/${selectedListing._id}`);
  };

  const handleEdit = () => {
    closeActionSheet();
    toast('Edit functionality coming soon!', { icon: '🚧' });
  };

  const handleDelete = () => {
    setShowActionSheet(false);
    setShowDeleteConfirm(true);
  };

  const filteredListings = listings.filter(listing => {
    if (activeFilter === 'all') return true;
    return listing.status === activeFilter;
  });

  const FilterButton = ({ value, label }) => (
    <button
      onClick={() => {
        haptic.light();
        setActiveFilter(value);
      }}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        activeFilter === value
          ? 'bg-primary-600 text-white shadow-lg'
          : 'bg-white text-gray-700 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen-nav flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen-nav bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white sticky top-0 z-10 shadow-sm">
          <div className="px-6 pt-safe pb-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center touch-feedback"
              >
                <RefreshCw className={`w-5 h-5 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-6 px-6">
              <FilterButton value="all" label={`All (${listings.length})`} />
              <FilterButton 
                value="open" 
                label={`Active (${listings.filter(l => l.status === 'open').length})`} 
              />
              <FilterButton 
                value="closed" 
                label={`Closed (${listings.filter(l => l.status === 'closed').length})`} 
              />
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="px-6 pt-4">
          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Posts Found</h3>
              <p className="text-gray-500 mb-6">
                {activeFilter === 'all' 
                  ? "You haven't created any posts yet"
                  : `No ${activeFilter} posts found`
                }
              </p>
              <button
                onClick={() => navigate('/marketplace')}
                className="btn-primary inline-flex"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {filteredListings.map((listing) => (
                <PostCard 
                  key={listing._id} 
                  listing={listing}
                  onMoreClick={() => openActionSheet(listing)}
                  onViewClick={() => navigate(`/listing/${listing._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Sheet */}
      {showActionSheet && selectedListing && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fade-in"
          onClick={closeActionSheet}
        >
          <div 
            className="bg-white rounded-t-3xl w-full animate-slide-up pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{selectedListing.companyName}</h3>
                <button
                  onClick={closeActionSheet}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleViewDetails}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors touch-feedback"
              >
                <Eye className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">View Details</span>
              </button>

              {selectedListing.status === 'open' && (
                <>
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors touch-feedback"
                  >
                    <Edit3 className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Edit Post</span>
                  </button>

                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors touch-feedback"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-600">Delete Post</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedListing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Post?</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  haptic.light();
                  setShowDeleteConfirm(false);
                  setSelectedListing(null);
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteListing}
                className="flex-1 bg-red-600 text-white rounded-2xl py-3 px-6 font-semibold hover:bg-red-700 transition-colors touch-feedback"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Post Card Component
const PostCard = ({ listing, onMoreClick, onViewClick }) => {
  const isSell = listing.type === 'sell';
  const isOpen = listing.status === 'open';
  
  return (
    <div className="bg-white rounded-2xl p-4 shadow-mobile">
      <div className="flex items-start gap-4">
        {/* Company Logo/Initial */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          isSell 
            ? 'bg-gradient-to-br from-red-50 to-red-100' 
            : 'bg-gradient-to-br from-green-50 to-green-100'
        }`}>
          <span className={`text-xl font-bold ${
            isSell ? 'text-red-700' : 'text-green-700'
          }`}>
            {listing.companyName?.charAt(0) || '?'}
          </span>
        </div>

        {/* Post Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">
                {listing.companyName}
              </h3>
              <p className="text-sm text-gray-500">
                {listing.quantity} shares • {timeAgo(listing.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                isSell
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {isSell ? 'SELL' : 'BUY'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoreClick();
                }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center touch-feedback"
              >
                <MoreVertical size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Price and Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Price per share</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(listing.price)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isOpen
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {isOpen ? 'Active' : 'Closed'}
              </span>
              <button 
                onClick={onViewClick}
                className="text-primary-600 font-semibold text-sm hover:underline"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;
