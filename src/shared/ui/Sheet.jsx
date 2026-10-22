import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

/**
 * Accessible Portal Bottom Sheet Drawer
 * Mounted to document.body via React Portal for flawless mobile/desktop rendering.
 */
export function Sheet({ open, onClose, title, children, className = '' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-walnut-shadow/80 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'w-full max-w-lg bg-[#140c06] border-t sm:border border-cork-border sm:rounded-card rounded-t-card max-h-[85vh] overflow-y-auto p-5 text-warm-cream shadow-2xl animate-slide-up sm:animate-fade-in',
          className
        )}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cork-border/50">
          <h3 className="font-sans font-medium uppercase tracking-wider text-sm text-warm-cream">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-driftwood hover:text-warm-cream p-1 rounded hover:bg-bark-brown/30 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default Sheet;
