import React, { useState, useEffect } from 'react';

const DeviceDebug = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-2 left-2 z-[9999] bg-black/80 text-white text-xs p-2 rounded-lg font-mono backdrop-blur-sm">
      <div>Width: {size.width}px</div>
      <div>Height: {size.height}px</div>
      <div>Mode: {size.isMobile ? '📱 Mobile' : '🖥️ Desktop'}</div>
      <div className="text-[10px] mt-1 text-gray-300">
        Breakpoint: {size.width < 640 ? 'xs' : size.width < 768 ? 'sm' : size.width < 1024 ? 'md' : size.width < 1280 ? 'lg' : 'xl'}
      </div>
    </div>
  );
};

export default DeviceDebug;
