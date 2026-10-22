import React from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * ORYZO AI Button Component
 * Pill-shaped (36px radius) or ghost (22.5px radius), uppercase weight 500, zero box shadow
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'ghost' | 'ember' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-sans font-medium uppercase tracking-wider transition-colors duration-150 select-none disabled:opacity-40 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 rounded-ghost gap-1.5',
    md: 'text-xs px-5 py-2.5 rounded-pill gap-2',
    lg: 'text-sm px-6 py-3 rounded-pill gap-2.5',
  };

  const variants = {
    primary:
      'bg-bark-brown text-warm-cream hover:bg-[#4a3120] active:bg-[#2e1d11] border border-cork-border/70',
    ghost:
      'bg-transparent text-warm-cream border border-cork-border hover:border-driftwood hover:bg-bark-brown/20 active:bg-bark-brown/40',
    ember:
      'bg-ember-accent/15 text-ember-accent border border-ember-accent/40 hover:bg-ember-accent/25',
    danger:
      'bg-red-950/40 text-red-300 border border-red-900/50 hover:bg-red-900/50',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
