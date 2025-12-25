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
  const overlays = document.querySelectorAll('.driver-overlay, .driver-popover, .driver-popover-wrapper');
  const highlighted = document.querySelectorAll('.driver-highlighted-element');
  
  overlays.forEach(el => el.remove());
  highlighted.forEach(el => el.classList.remove('driver-highlighted-element'));
  
  // Reset body styles
  document.body.style.overflow = '';
  document.body.classList.remove('driver-active');
  
  // Reset localStorage
  localStorage.setItem('hasSeenDashboardTour', 'true');
  console.log('Tour force cleanup completed');
  
  // Reload page to ensure clean state
  setTimeout(() => {
    window.location.reload();
  }, 100);
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
            animate: false,
            overlayClickNext: false,
            allowClose: true,
            overlayOpacity: 0,
            disableActiveInteraction: false,
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
        showButtons: ['next', 'previous'],
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
            skipBtn.innerText = 'Skip';
            skipBtn.className = 'dashboard-tour-skip-btn';
            skipBtn.type = 'button';
            skipBtn.style.cssText = `
              background: #6b7280;
              border: 1px solid #6b7280;
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              margin-right: 10px;
            `;
            skipBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              localStorage.setItem('hasSeenDashboardTour', 'true');
              if (driverObj) {
                driverObj.destroy();
              }
            };
            // Insert into button row
            const btnRow = popoverElement.querySelector('.driver-popover-footer');
            if (btnRow) {
              btnRow.appendChild(skipBtn);
            }
          }
        },
        onDestroyStarted: () => {
          localStorage.setItem('hasSeenDashboardTour', 'true');
        },
        onDestroyed: () => {
          driverObj = null;
          // Force remove any remaining overlays
          const overlays = document.querySelectorAll('.driver-overlay');
          overlays.forEach(overlay => overlay.remove());
          document.body.style.overflow = '';
        }
      });

      // Start tour immediately
      driverObj.drive();
      
      } catch (error) {
        console.error('Tour failed:', error);
        localStorage.setItem('hasSeenDashboardTour', 'true');
        // Clean up any stuck elements
        document.querySelectorAll('.driver-overlay').forEach(el => el.remove());
        document.body.style.overflow = '';
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
