import React, { useState, useEffect } from 'react';
import { Sheet, Button } from '@/shared/ui';
import { getNearbyCafes, getAreaFromCoords } from './index';
import { haversineDistanceMeters } from '@/shared/lib/geo';
import { COPY } from '@/shared/copy/id';

export function PlaceSuggestSheet({
  open,
  lat,
  lng,
  onClose,
  onSelectCafe,
  onManualCheckin,
  onAddToWishlist,
}) {
  const [loading, setLoading] = useState(false);
  const [nearby, setNearby] = useState([]);
  const [areaName, setAreaName] = useState('');
  const [attribution, setAttribution] = useState('');

  useEffect(() => {
    if (!open || typeof lat !== 'number' || typeof lng !== 'number') {
      setNearby([]);
      setAreaName('');
      return;
    }

    let active = true;
    setLoading(true);

    Promise.all([
      getNearbyCafes(lat, lng, 400),
      getAreaFromCoords(lat, lng),
    ]).then(([placesData, areaData]) => {
      if (!active) return;
      setNearby(placesData.results || []);
      setAttribution(placesData.attribution || '');
      setAreaName(areaData.area || '');
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [open, lat, lng]);

  if (!open) return null;

  return (
    <Sheet open={open} onClose={onClose} title={COPY.places.suggestSheetTitle}>
      <div className="flex flex-col gap-4">
        {areaName && (
          <div className="text-xs text-driftwood flex items-center gap-1.5 pb-2 border-b border-cork-border/40 font-mono">
            <span>📍</span>
            <span>{areaName}</span>
          </div>
        )}

        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-driftwood text-xs">
            <div className="w-5 h-5 border-2 border-warm-cream/30 border-t-warm-cream rounded-full animate-spin" />
            <span>{COPY.places.searchingNearby}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {nearby.length > 0 ? (
              <>
                <p className="text-xs uppercase tracking-wider text-warm-cream/70 font-medium">
                  {COPY.places.selectFromList}
                </p>
                <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {nearby.map((cafe) => {
                    const dist = haversineDistanceMeters(lat, lng, cafe.lat, cafe.lng);
                    return (
                      <button
                        key={cafe.id}
                        type="button"
                        onClick={() => onSelectCafe(cafe, areaName)}
                        className="flex items-center justify-between p-2.5 bg-bark-brown/30 hover:bg-bark-brown/70 border border-cork-border/60 rounded text-left transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-warm-cream text-xs tracking-wide">
                            ☕ {cafe.name}
                          </span>
                          {cafe.area && (
                            <span className="text-[11px] text-driftwood">{cafe.area}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-driftwood bg-walnut-shadow px-1.5 py-0.5 rounded border border-cork-border/40">
                          {dist}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-driftwood py-2">
                Tidak ada kafe yang terdeteksi di sekitar titik ini. Kamu bisa menulis nama kafe secara manual.
              </p>
            )}

            <div className="flex flex-col gap-2 pt-3 border-t border-cork-border/40 mt-1">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => onManualCheckin(areaName)}
              >
                + Check-in Kunjungan Baru
              </Button>

              <Button
                variant="ghost"
                size="md"
                className="w-full text-amber-300 border-amber-800/40 hover:bg-amber-950/30"
                onClick={() => onAddToWishlist(areaName)}
              >
                ⭐ Simpan ke Wishlist (Mau Dicoba)
              </Button>
            </div>

            {attribution && (
              <div className="text-[10px] text-driftwood/60 text-center pt-2 font-mono">
                {attribution}
              </div>
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
}
