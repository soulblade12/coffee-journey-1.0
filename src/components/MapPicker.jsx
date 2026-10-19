import { useState } from 'react';
import { MapContainer, Marker, useMapEvents } from 'react-leaflet';
import { DarkTiles, Resize, FlyTo, pinIcon } from './mapParts';
import { DEFAULT_CENTER, locate } from '../lib/geo';

function Clicker({ onPick }) {
  useMapEvents({ click: e => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/** Peta kecil untuk menaruh/menggeser pin di dalam form. */
export default function MapPicker({ pos, onPick, readOnly = false, height = 220 }) {
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function useMe() {
    setBusy(true); setErr('');
    try { const p = await locate(); setTarget(p); onPick(p); }
    catch (e) { setErr(e.code === 1 ? 'Izin lokasi ditolak. Klik peta untuk menaruh pin manual.' : 'Lokasi tidak tersedia. Klik peta untuk menaruh pin manual.'); }
    setBusy(false);
  }

  return (
    <div className="picker">
      <MapContainer center={pos ? [pos.lat, pos.lng] : DEFAULT_CENTER} zoom={pos ? 16 : 12} style={{ height }}
        dragging={!readOnly} scrollWheelZoom={!readOnly} doubleClickZoom={!readOnly} touchZoom={!readOnly} zoomControl={!readOnly}>
        <DarkTiles /><Resize /><FlyTo target={target} />
        {!readOnly && <Clicker onPick={onPick} />}
        {pos && <Marker position={[pos.lat, pos.lng]} icon={pinIcon('', true)} draggable={!readOnly}
          eventHandlers={{ dragend: e => { const ll = e.target.getLatLng(); onPick({ lat: ll.lat, lng: ll.lng }); } }} />}
      </MapContainer>
      {!readOnly && (
        <div className="picker-bar">
          <button type="button" className="outline" onClick={useMe} disabled={busy}>{busy ? 'Mencari…' : 'Gunakan lokasi saya'}</button>
          {pos && <button type="button" className="ghost" onClick={() => onPick(null)}>Hapus pin</button>}
          <span className="meta">{pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : 'Klik peta untuk menaruh pin'}</span>
        </div>
      )}
      {err && <p className="meta err">{err}</p>}
    </div>
  );
}
