import React, { useState } from 'react';
import { 
  Star, Heart, TrendingUp, Bell, Settings, 
  CheckCircle, AlertCircle, Info, Zap 
} from 'lucide-react';

/**
 * Modern UI Showcase Component
 * Demonstrates all new modern design classes
 * Can be used as reference or directly in app
 */
const ModernUIShowcase = () => {
  const [activeTab, setActiveTab] = useState('buttons');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold text-gradient-emerald mb-2">
            Modern UI Component Library
          </h1>
          <p className="text-gray-600">
            All new modern design classes in action
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs-modern bg-white rounded-t-2xl shadow-soft">
          {['buttons', 'cards', 'inputs', 'badges'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-modern ${activeTab === tab ? 'tab-active-modern' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card-modern p-8 rounded-t-none">
          {/* Buttons Section */}
          {activeTab === 'buttons' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Modern Buttons</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="btn-modern btn-primary-modern">
                    Primary Button
                  </button>
                  <button className="btn-modern btn-secondary-modern">
                    Secondary
                  </button>
                  <button className="btn-modern btn-success-modern">
                    Success
                  </button>
                  <button className="btn-modern btn-danger-modern">
                    Danger
                  </button>
                  <button className="btn-outline-modern">
                    Outline
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">With Icons</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="btn-modern btn-primary-modern flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Like
                  </button>
                  <button className="btn-modern btn-success-modern flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button className="btn-modern btn-secondary-modern flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cards Section */}
          {activeTab === 'cards' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Modern Cards</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Card */}
                <div className="stats-card-modern hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="stats-icon-modern">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="badge-modern badge-success-modern">+12%</span>
                  </div>
                  <div className="stats-value-modern">₹1,25,000</div>
                  <div className="stats-label-modern">Total Portfolio Value</div>
                </div>

                {/* Glass Card */}
                <div className="glass-effect rounded-2xl p-6 hover-lift">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-sm text-gray-600">Premium Users</div>
                    </div>
                  </div>
                </div>

                {/* Glow Card */}
                <div className="card-modern glow-emerald p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-emerald-600" />
                    <h3 className="font-bold text-lg">Boosted Listing</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Get 10x more visibility with premium boost
                  </p>
                  <div className="mt-4">
                    <button className="btn-modern btn-primary-modern w-full">
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inputs Section */}
          {activeTab === 'inputs' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Modern Inputs</h2>
              
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Normal Input
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Error State
                  </label>
                  <input 
                    type="text" 
                    placeholder="Invalid input"
                    className="input-modern input-error-modern"
                  />
                  <p className="text-red-600 text-sm mt-1">This field is required</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Textarea
                  </label>
                  <textarea 
                    rows="4"
                    placeholder="Enter description"
                    className="input-modern resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Badges Section */}
          {activeTab === 'badges' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Modern Badges</h2>
              
              <div>
                <h3 className="text-lg font-bold mb-3 text-gray-700">Status Badges</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="badge-modern badge-success-modern">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Active
                  </span>
                  <span className="badge-modern badge-warning-modern">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Pending
                  </span>
                  <span className="badge-modern badge-danger-modern">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Rejected
                  </span>
                  <span className="badge-modern badge-info-modern">
                    <Info className="w-3.5 h-3.5" />
                    Info
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 text-gray-700">Premium Badge</h3>
                <div className="flex gap-3">
                  <span className="badge-premium-modern flex items-center gap-2">
                    <Star className="w-4 h-4 fill-current" />
                    PREMIUM
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 text-gray-700">With Notifications</h3>
                <div className="flex gap-3">
                  <button className="btn-modern btn-outline-modern relative">
                    <Bell className="w-5 h-5" />
                    <span className="badge absolute -top-2 -right-2">
                      5
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading States */}
        <div className="card-modern p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Loading States</h2>
          <div className="space-y-4">
            <div className="skeleton-modern h-20 w-full"></div>
            <div className="skeleton-modern h-20 w-3/4"></div>
            <div className="skeleton-modern h-20 w-1/2"></div>
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-8 space-y-4">
          <div className="alert-modern alert-success-modern">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="font-bold text-emerald-900">Success!</h4>
              <p className="text-sm text-emerald-700">Your listing has been created successfully.</p>
            </div>
          </div>

          <div className="alert-modern alert-warning-modern">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-bold text-yellow-900">Warning!</h4>
              <p className="text-sm text-yellow-700">Please complete your KYC verification.</p>
            </div>
          </div>

          <div className="alert-modern alert-danger-modern">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="font-bold text-red-900">Error!</h4>
              <p className="text-sm text-red-700">Something went wrong. Please try again.</p>
            </div>
          </div>

          <div className="alert-modern alert-info-modern">
            <Info className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-bold text-blue-900">Info</h4>
              <p className="text-sm text-blue-700">New features are now available!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernUIShowcase;
