// Device detection utilities

export const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Check user agent for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(userAgent);
  
  // Check screen width
  const isMobileWidth = window.innerWidth < 1024;
  
  // Check touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUA && isMobileWidth && hasTouch;
};

export const isTablet = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const tabletRegex = /iPad|Android(?!.*Mobile)/i;
  return tabletRegex.test(userAgent) && window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = () => {
  return !isMobileDevice() && !isTablet();
};

export const getDeviceType = () => {
  if (isMobileDevice()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};
