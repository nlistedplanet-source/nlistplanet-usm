import { useEffect, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * NListPlanet Dashboard Tour Guide
 * Clean, minimal, professional design
 */

const TOUR_STEPS = [
  {
    element: '#sidebar-tab-marketplace',
    popover: {
      title: 'Marketplace',
      description: 'Browse and place bids/offers on unlisted shares from other traders.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '#sidebar-tab-portfolio',
    popover: {
      title: 'Portfolio',
      description: 'Track and manage your unlisted share holdings in one place.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '#sidebar-tab-posts',
    popover: {
      title: 'My Posts',
      description: 'View and manage all your buy/sell listings here.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '#sidebar-tab-my-bids-offers',
    popover: {
      title: 'My Bids & Offers',
      description: 'Track all your active bids and offers on other listings.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '#dashboard-action-center',
    popover: {
      title: 'Action Center',
      description: 'Important notifications about bids, counter-offers, and deal updates appear here.',
      side: 'top',
      align: 'start'
    }
  }
];

const injectStyles = () => {
  if (document.getElementById('nlist-tour-styles')) return;

  const style = document.createElement('style');
  style.id = 'nlist-tour-styles';
  style.textContent = `
    /* Overlay - Light and subtle */
    .driver-overlay {
      background: rgba(0, 0, 0, 0.3) !important;
      z-index: 99998 !important;
    }

    /* Popover Container */
    .driver-popover {
      background: #ffffff !important;
      border: none !important;
      border-radius: 12px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
      padding: 20px !important;
      max-width: 320px !important;
      min-width: 280px !important;
      z-index: 99999 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative !important;
    }

    /* Arrow */
    .driver-popover-arrow-side-right {
      border-right-color: #ffffff !important;
    }
    .driver-popover-arrow-side-left {
      border-left-color: #ffffff !important;
    }
    .driver-popover-arrow-side-top {
      border-top-color: #ffffff !important;
    }
    .driver-popover-arrow-side-bottom {
      border-bottom-color: #ffffff !important;
    }

    /* Title */
    .driver-popover-title {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #111827 !important;
      margin: 0 0 8px 0 !important;
      padding: 0 !important;
    }

    /* Description */
    .driver-popover-description {
      font-size: 14px !important;
      color: #6b7280 !important;
      line-height: 1.5 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Footer */
    .driver-popover-footer {
      margin-top: 16px !important;
      padding-top: 16px !important;
      border-top: 1px solid #f3f4f6 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    /* Progress */
    .driver-popover-progress-text {
      font-size: 12px !important;
      color: #9ca3af !important;
      flex: 1 !important;
    }

    /* All Buttons Base */
    .driver-popover-footer button {
      padding: 8px 16px !important;
      border-radius: 8px !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
    }

    /* Previous Button */
    .driver-popover-prev-btn {
      background: #f3f4f6 !important;
      color: #374151 !important;
      border: none !important;
    }
    .driver-popover-prev-btn:hover {
      background: #e5e7eb !important;
    }

    /* Next Button */
    .driver-popover-next-btn {
      background: #10b981 !important;
      color: white !important;
      border: none !important;
    }
    .driver-popover-next-btn:hover {
      background: #059669 !important;
    }

    /* Done Button */
    .driver-popover-done-btn {
      background: #10b981 !important;
      color: white !important;
      border: none !important;
    }
    .driver-popover-done-btn:hover {
      background: #059669 !important;
    }

    /* Skip Button - Top Right Corner */
    .nlist-skip-btn {
      position: absolute !important;
      top: 12px !important;
      right: 12px !important;
      background: transparent !important;
      color: #9ca3af !important;
      border: none !important;
      padding: 4px 8px !important;
      font-size: 12px !important;
      cursor: pointer !important;
      z-index: 10 !important;
    }
    .nlist-skip-btn:hover {
      color: #ef4444 !important;
    }

    /* Make popover relative for absolute positioning */
    .driver-popover {
      position: relative !important;
    }

    /* Highlighted Element */
    .driver-active-element {
      border-radius: 8px !important;
    }

    /* Hide default close button */
    .driver-popover-close-btn {
      display: none !important;
    }

    /* Ensure all popover content is visible */
    .driver-popover * {
      position: relative !important;
      z-index: 1 !important;
    }

    /* Stage (highlighted element background) */
    .driver-stage {
      z-index: 99997 !important;
    }
  `;
  document.head.appendChild(style);
};

export const useDashboardTour = () => {
  const startTour = useCallback(() => {
    const seen = localStorage.getItem('hasSeenDashboardTour');
    if (seen) return;

    // Check elements exist
    const hasElements = TOUR_STEPS.slice(0, 2).every(
      step => document.querySelector(step.element)
    );
    if (!hasElements) {
      setTimeout(startTour, 500);
      return;
    }

    injectStyles();

    let tourDriver = null;

    tourDriver = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayClickNext: false,
      stagePadding: 6,
      stageRadius: 8,
      popoverOffset: 12,
      showButtons: ['next', 'previous'],
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Done',
      progressText: '{{current}} / {{total}}',
      steps: TOUR_STEPS,
      
      onPopoverRender: (popover) => {
        // Add skip button to top-right of popover
        const wrapper = popover.wrapper;
        if (!wrapper || wrapper.querySelector('.nlist-skip-btn')) return;

        const skipBtn = document.createElement('button');
        skipBtn.className = 'nlist-skip-btn';
        skipBtn.textContent = 'Skip ✕';
        skipBtn.onclick = () => {
          localStorage.setItem('hasSeenDashboardTour', 'true');
          tourDriver?.destroy();
        };
        
        // Add to popover wrapper (not footer)
        wrapper.appendChild(skipBtn);
      },

      onDestroyStarted: () => {
        localStorage.setItem('hasSeenDashboardTour', 'true');
      }
    });

    tourDriver.drive();
  }, []);

  useEffect(() => {
    const timer = setTimeout(startTour, 1200);
    return () => clearTimeout(timer);
  }, [startTour]);
};

// Manual controls
export const startDashboardTour = () => {
  localStorage.removeItem('hasSeenDashboardTour');
  window.location.reload();
};

export const forceCleanupTour = () => {
  localStorage.setItem('hasSeenDashboardTour', 'true');
  document.querySelectorAll('.driver-overlay, .driver-popover').forEach(el => el.remove());
  document.body.style.overflow = '';
};

export default useDashboardTour;
