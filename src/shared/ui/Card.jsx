import React from 'react';

/**
 * ORYZO AI Card Surface
 * 12px rounded corner, cork hairline border, walnut dark canvas, zero box-shadow
 */
export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  as: Component = 'div',
  ...props
}) {
  const hoverClass = hoverable
    ? 'hover:border-driftwood cursor-pointer transition-all duration-150'
    : '';

  return (
    <Component
      onClick={onClick}
      className={`bg-walnut-shadow/90 border border-cork-border rounded-card p-5 ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
