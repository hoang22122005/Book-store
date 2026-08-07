import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'discount' | 'new' | 'trending' | 'recommend' | 'primary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const variantStyles = {
    discount: 'bg-secondary-container text-on-secondary-container font-bold',
    new: 'bg-primary text-white font-medium',
    trending: 'bg-error text-white font-bold uppercase tracking-widest',
    recommend: 'text-secondary font-medium',
    primary: 'bg-primary-fixed text-primary font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-caption ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
