import { cn } from '../../lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading,
  disabled,
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#789483]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafaf8] disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#294637] text-white shadow-sm hover:bg-[#1d362a]',
    secondary: 'bg-[#e7eee6] text-[#294637] hover:bg-[#dfeedd]',
    ghost: 'text-[#666962] hover:bg-[#efefeb] hover:text-[#294637]',
    danger: 'bg-[#fef2f2] text-[#b91c1c] hover:bg-[#fee2e2] border border-[#fecaca]',
    outline:
      'border border-[#e4e5df] bg-white text-[#555851] hover:bg-[#fcfcfb] hover:border-[#cfd1c9]',
  };
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-sm px-5 py-3',
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className={cn(
            'h-3.5 w-3.5 border-2 rounded-full animate-spin',
            variant === 'primary'
              ? 'border-white/30 border-t-white'
              : 'border-[#294637]/25 border-t-[#294637]'
          )}
        />
      )}
      {children}
    </button>
  );
}
