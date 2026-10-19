import { useState } from 'react';
import { MapContainer, Marker, useMapEvents } from 'react-leaflet';
import { SatelliteTiles, Resize, FlyTo, pinIcon } from './mapParts';
import { DEFAULT_CENTER, locate } from '../lib/geo';

function Clicker({ onPick }) {
  useMapEvents({ click: e => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/** Peta instrumen presisi untuk menaruh atau menggeser pin di dalam form log. */
export default function MapPicker({ pos, onPick, readOnly = false, height = 240 }) {
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function useMe() {
    setBusy(true);
    setErr('');
    try {
      const p = await locate();
      setTarget(p);
      onPick(p);
    } catch (e) {
      setErr(e.code === 1 ? 'IZIN GPS DITOLAK. KLIK PETA UNTUK PIN MANUAL.' : 'LOKASI TIDAK TERSEDIA.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inversa-map-picker">
      <div className="picker-container-frame">
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
          {!readOnly && <Clicker onPick={onPick} />}
          {pos && (
            <Marker
              position={[pos.lat, pos.lng]}
              icon={pinIcon('⌖', true)}
              draggable={!readOnly}
              eventHandlers={{
                dragend: e => {
                  const ll = e.target.getLatLng();
                  onPick({ lat: ll.lat, lng: ll.lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {!readOnly && (
        <div className="picker-telemetry-bar">
          <button type="button" className="btn-lime-sm" onClick={useMe} disabled={busy}>
            {busy ? 'MENGUNCI GPS...' : '⌖ AMBIL LOKASI SAYA SEKARANG'}
          </button>
          {pos && (
            <button type="button" className="btn-ghost-sm" onClick={() => onPick(null)}>
              HAPUS PIN //
            </button>
          )}
          <span className="mono-coords-readout">
            {pos ? `LAT ${pos.lat.toFixed(5)} · LON ${pos.lng.toFixed(5)}` : 'KLIK PADA CITRA SATELIT UNTUK KUNCI KOORDINAT'}
          </span>
        </div>
      )}
      {err && <div className="terminal-err-bar mono">{err}</div>}
    </div>
  );
}
