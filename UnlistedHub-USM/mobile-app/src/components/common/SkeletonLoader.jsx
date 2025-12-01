import React from 'react';

// Skeleton for cards
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl p-4 animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
);

// Skeleton for listing cards
export const ListingCardSkeleton = () => (
  <div className="bg-white rounded-xl p-4 mb-3 animate-pulse">
    <div className="flex items-start gap-3 mb-3">
      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

// Skeleton for notifications
export const NotificationSkeleton = () => (
  <div className="border-b border-gray-100 p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

// Skeleton for profile stats
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl p-4 animate-pulse">
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
  </div>
);

// Full page loading skeleton
export const PageSkeleton = ({ title = '', cards = 3 }) => (
  <div className="pb-20">
    {/* Header */}
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6 pb-8">
      <div className="h-8 bg-white/20 rounded w-1/2 mb-2 animate-pulse"></div>
      {title && <div className="h-4 bg-white/20 rounded w-3/4 animate-pulse"></div>}
    </div>

    {/* Content */}
    <div className="px-4 -mt-4">
      {Array.from({ length: cards }).map((_, i) => (
        <CardSkeleton key={i} className="mb-3" />
      ))}
    </div>
  </div>
);

// List page skeleton
export const ListSkeleton = ({ count = 5, type = 'listing' }) => {
  const SkeletonComponent = type === 'notification' ? NotificationSkeleton : ListingCardSkeleton;
  
  return (
    <div className="pb-20">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};

// Detail page skeleton
export const DetailSkeleton = () => (
  <div className="pb-20">
    {/* Header Image */}
    <div className="h-48 bg-gray-200 animate-pulse"></div>

    {/* Content */}
    <div className="p-6">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default {
  CardSkeleton,
  ListingCardSkeleton,
  NotificationSkeleton,
  StatCardSkeleton,
  PageSkeleton,
  ListSkeleton,
  DetailSkeleton,
};
