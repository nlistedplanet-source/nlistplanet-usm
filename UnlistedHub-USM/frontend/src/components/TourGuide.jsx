import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const useDashboardTour = () => {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (!hasSeenTour) {
      let driverObj;
      driverObj = driver({
        showProgress: true,
        animate: true,
        steps: [
          { 
            element: '#sidebar-tab-marketplace', 
            popover: { 
              title: 'Marketplace', 
              description: 'You can place bids and offers on other users\' posts.',
              side: 'right', 
              align: 'center' 
            } 
          },
          { 
            element: '#sidebar-tab-portfolio', 
            popover: { 
              title: 'Portfolio', 
              description: 'You can keep your existing unlisted share records here.',
              side: 'right', 
              align: 'center' 
            } 
          },
          { 
            element: '#sidebar-tab-posts', 
            popover: { 
              title: 'My Posts', 
              description: 'You can check and manage your posts here.',
              side: 'right', 
              align: 'center' 
            } 
          },
          { 
            element: '#sidebar-tab-my-bids-offers', 
            popover: { 
              title: 'My Bids', 
              description: 'You can check your bids and offers placed on other users\' posts.',
              side: 'right', 
              align: 'center' 
            } 
          },
          { 
            element: '#dashboard-action-center', 
            popover: { 
              title: 'Action Center', 
              description: 'Important updates like received bids and counter-offers will appear here.',
              side: 'left', 
              align: 'start' 
            } 
          }
        ],
        nextBtnText: 'Next',
        prevBtnText: 'Previous',
        doneBtnText: 'Done',
        // Custom buttons for every step
        showButtons: ['prev', 'next', 'done'],
        onPopoverRender: (popover, { destroy }) => {
          // Add Skip button if not already present
          if (!popover.querySelector('.dashboard-tour-skip-btn')) {
            const skipBtn = document.createElement('button');
            skipBtn.innerText = 'Skip';
            skipBtn.className = 'dashboard-tour-skip-btn';
            skipBtn.type = 'button';
            skipBtn.style.cssText = `
              margin-left: 12px;
              background: #f3f4f6;
              border: 1px solid #d1d5db;
              color: #374151;
              padding: 6px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              position: relative;
              z-index: 10000;
              transition: all 0.2s ease;
            `;
            skipBtn.onmouseover = () => {
              skipBtn.style.background = '#e5e7eb';
              skipBtn.style.borderColor = '#9ca3af';
            };
            skipBtn.onmouseout = () => {
              skipBtn.style.background = '#f3f4f6';
              skipBtn.style.borderColor = '#d1d5db';
            };
            skipBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              localStorage.setItem('hasSeenDashboardTour', 'true');
              destroy();
            };
            // Insert into button row
            const btnRow = popover.querySelector('.driver-popover-footer');
            if (btnRow) {
              btnRow.style.display = 'flex';
              btnRow.style.justifyContent = 'space-between';
              btnRow.style.alignItems = 'center';
              btnRow.appendChild(skipBtn);
            }
          }
        },
        onDestroyStarted: () => {
          localStorage.setItem('hasSeenDashboardTour', 'true');
        },
      });

      // Small delay to ensure elements are rendered
      setTimeout(() => {
        driverObj.drive();
      }, 1500);
    }
  }, []);
};
