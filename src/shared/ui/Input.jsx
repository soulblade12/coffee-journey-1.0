import React from 'react';

export function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helper,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs uppercase tracking-wider text-warm-cream/80 font-medium flex items-center justify-between"
        >
          <span>{label}</span>
          {required && <span className="text-ember-accent">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-[#180f08] border border-cork-border text-warm-cream placeholder-driftwood/70 text-sm px-3.5 py-2.5 rounded-none focus:outline-none focus:border-warm-cream transition-colors duration-150 ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
      {helper && !error && <span className="text-xs text-driftwood">{helper}</span>}
    </div>
  );
}

export function Textarea({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  helper,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs uppercase tracking-wider text-warm-cream/80 font-medium"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-[#180f08] border border-cork-border text-warm-cream placeholder-driftwood/70 text-sm p-3 rounded-none focus:outline-none focus:border-warm-cream resize-y transition-colors duration-150 ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
      {helper && !error && <span className="text-xs text-driftwood">{helper}</span>}
    </div>
  );
}
