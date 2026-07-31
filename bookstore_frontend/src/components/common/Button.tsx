import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-container/50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

  const variants = {
    primary:
      'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim shadow-xs border border-secondary-container/30',
    secondary:
      'bg-primary text-on-primary hover:bg-primary-container shadow-xs',
    outline:
      'border-1.5 border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container-low',
    ghost:
      'bg-transparent hover:bg-surface-container-low text-on-surface-variant',
    danger:
      'bg-error text-on-error hover:bg-red-700 shadow-xs',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin material-symbols-outlined text-base mr-2">progress_activity</span>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
