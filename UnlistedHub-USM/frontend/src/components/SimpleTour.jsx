import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_STEPS = [
  {
    target: '#sidebar-tab-marketplace',
    title: '🛒 Marketplace',
    description: 'Browse and trade unlisted shares. Place bids on SELL posts or offers on BUY requests.',
    position: 'right'
  },
  {
    target: '#sidebar-tab-portfolio',
    title: '💼 My Portfolio',
    description: 'Track all your unlisted share holdings and monitor their performance.',
    position: 'right'
  },
  {
    target: '#sidebar-tab-posts',
    title: '📝 My Posts',
    description: 'View and manage your SELL listings and BUY requests here.',
    position: 'right'
  },
  {
    target: '#sidebar-tab-my-bids-offers',
    title: '💰 My Bids & Offers',
    description: 'Track all bids you placed on SELL posts and offers on BUY requests.',
    position: 'right'
  },
  {
    target: '#dashboard-action-center',
    title: '⚡ Action Center',
    description: 'Important notifications about new bids, counter-offers, and deals requiring your action.',
    position: 'top'
  }
];

const SimpleTour = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (!hasSeenTour) {
      // Wait for page to load
      setTimeout(() => {
        const firstElement = document.querySelector(TOUR_STEPS[0].target);
        if (firstElement) {
          setIsActive(true);
        }
      }, 1500);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep];
      const element = document.querySelector(step.target);
      
      if (!element) return;

      const rect = element.getBoundingClientRect();
      let top = 0, left = 0;

      if (step.position === 'right') {
        top = rect.top + (rect.height / 2) - 100;
        left = rect.right + 20;
      } else if (step.position === 'top') {
        top = rect.top - 200;
        left = rect.left + (rect.width / 2) - 150;
      }

      setPosition({ top, left });

      // Highlight element
      element.style.position = 'relative';
      element.style.zIndex = '100000';
      element.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.5)';
      element.style.borderRadius = '8px';
      element.style.transition = 'all 0.3s ease';
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      
      // Remove highlight
      TOUR_STEPS.forEach(step => {
        const el = document.querySelector(step.target);
        if (el) {
          el.style.boxShadow = '';
          el.style.zIndex = '';
        }
      });
    };
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      // Remove current highlight
      const currentEl = document.querySelector(TOUR_STEPS[currentStep].target);
      if (currentEl) {
        currentEl.style.boxShadow = '';
        currentEl.style.zIndex = '';
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      // Remove current highlight
      const currentEl = document.querySelector(TOUR_STEPS[currentStep].target);
      if (currentEl) {
        currentEl.style.boxShadow = '';
        currentEl.style.zIndex = '';
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsActive(false);
    localStorage.setItem('hasSeenDashboardTour', 'true');
    
    // Remove all highlights
    TOUR_STEPS.forEach(step => {
      const el = document.querySelector(step.target);
      if (el) {
        el.style.boxShadow = '';
        el.style.zIndex = '';
      }
    });
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        style={{ zIndex: 99998 }}
        onClick={handleClose}
      />

      {/* Popover */}
      <div
        className="fixed bg-white rounded-xl shadow-2xl border-2 border-indigo-200 p-6 animate-fadeIn"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: '340px',
          zIndex: 100001,
          transition: 'all 0.3s ease'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 pr-6">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {step.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Progress */}
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-indigo-600'
                    : index < currentStep
                    ? 'w-1.5 bg-indigo-300'
                    : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1 transition-colors"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
              {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        {/* Step Counter */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white bg-gray-900 px-2 py-1 rounded">
          {currentStep + 1} of {TOUR_STEPS.length}
        </div>
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

// Manual trigger
export const startSimpleTour = () => {
  localStorage.removeItem('hasSeenDashboardTour');
  window.location.reload();
};

export default SimpleTour;
