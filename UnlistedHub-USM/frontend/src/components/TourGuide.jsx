import { useEffect, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Professional Dashboard Tour Guide
 * Features: Skip button, Progress indicator, Modern styling
 */

const TOUR_STEPS = [
  {
    element: '#sidebar-tab-marketplace',
    popover: {
      title: '🏪 Marketplace',
      description: 'Browse and place bids/offers on unlisted shares from other traders.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '#sidebar-tab-portfolio',
    popover: {
      title: '📊 Portfolio',
      description: 'Track and manage your unlisted share holdings in one place.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '#sidebar-tab-posts',
    popover: {
      title: '📝 My Posts',
      description: 'View and manage all your buy/sell listings here.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '#sidebar-tab-my-bids-offers',
    popover: {
      title: '💰 My Bids',
      description: 'Track all your active bids and offers on other listings.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '#dashboard-action-center',
    popover: {
      title: '🔔 Action Center',
      description: 'Get notified about new bids, counter-offers, and deal updates.',
      side: 'top',
      align: 'start'
    }
  }
];

// Custom styles for the tour
const injectTourStyles = () => {
  const styleId = 'tour-custom-styles';
  if (document.getElementById(styleId)) return;

  const styles = document.createElement('style');
  styles.id = styleId;
  styles.textContent = `
    /* Modern Tour Popover */
    .driver-popover {
      background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%) !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
      padding: 24px !important;
      max-width: 340px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }

    .driver-popover-arrow {
      border: 8px solid transparent !important;
    }

    .driver-popover-arrow-side-left {
      border-left-color: #ffffff !important;
    }

    .driver-popover-arrow-side-right {
      border-right-color: #ffffff !important;
    }

    .driver-popover-arrow-side-top {
      border-top-color: #ffffff !important;
    }

    .driver-popover-arrow-side-bottom {
      border-bottom-color: #ffffff !important;
    }

    /* Title */
    .driver-popover-title {
      font-size: 18px !important;
      font-weight: 700 !important;
      color: #1e293b !important;
      margin-bottom: 8px !important;
      line-height: 1.3 !important;
    }

    /* Description */
    .driver-popover-description {
      font-size: 14px !important;
      color: #64748b !important;
      line-height: 1.6 !important;
      margin-bottom: 0 !important;
    }

    /* Progress Text */
    .driver-popover-progress-text {
      font-size: 12px !important;
      color: #94a3b8 !important;
      font-weight: 500 !important;
    }

    /* Footer */
    .driver-popover-footer {
      margin-top: 20px !important;
      padding-top: 16px !important;
      border-top: 1px solid #f1f5f9 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
    }

    /* Navigation Buttons */
    .driver-popover-navigation-btns {
      display: flex !important;
      gap: 8px !important;
    }

    .driver-popover-prev-btn,
    .driver-popover-next-btn {
      padding: 10px 20px !important;
      border-radius: 10px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      border: none !important;
    }

    .driver-popover-prev-btn {
      background: #f1f5f9 !important;
      color: #475569 !important;
    }

    .driver-popover-prev-btn:hover {
      background: #e2e8f0 !important;
    }

    .driver-popover-next-btn,
    .driver-popover-done-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      color: white !important;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
    }

    .driver-popover-next-btn:hover,
    .driver-popover-done-btn:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4) !important;
    }

    /* Skip Button */
    .tour-skip-btn {
      padding: 10px 16px !important;
      border-radius: 10px !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      border: 1px solid #e2e8f0 !important;
      background: white !important;
      color: #64748b !important;
    }

    .tour-skip-btn:hover {
      background: #fef2f2 !important;
      border-color: #fecaca !important;
      color: #dc2626 !important;
    }

    /* Overlay */
    .driver-overlay {
      background: rgba(15, 23, 42, 0.6) !important;
      backdrop-filter: blur(4px) !important;
    }

    /* Highlighted Element */
    .driver-active-element {
      border-radius: 12px !important;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3), 0 0 0 8px rgba(16, 185, 129, 0.1) !important;
    }

    /* Close Button */
    .driver-popover-close-btn {
      display: none !important;
    }
  `;
  document.head.appendChild(styles);
};

// Dashboard Tour Hook
export const useDashboardTour = () => {
  const initTour = useCallback(() => {
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (hasSeenTour) return;

    // Inject custom styles
    injectTourStyles();

    // Check if required elements exist
    const elementsExist = TOUR_STEPS.slice(0, 3).every(
      step => document.querySelector(step.element)
    );

    if (!elementsExist) {
      setTimeout(initTour, 500);
      return;
    }

    let driverInstance = null;

    driverInstance = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: false,
      overlayClickNext: false,
      stagePadding: 8,
      stageRadius: 12,
      popoverOffset: 15,
      showButtons: ['next', 'previous'],
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Get Started! 🚀',
      progressText: '{{current}} of {{total}}',
      steps: TOUR_STEPS,
      onPopoverRender: (popover) => {
        const footer = popover.footer;
        if (!footer) return;

        // Check if skip button already exists
        if (footer.querySelector('.tour-skip-btn')) return;

        // Create Skip button
        const skipBtn = document.createElement('button');
        skipBtn.className = 'tour-skip-btn';
        skipBtn.innerHTML = 'Skip Tour';
        skipBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          localStorage.setItem('hasSeenDashboardTour', 'true');
          if (driverInstance) {
            driverInstance.destroy();
          }
        };

        // Insert skip button at the beginning
        footer.insertBefore(skipBtn, footer.firstChild);
      },
      onDestroyStarted: () => {
        localStorage.setItem('hasSeenDashboardTour', 'true');
      },
      onDestroyed: () => {
        driverInstance = null;
      }
    });

    // Start the tour
    driverInstance.drive();
  }, []);

  useEffect(() => {
    // Delay tour start to ensure page is fully loaded
    const timer = setTimeout(initTour, 1500);
    return () => clearTimeout(timer);
  }, [initTour]);
};

// Manually trigger tour
export const startDashboardTour = () => {
  localStorage.removeItem('hasSeenDashboardTour');
  window.location.reload();
};

// Reset tour for testing
export const resetTour = () => {
  localStorage.removeItem('hasSeenDashboardTour');
};

// Force cleanup any stuck tour elements
export const forceCleanupTour = () => {
  localStorage.setItem('hasSeenDashboardTour', 'true');
  
  // Remove all driver.js elements
  const selectors = [
    '.driver-overlay',
    '.driver-popover',
    '.driver-active-element'
  ];
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (selector === '.driver-active-element') {
        el.classList.remove('driver-active-element');
      } else {
        el.remove();
      }
    });
  });

  // Reset body scroll
  document.body.style.overflow = '';
  
  console.log('Tour cleanup completed');
};

export default useDashboardTour;
