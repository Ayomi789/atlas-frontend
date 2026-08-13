import { cn } from '../../lib/utils';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className, id, ...props }: Props) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#555851] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#979990]">{icon}</div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-[#e4e5df] bg-[#fcfcfb] text-[#20211f] placeholder:text-[#999b94]',
            'px-3.5 py-2.5 text-sm outline-none transition',
            'focus:border-[#789483] focus:ring-2 focus:ring-[#dce9dd]',
            icon ? 'pl-10' : undefined,
            error ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-400' : undefined,
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
