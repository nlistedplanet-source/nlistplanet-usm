import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { haptic } from '../../utils/helpers';

/**
 * Reusable page header with optional back button and logo
 * @param {string} title - Main title text
 * @param {string} subtitle - Optional subtitle text
 * @param {boolean} showBack - Show back button (default: true)
 * @param {boolean} showLogo - Show brand logo (default: false)
 * @param {React.ReactNode} rightAction - Optional right side action button/element
 * @param {string} className - Additional CSS classes
 */
function PageHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  showLogo = false,
  rightAction,
  className = '',
  onBack
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    haptic.light();
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`bg-white border-b border-gray-100 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left: Back button or Logo */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 touch-feedback"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
          )}
          {showLogo && <BrandLogo size={40} />}
          <div>
            {title && (
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Optional action */}
        {rightAction && <div>{rightAction}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
