// components/UGC/common/Button.tsx
// Industrial Theme Button Component with Orange Accents

import React from 'react';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  children,
  icon,
  ...props
}) => {
  const baseStyles =
    'font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-lg hover:shadow-orange-500/30 border-orange-500/30 active:scale-95',
    secondary:
      'bg-zinc-700/50 text-zinc-200 hover:bg-zinc-600/50 border-zinc-600 hover:border-orange-500/50 active:scale-95',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/30 border-red-500/30 active:scale-95',
    ghost:
      'bg-transparent text-zinc-400 hover:text-orange-400 border-transparent hover:border-orange-500/30 hover:bg-zinc-700/30',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
