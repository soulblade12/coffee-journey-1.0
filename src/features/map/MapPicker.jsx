import React, { useState } from 'react';
import { MapContainer, Marker, useMapEvents } from 'react-leaflet';
import { SatelliteTiles, Resize, FlyTo, draftPinIcon } from './mapParts';
import { DEFAULT_CENTER, locate } from '@/shared/lib/geo';
import { Button } from '@/shared/ui';

function MapClickHandler({ onPick }) {
  useMapEvents({
    click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

export function MapPicker({ pos, onPick, readOnly = false, height = 220 }) {
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handleUseGPS() {
    setBusy(true);
    setErr('');
    try {
      const p = await locate();
      setTarget(p);
      onPick(p);
    } catch (e) {
      setErr(e.code === 1 ? 'Izin GPS ditolak. Silakan klik langsung pada peta.' : 'Lokasi GPS tidak tersedia.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative border border-cork-border rounded overflow-hidden">
        <MapContainer
          center={pos ? [pos.lat, pos.lng] : DEFAULT_CENTER}
          zoom={pos ? 16 : 13}
          style={{ height }}
          dragging={!readOnly}
          scrollWheelZoom={!readOnly}
          doubleClickZoom={!readOnly}
          touchZoom={!readOnly}
          zoomControl={!readOnly}
        >
          <SatelliteTiles />
          <Resize />
          <FlyTo target={target} />
          {!readOnly && <MapClickHandler onPick={onPick} />}
          {pos && (
            <Marker
              position={[pos.lat, pos.lng]}
              icon={draftPinIcon()}
              draggable={!readOnly}
              eventHandlers={{
                dragend: (e) => {
                  const ll = e.target.getLatLng();
                  onPick({ lat: ll.lat, lng: ll.lng });
                },
              }}
            />
          )}
        </MapContainer>

        {!readOnly && (
          <div className="absolute top-2.5 right-2.5 z-[1000]">
            <Button
              variant="primary"
              size="sm"
              onClick={handleUseGPS}
              disabled={busy}
              className="bg-walnut-shadow/90 backdrop-blur border border-cork-border text-warm-cream text-xs"
            >
              {busy ? 'Mencari...' : '📍 Gunakan Posisi Saya'}
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-driftwood font-mono">
        <span>
          {pos
            ? `LAT ${pos.lat.toFixed(5)} · LNG ${pos.lng.toFixed(5)}`
            : 'Sentuh peta untuk memilih titik koordinat kafe'}
        </span>
        {pos && !readOnly && (
          <button
            type="button"
            onClick={() => onPick(null)}
            className="text-amber-400 hover:text-amber-300 underline"
          >
            Hapus Pin
          </button>
        )}
      </div>
      {err && <div className="text-xs text-amber-400">{err}</div>}
    </div>
  );
}

export default MapPicker;
