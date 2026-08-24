import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary' | 'destructive'; className?: string }) => {
  const variants = {
    default: "bg-primary-50 text-primary-700 border border-primary-200",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    destructive: "bg-red-50 text-red-700 border border-red-200",
    outline: "border border-slate-300 text-slate-700 bg-white/50 backdrop-blur-sm"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
