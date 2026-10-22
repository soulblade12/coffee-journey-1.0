import React from 'react';

export function Tag({
  children,
  variant = 'default', // 'default' | 'ember' | 'wishlist' | 'olive'
  size = 'sm',
  className = '',
}) {
  const variants = {
    default: 'bg-bark-brown/60 text-warm-cream/90 border border-cork-border/70',
    ember: 'bg-ember-accent/15 text-ember-accent border border-ember-accent/40',
    wishlist: 'bg-amber-950/40 text-amber-200 border border-amber-600/50',
    olive: 'bg-emerald-950/40 text-emerald-300 border border-emerald-700/50',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider rounded-sm ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
