import React, { useState } from 'react';
import { X, Send, MessageCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const QueryModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [queryData, setQueryData] = useState({
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'general', label: 'General Query', icon: '💬' },
    { value: 'technical', label: 'Technical Issue', icon: '🔧' },
    { value: 'transaction', label: 'Transaction Support', icon: '💰' },
    { value: 'account', label: 'Account Help', icon: '👤' },
    { value: 'listing', label: 'Listing Query', icon: '📋' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!queryData.subject.trim() || !queryData.message.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications/send-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subject: queryData.subject,
          message: queryData.message,
          category: queryData.category,
          userId: user._id,
          username: user.username
        })
      });

      if (!response.ok) throw new Error('Failed to send query');

      toast.success('✅ Query sent to admin successfully!');
      setQueryData({ subject: '', message: '', category: 'general' });
      onClose();
    } catch (error) {
      toast.error('Failed to send query. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-emerald-50 to-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Query to Admin</h2>
              <p className="text-xs text-gray-600">We'll respond within 24 hours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-95"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Query Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setQueryData({ ...queryData, category: cat.value })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    queryData.category === cat.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={queryData.subject}
              onChange={(e) => setQueryData({ ...queryData, subject: e.target.value })}
              placeholder="Brief description of your query"
              className="input-modern-mobile w-full"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {queryData.subject.length}/100 characters
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={queryData.message}
              onChange={(e) => setQueryData({ ...queryData, message: e.target.value })}
              placeholder="Describe your query in detail..."
              rows="6"
              className="input-modern-mobile w-full resize-none"
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {queryData.message.length}/500 characters
            </p>
          </div>

          {/* User Info Display */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Query will be sent from:</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-gray-600">@{user.username}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-modern-mobile btn-outline-modern-mobile flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-modern-mobile btn-primary-modern-mobile flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Query
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <HelpCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-1">Quick Response Tips</p>
              <ul className="text-xs text-blue-700 space-y-0.5">
                <li>• Be specific about your issue</li>
                <li>• Include relevant listing or transaction IDs if applicable</li>
                <li>• Admin typically responds within 24 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryModal;
