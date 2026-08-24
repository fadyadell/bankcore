import React from 'react';

export const Skeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`skeleton-shimmer bg-slate-200/50 rounded-lg ${className}`}></div>
  );
};
