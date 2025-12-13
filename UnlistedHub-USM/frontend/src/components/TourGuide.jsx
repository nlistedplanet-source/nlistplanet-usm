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
            element: '#dashboard-sidebar', 
            popover: { 
              title: 'Navigation Menu', 
              description: 'Access Marketplace, Portfolio, History and more from here.',
              side: 'right', 
              align: 'start' 
            } 
          },
          { 
            element: '#dashboard-stats-grid', 
            popover: { 
              title: 'Portfolio Overview', 
              description: 'Track your total investment value, gains, and active listings at a glance.',
              side: 'bottom', 
              align: 'start' 
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
          },
          { 
            element: '#sidebar-tab-marketplace', 
            popover: { 
              title: 'Marketplace', 
              description: 'Click here to browse and buy unlisted shares from other users.',
              side: 'right', 
              align: 'center' 
            } 
          }
        ],
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
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
