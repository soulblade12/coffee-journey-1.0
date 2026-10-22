import React from 'react';

export function Chip({
  label,
  active = false,
  onClick,
  onRemove,
  icon,
  className = '',
}) {
  const activeClasses = active
    ? 'bg-bark-brown text-warm-cream border-ember-accent/60'
    : 'bg-walnut-shadow text-driftwood border-cork-border hover:border-driftwood hover:text-warm-cream';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider rounded-ghost border transition-all duration-150 ${activeClasses} ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-driftwood hover:text-ember-accent text-xs"
        >
          ×
        </span>
      )}
    </button>
  );
}
