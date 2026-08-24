import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'default', asChild = false, className = '', ...props }, ref) => {
    const baseStyle = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variants: Record<string, string> = {
      primary: "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:shadow-primary-500/20",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200",
      outline: "border-2 border-slate-200 bg-white/50 backdrop-blur-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300",
      danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-red-500/20",
      ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
      link: "bg-transparent underline-offset-4 hover:underline text-primary-600"
    };
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    const combinedClassName = `${baseStyle} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`;

    if (asChild && React.isValidElement<{ className?: string }>(children)) {
      return React.cloneElement(children, {
        className: `${combinedClassName} ${children.props.className || ''}`,
        ...props
      });
    }

    return (
      <button className={combinedClassName} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
