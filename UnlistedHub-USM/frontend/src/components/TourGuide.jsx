import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Simple Dashboard Tour Hook
export const useDashboardTour = () => {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    
    if (!hasSeenTour) {
      // Wait for elements to load
      const startTour = () => {
        const driverObj = driver({
          showProgress: true,
          animate: true,
          overlayOpacity: 0.4,
          allowClose: true,
          nextBtnText: 'Next',
          prevBtnText: 'Previous',
          doneBtnText: 'Done',
          steps: [
            {
              element: '#sidebar-tab-marketplace',
              popover: {
                title: 'Marketplace',
                description: 'You can place bids and offers on other users\' posts.',
                side: 'right'
              }
            },
            {
              element: '#sidebar-tab-portfolio',
              popover: {
                title: 'Portfolio',
                description: 'You can keep your existing unlisted share records here.',
                side: 'right'
              }
            },
            {
              element: '#sidebar-tab-posts',
              popover: {
                title: 'My Posts',
                description: 'You can check and manage your posts here.',
                side: 'right'
              }
            },
            {
              element: '#sidebar-tab-my-bids-offers',
              popover: {
                title: 'My Bids',
                description: 'You can check your bids and offers placed on other users\' posts.',
                side: 'right'
              }
            },
            {
              element: '#dashboard-action-center',
              popover: {
                title: 'Action Center',
                description: 'Important updates like received bids and counter-offers will appear here.',
                side: 'left'
              }
            }
          ],
          onPopoverRender: (popover) => {
            // Add Skip button
            const footer = popover.querySelector('.driver-popover-footer');
            if (footer && !footer.querySelector('.skip-tour-btn')) {
              const skipBtn = document.createElement('button');
              skipBtn.innerText = 'Skip';
              skipBtn.className = 'skip-tour-btn';
              skipBtn.style.cssText = `
                background: #6b7280;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                margin-right: 8px;
                cursor: pointer;
                font-size: 14px;
              `;
              skipBtn.onclick = () => {
                localStorage.setItem('hasSeenDashboardTour', 'true');
                driverObj.destroy();
              };
              footer.insertBefore(skipBtn, footer.firstChild);
            }
          },
          onDestroyed: () => {
            localStorage.setItem('hasSeenDashboardTour', 'true');
          }
        });

        driverObj.drive();
      };

      // Start tour after 1 second
      setTimeout(startTour, 1000);
    }
  }, []);
};

// Function to manually start tour
export const startDashboardTour = () => {
  localStorage.removeItem('hasSeenDashboardTour');
  window.location.reload();
};

// Emergency cleanup
export const forceCleanupTour = () => {
  localStorage.setItem('hasSeenDashboardTour', 'true');
  document.querySelectorAll('.driver-overlay, .driver-popover, .driver-popover-wrapper').forEach(el => el.remove());
  document.body.style.overflow = '';
  window.location.reload();
};
