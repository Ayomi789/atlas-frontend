import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

export function Badge({
  children,
  color = 'indigo',
  className,
}: {
  children: ReactNode;
  color?: 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate' | 'violet';
  className?: string;
}) {
  const colors = {
    indigo: 'bg-[#e7eee6] text-[#294637] border-[#d8e3d8]',
    cyan: 'bg-[#eaf6fb] text-[#277998] border-[#d5ebf4]',
    emerald: 'bg-[#f1f8ee] text-[#4c7e38] border-[#dcead4]',
    amber: 'bg-[#fff4e7] text-[#bd7119] border-[#f5e2c8]',
    rose: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
    slate: 'bg-[#f3f3f0] text-[#686a64] border-[#e4e5df]',
    violet: 'bg-[#f3efff] text-[#7657c7] border-[#e4dcf8]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}
