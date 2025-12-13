import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const useDashboardTour = () => {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    
    if (!hasSeenTour) {
      const driverObj = driver({
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
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || window.confirm("Are you sure you want to skip the tour?")) {
            driverObj.destroy();
            localStorage.setItem('hasSeenDashboardTour', 'true');
          }
        },
      });

      // Small delay to ensure elements are rendered
      setTimeout(() => {
        driverObj.drive();
      }, 1500);
    }
  }, []);
};
