import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

/**
 * Accessible Portal Modal
 * Mounted directly to document.body via React Portal to completely isolate
 * from any parent overflow, transform, or stacking context restrictions.
 */
export function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-2xl',
  className = '',
}) {
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
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-walnut-shadow/85 backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'w-full max-h-[92vh] overflow-y-auto bg-[#140c06] border border-cork-border rounded-card p-4 sm:p-6 shadow-2xl text-warm-cream relative animate-fade-in',
          maxWidth,
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-driftwood hover:text-warm-cream w-8 h-8 flex items-center justify-center rounded-full hover:bg-bark-brown/40 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default Modal;
