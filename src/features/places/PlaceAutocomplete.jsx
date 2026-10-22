import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { searchCafes } from './index';

export const PlaceAutocomplete = forwardRef(function PlaceAutocomplete(
  {
    value,
    onChange,
    onSelect,
    placeholder = 'Cari atau ketik nama kafe...',
    nearLat,
    nearLng,
    className = '',
  },
  ref
) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attribution, setAttribution] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    getElement: () => inputRef.current,
  }));

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { results, attribution } = await searchCafes(query, nearLat, nearLng);
        setSuggestions(results || []);
        setAttribution(attribution || '');
        setOpen((results || []).length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [query, nearLat, nearLng]);

  const handleSelect = (item) => {
    setQuery(item.name);
    setOpen(false);
    onChange(item.name);
    if (onSelect) onSelect(item);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full bg-[#180f08] border border-cork-border text-warm-cream placeholder-driftwood/70 text-sm px-3.5 py-2.5 rounded-none focus:outline-none focus:border-warm-cream transition-colors duration-150"
        />
        {loading && (
          <div className="absolute right-3 top-3 w-4 h-4 border-2 border-warm-cream/30 border-t-warm-cream rounded-full animate-spin" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-[#140c06] border border-cork-border rounded-card shadow-lg z-30 max-h-56 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left p-2.5 hover:bg-bark-brown/60 border-b border-cork-border/30 last:border-none flex flex-col transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-warm-cream">
                  ☕ {item.name}
                </span>
                <span className="text-[10px] text-driftwood font-mono">
                  {item.providerName || item.source}
                </span>
              </div>
              {item.area && (
                <span className="text-[11px] text-driftwood">{item.area}</span>
              )}
            </button>
          ))}
          {attribution && (
            <div className="p-2 text-[10px] text-driftwood/50 text-center font-mono border-t border-cork-border/20">
              {attribution}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default PlaceAutocomplete;
