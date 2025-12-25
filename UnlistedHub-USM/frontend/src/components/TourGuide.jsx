import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Function to manually start tour (for reset/help button)
export const startDashboardTour = () => {
  localStorage.removeItem('hasSeenDashboardTour');
  window.location.reload(); // Reload to trigger tour
};

// Function to reset tour completely
export const resetDashboardTour = () => {
  localStorage.removeItem('hasSeenDashboardTour');
};

export const useDashboardTour = () => {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (!hasSeenTour) {
      let driverObj;
      
      const startTour = () => {
        try {
          driverObj = driver({
            showProgress: true,
            animate: true,
            overlayClickNext: false,
            allowClose: true,
            stagePadding: 4,
            stageRadius: 10,
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
          // Ensure popover is a valid DOM element
          const popoverElement = popover?.wrapper || popover;
          if (!popoverElement || typeof popoverElement.querySelector !== 'function') {
            console.warn('Invalid popover element:', popover);
            return;
          }
          
          // Add Skip button if not already present
          if (!popoverElement.querySelector('.dashboard-tour-skip-btn')) {
            const skipBtn = document.createElement('button');
            skipBtn.innerText = 'Skip Tour';
            skipBtn.className = 'dashboard-tour-skip-btn btn-secondary';
            skipBtn.type = 'button';
            skipBtn.style.cssText = `
              margin-left: auto;
              margin-right: 8px;
              background: #ef4444;
              border: 1px solid #dc2626;
              color: white;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              font-weight: 600;
              position: relative;
              z-index: 10001;
              transition: all 0.2s ease;
              order: -1;
            `;
            skipBtn.onmouseover = () => {
              skipBtn.style.background = '#dc2626';
              skipBtn.style.transform = 'scale(1.05)';
            };
            skipBtn.onmouseout = () => {
              skipBtn.style.background = '#ef4444';
              skipBtn.style.transform = 'scale(1)';
            };
            skipBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              localStorage.setItem('hasSeenDashboardTour', 'true');
              if (driverObj) {
                driverObj.destroy();
              } else {
                destroy();
              }
            };
            
            // Insert into button row with proper styling
            const btnRow = popoverElement.querySelector('.driver-popover-footer');
            if (btnRow) {
              btnRow.style.display = 'flex';
              btnRow.style.justifyContent = 'flex-end';
              btnRow.style.alignItems = 'center';
              btnRow.style.gap = '8px';
              btnRow.insertBefore(skipBtn, btnRow.firstChild);
            } else {
              // Fallback: add to popover directly
              const popoverContent = popoverElement.querySelector('.driver-popover-title, .driver-popover');
              if (popoverContent) {
                const btnContainer = document.createElement('div');
                btnContainer.style.cssText = 'margin-top: 10px; text-align: right;';
                btnContainer.appendChild(skipBtn);
                popoverContent.parentNode.appendChild(btnContainer);
              }
            }
          }
        },
        onDestroyStarted: () => {
          localStorage.setItem('hasSeenDashboardTour', 'true');
        },
        onDestroyed: () => {
          driverObj = null;
        }
      });

      // Start tour with error handling
      driverObj.drive();
      
      } catch (error) {
        console.error('Tour initialization failed:', error);
        localStorage.setItem('hasSeenDashboardTour', 'true');
      }
      };

      // Wait for elements to be rendered
      const checkElements = () => {
        const requiredElements = [
          '#sidebar-tab-marketplace',
          '#sidebar-tab-portfolio', 
          '#dashboard-action-center'
        ];
        
        const elementsExist = requiredElements.every(selector => 
          document.querySelector(selector)
        );
        
        if (elementsExist) {
          startTour();
        } else {
          setTimeout(checkElements, 500);
        }
      };
      
      setTimeout(checkElements, 1000);
    }
  }, []);
};
