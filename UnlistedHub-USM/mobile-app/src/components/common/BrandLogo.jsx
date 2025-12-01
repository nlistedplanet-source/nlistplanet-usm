import React from 'react';

function BrandLogo({ size = 64, className = '', rounded = '2xl', alt = 'NlistPlanet' }) {
  const px = typeof size === 'number' ? `${size}px` : size;
  return (
    <div
      className={`overflow-hidden shadow-lg bg-white ${className}`}
      style={{ width: px, height: px, borderRadius: rounded === 'full' ? '9999px' : '16px' }}
    >
      <img
        src={process.env.PUBLIC_URL + '/logo192.png'}
        alt={alt}
        width={px}
        height={px}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => {
          // graceful fallback to letter avatar
          const el = e.currentTarget;
          const parent = el.parentElement;
          if (parent) {
            parent.style.background = 'linear-gradient(135deg,#6366f1,#7c3aed)';
            parent.style.display = 'flex';
            parent.style.alignItems = 'center';
            parent.style.justifyContent = 'center';
            parent.innerHTML = '<span style="font-weight:700;color:#fff;font-size:28px">N</span>';
          }
        }}
      />
    </div>
  );
}

export default BrandLogo;
