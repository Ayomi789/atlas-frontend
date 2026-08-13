import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#182019]/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl border border-[#e7e7e2] bg-white shadow-2xl`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ecece8]">
              <h2 className="text-[17px] font-semibold tracking-[-.025em] text-[#22231f]">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#7b7d76] hover:bg-[#f1f1ee] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
