import React, { HTMLAttributes } from 'react';

export type CardVariant = 'opaque' | 'glass' | 'warm';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'opaque',
  hoverable = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-3xl transition-all duration-300';

  const variantStyles = {
    opaque: 'bg-white border border-slate-200/80 shadow-xs',
    glass: 'glass-panel shadow-sm',
    warm: 'bg-[#FCFAF4] border border-[#8AD6D1]/30 shadow-2xs',
  }[variant];

  const hoverStyles = hoverable
    ? 'hover:shadow-xl hover:shadow-[#359F9F]/8 hover:-translate-y-0.5 hover:border-[#8AD6D1]'
    : '';

  return (
    <div className={`${baseStyles} ${variantStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
