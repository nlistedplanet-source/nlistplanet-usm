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

// Emergency cleanup function
export const forceCleanupTour = () => {
  // Remove all tour elements
  const overlays = document.querySelectorAll('.driver-overlay');
  const popovers = document.querySelectorAll('.driver-popover');
  const highlighted = document.querySelectorAll('.driver-highlighted-element');
  
  overlays.forEach(el => el.remove());
  popovers.forEach(el => el.remove());
  highlighted.forEach(el => el.classList.remove('driver-highlighted-element'));
  
  // Reset body styles
  document.body.style.overflow = '';
  document.body.classList.remove('driver-active');
  
  // Reset localStorage
  localStorage.removeItem('hasSeenDashboardTour');
  console.log('Tour force cleanup completed');
};

export const useDashboardTour = () => {
  useEffect(() => {
    // Add emergency cleanup to window for console access
    window.forceCleanupTour = forceCleanupTour;
    
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
            stagePadding: 8,
            stageRadius: 8,
            overlayOpacity: 0,
            smoothScroll: true,
            disableActiveInteraction: true,
            showButtons: ['close'],
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
        nextBtnText: 'Next Step →',
        prevBtnText: '← Previous',
        doneBtnText: 'Complete Tour! ✨',
        closeBtnText: 'Skip Tour',
        // Only show necessary buttons
        showButtons: ['close', 'next', 'previous'],
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
            skipBtn.innerText = '✕ Skip Tour';
            skipBtn.className = 'dashboard-tour-skip-btn btn-secondary';
            skipBtn.type = 'button';
            skipBtn.style.cssText = `
              margin-left: auto;
              margin-right: 8px;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              border: 2px solid #dc2626;
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 13px;
              font-weight: 700;
              position: relative;
              z-index: 10002;
              transition: all 0.3s ease;
              order: -1;
              box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
            `;
            skipBtn.onmouseover = () => {
              skipBtn.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
              skipBtn.style.transform = 'scale(1.05) translateY(-1px)';
              skipBtn.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
            };
            skipBtn.onmouseout = () => {
              skipBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              skipBtn.style.transform = 'scale(1)';
              skipBtn.style.boxShadow = '0 4px 6px -1px rgba(239, 68, 68, 0.3)';
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
          // Ensure overlay is removed
          const overlay = document.querySelector('.driver-overlay');
          if (overlay) {
            overlay.remove();
          }
        },
        onHighlightStarted: () => {
          // Ensure page is scrollable
          document.body.style.overflow = 'auto';
        }
      });

      // Immediate error check and start
      if (driverObj) {
        driverObj.drive();
      } else {
        console.error('Failed to initialize tour driver');
        localStorage.setItem('hasSeenDashboardTour', 'true');
      }
      
      } catch (error) {
        console.error('Tour initialization failed:', error);
        localStorage.setItem('hasSeenDashboardTour', 'true');
        // Remove any stuck overlays
        const overlays = document.querySelectorAll('.driver-overlay');
        overlays.forEach(overlay => overlay.remove());
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
