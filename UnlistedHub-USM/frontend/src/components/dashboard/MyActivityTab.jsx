import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyActivityTab = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyActivity();
  }, []);

  const fetchMyActivity = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMyPlacedBids();
      setActivities(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch your activity');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-primary-600 mb-3" size={40} />
        <p className="text-dark-600">Loading your activity...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-dark-50 rounded-2xl">
        <Clock className="text-dark-300 mb-3" size={48} />
        <p className="text-dark-600 font-medium mb-2">No activity yet</p>
        <p className="text-dark-500 text-sm text-center">
          Bids and offers you place will appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-dark-900 mb-4">My Activity ({activities.length})</h2>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="card-mobile">
            {/* Type Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {activity.type === 'bid' ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-blue-600" size={20} />
                )}
                <span className="font-semibold text-sm text-dark-700">
                  {activity.type === 'bid' ? 'Bid Placed' : 'Offer Made'}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}>
                {activity.status}
              </span>
            </div>

            {/* Listing Info */}
            <div className="mb-3">
              <h4 className="font-semibold text-dark-900">{activity.listing.companyName}</h4>
              <p className="text-xs text-dark-500">
                Owner: @{activity.listing.owner?.username || 'Unknown'} • Listed at {formatCurrency(activity.listing.listingPrice)}
              </p>
            </div>

            {/* Activity Details */}
            <div className="bg-dark-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-600">Your {activity.type === 'bid' ? 'Bid' : 'Offer'}:</span>
                <span className="font-bold text-primary-700">{formatCurrency(activity.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600">Quantity:</span>
                <span className="font-semibold text-dark-900">{activity.quantity} shares</span>
              </div>
            </div>

            {/* Counter History */}
            {activity.counterHistory && activity.counterHistory.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-dark-600 mb-2">Counter Offer History:</p>
                <div className="space-y-2">
                  {activity.counterHistory.map((counter, idx) => (
                    <div key={idx} className="bg-dark-50 rounded-lg p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Round {counter.round} ({counter.by}):</span>
                        <span className="text-primary-600 font-bold">{formatCurrency(counter.price)}</span>
                      </div>
                      {counter.message && <p className="text-dark-600 mt-1">{counter.message}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-dark-500">{formatDate(activity.createdAt)}</p>

            {/* Status Message */}
            {activity.status === 'accepted' && (
              <div className="mt-3 flex items-center gap-2 bg-green-50 p-2 rounded-lg">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-xs text-green-700 font-semibold">Accepted by owner</span>
              </div>
            )}
            {activity.status === 'rejected' && (
              <div className="mt-3 flex items-center gap-2 bg-red-50 p-2 rounded-lg">
                <XCircle size={16} className="text-red-600" />
                <span className="text-xs text-red-700 font-semibold">Rejected by owner</span>
              </div>
            )}
            {activity.status === 'countered' && (
              <div className="mt-3 flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                <MessageCircle size={16} className="text-blue-600" />
                <span className="text-xs text-blue-700 font-semibold">Owner sent counter offer</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyActivityTab;
