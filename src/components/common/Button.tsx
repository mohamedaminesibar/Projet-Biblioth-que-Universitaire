import React, { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'coral' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-[#359F9F] hover:bg-[#227878] text-white shadow-xs hover:shadow-md hover:shadow-[#359F9F]/15 active:scale-98',
    secondary: 'bg-[#8AD6D1]/20 hover:bg-[#8AD6D1]/30 text-[#227878] border border-[#8AD6D1]/40',
    coral: 'bg-[#FF8C52] hover:bg-[#E67236] text-white shadow-xs hover:shadow-md hover:shadow-[#FF8C52]/20 active:scale-98',
    outline: 'bg-white hover:bg-[#8AD6D1]/10 text-slate-700 border border-slate-200/80 hover:border-[#8AD6D1]',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
