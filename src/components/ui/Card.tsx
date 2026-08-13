import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

export function Card({
  children,
  className,
  hover,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-[#e7e7e2] bg-white shadow-[0_1px_2px_rgba(22,30,24,.025)]',
        hover && 'hover:border-[#d8e3d8] hover:shadow-sm transition-all cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
