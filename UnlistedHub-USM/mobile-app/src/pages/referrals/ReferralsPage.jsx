import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Share2,
  Copy,
  Users,
  Gift,
  TrendingUp,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { referralsAPI } from '../../utils/api';
import { formatCurrency, haptic } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ReferralsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const [statsResponse, listResponse] = await Promise.all([
        referralsAPI.getStats(),
        referralsAPI.getList()
      ]);
      setReferralData(statsResponse.data.data);
      setReferrals(listResponse.data.data || []);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      toast.error('Failed to load referral information');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!user?.referralCode) return;
    
    haptic.medium();
    navigator.clipboard.writeText(user.referralCode);
    toast.success('Referral code copied!');
  };

  const handleShare = async () => {
    haptic.medium();
    
    const shareText = `Join NlistPlanet and start trading unlisted shares! Use my referral code: ${user?.referralCode}\n\nSign up here: ${window.location.origin}/register?ref=${user?.referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join NlistPlanet',
          text: shareText
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Invite link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="px-6 pt-safe pb-6">
          <button
            onClick={() => {
              haptic.light();
              navigate(-1);
            }}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center touch-feedback mb-4"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white mb-2">Refer & Earn</h1>
          <p className="text-white/90">Invite friends and earn rewards together</p>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Referral Code Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-2">Your Referral Code</p>
            <div className="inline-flex items-center gap-3 bg-primary-50 border-2 border-primary-200 rounded-2xl px-6 py-3 mb-4">
              <span className="text-2xl font-bold text-primary-700 tracking-wider">
                {user?.referralCode || 'N/A'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyCode}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Copy size={18} />
              Copy Code
            </button>
            <button
              onClick={handleShare}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center shadow-mobile">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{referralData?.totalReferrals || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total Referrals</p>
          </div>

          <div className="bg-white rounded-2xl p-4 text-center shadow-mobile">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{referralData?.activeReferrals || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Active Users</p>
          </div>

          <div className="bg-white rounded-2xl p-4 text-center shadow-mobile">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(referralData?.totalEarnings || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Earnings</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-6 shadow-mobile mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            How It Works
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary-700">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Share Your Code</h3>
                <p className="text-sm text-gray-600">Send your referral code to friends and family</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary-700">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">They Sign Up</h3>
                <p className="text-sm text-gray-600">Your friend registers using your code</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary-700">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Earn Rewards</h3>
                <p className="text-sm text-gray-600">Both of you get bonus credits when they complete first trade</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral List */}
        {referrals.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-mobile">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Referrals</h2>
            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{referral.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{new Date(referral.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    referral.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {referral.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsPage;
