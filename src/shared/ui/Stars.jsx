import React from 'react';

export function Stars({ value = 0, max = 5, size = 'sm' }) {
  const rounded = Math.round(Math.max(0, Math.min(max, value)));
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${sizeClasses[size]}`}
      role="img"
      aria-label={`${value.toFixed(1)} dari ${max} bintang`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={i < rounded ? 'text-ember-accent' : 'text-cork-border/70'}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function StarInput({ label, value = 0, onChange, max = 5 }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-cork-border/30">
      <span className="text-xs uppercase tracking-wide text-driftwood font-medium">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => {
          const starVal = i + 1;
          const active = starVal <= value;
          return (
            <button
              type="button"
              key={starVal}
              className={`text-lg p-1 transition-colors ${
                active ? 'text-ember-accent' : 'text-cork-border hover:text-driftwood'
              }`}
              onClick={() => onChange(value === starVal ? 0 : starVal)}
              aria-label={`${label} ${starVal} bintang`}
            >
              ★
            </button>
          );
        })}
      </div>
    </div>
  );
}
