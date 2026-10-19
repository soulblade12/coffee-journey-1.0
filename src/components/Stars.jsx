export function Stars({ value }) {
  const r = Math.round(value);
  return (
    <span className="star" role="img" aria-label={`${value.toFixed(1)} dari 5`}>
      {'★'.repeat(r)}<span className="off">{'★'.repeat(5 - r)}</span>
    </span>
  );
}

export function StarInput({ label, value, onChange }) {
  return (
    <div className="rate">
      <span>{label}</span>
      <div className="stars">
        {[1, 2, 3, 4, 5].map(i => (
          <button type="button" key={i} className={i <= value ? 'on' : ''} aria-label={`${label}: ${i} bintang`}
            aria-pressed={i === value} onClick={() => onChange(value === i ? 0 : i)}>★</button>
        ))}
      </div>
    </div>
  );
}
