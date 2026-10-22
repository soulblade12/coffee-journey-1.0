import React from 'react';

/**
 * Visual coffee cupping / sensory indicator
 * Displays Acidity, Body, Sweetness, Aftertaste with visual metric bars & process badge
 */
export function CuppingRadar({ sensory, className = '' }) {
  if (!sensory) return null;

  const {
    acidity = 3,
    body = 3,
    sweetness = 3,
    aftertaste = 3,
    process = 'washed',
    roast = 'medium',
    category = 'black',
  } = sensory;

  const metrics = [
    { label: 'Acidity', value: acidity, max: 5 },
    { label: 'Body', value: body, max: 5 },
    { label: 'Sweetness', value: sweetness, max: 5 },
    { label: 'Aftertaste', value: aftertaste, max: 5 },
  ];

  const processLabels = {
    washed: 'Washed Process',
    natural: 'Natural Process',
    honey: 'Honey Process',
    anaerobic: 'Anaerobic Ferment',
    wet_hulled: 'Giling Basah (Wet-Hulled)',
  };

  const roastLabels = {
    light: 'Light Roast',
    medium: 'Medium Roast',
    dark: 'Dark Roast',
  };

  return (
    <div className={`flex flex-col gap-3 p-3.5 bg-[#180f08] border border-cork-border rounded-card ${className}`}>
      <div className="flex items-center justify-between text-xs border-b border-cork-border/40 pb-2">
        <span className="font-mono text-driftwood uppercase tracking-wider">
          {category === 'milk' ? '🥛 Kopi Susu' : '☕ Kopi Hitam'}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-ember-accent px-2 py-0.5 rounded bg-ember-accent/10 border border-ember-accent/30 font-mono">
            {processLabels[process] || process}
          </span>
          <span className="text-[11px] text-warm-cream/70 font-mono">
            {roastLabels[roast] || roast}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-warm-cream/80">{m.label}</span>
              <span className="text-amber-300 font-bold">{m.value}/5</span>
            </div>
            <div className="h-1.5 w-full bg-walnut-shadow rounded-full overflow-hidden border border-cork-border/50">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-ember-accent transition-all duration-300 rounded-full"
                style={{ width: `${(m.value / m.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
