import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { DarkTiles, FlyTo, pinIcon } from './mapParts';
import { Stars } from './Stars';
import { DEFAULT_CENTER, locate, search } from '../lib/geo';
import { TYPES, fmtDate } from '../lib/util';

function Clicker({ onPick }) {
  useMapEvents({ click: e => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}
function FitOnce({ points }) {
  const map = useMap(), done = useRef(false);
  useEffect(() => {
    if (done.current || !points.length) return;
    done.current = true;
    if (points.length === 1) map.setView(points[0], 15);
    else map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 16 });
  }, [points, map]);
  return null;
}

export default function MapView({ visits, focus, onAdd, onOpen }) {
  const [draft, setDraft] = useState(null);
  const [me, setMe] = useState(null);
  const [target, setTarget] = useState(focus || null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [msg, setMsg] = useState('');
  const pinned = useMemo(() => visits.filter(v => typeof v.lat === 'number'), [visits]);
  const points = useMemo(() => pinned.map(v => [v.lat, v.lng]), [pinned]);

  async function goMe() {
    setMsg('Mencari lokasimu…');
    try { const p = await locate(); setMe(p); setDraft(p); setTarget(p); setMsg(''); }
    catch (e) { setMsg(e.code === 1 ? 'Izin lokasi ditolak di browser.' : 'Lokasi tidak tersedia.'); }
  }
  async function doSearch(e) {
    e.preventDefault(); if (!q.trim()) return;
    setMsg('Mencari…');
    try { const r = await search(q.trim()); setResults(r); setMsg(r.length ? '' : 'Tidak ditemukan.'); }
    catch { setMsg('Pencarian gagal. Cek koneksi internet.'); }
  }
  function pick(r) { setResults([]); setDraft({ lat: r.lat, lng: r.lng }); setTarget({ lat: r.lat, lng: r.lng }); }

  return (
    <section aria-label="Peta">
      <h2 className="section-title">Peta kopi</h2>
      <div className="toolbar">
        <form className="searchform" onSubmit={doSearch}>
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Cari tempat atau alamat" aria-label="Cari lokasi" />
          <button className="outline">Cari</button>
        </form>
        <button className="outline" onClick={goMe}>Lokasi saya</button>
      </div>
      {msg && <p className="meta">{msg}</p>}
      {results.length > 0 && (
        <ul className="results">
          {results.map((r, i) => <li key={i}><button className="ghost" onClick={() => pick(r)}>{r.label}</button></li>)}
        </ul>
      )}
      <p className="meta hint">Klik titik mana pun di peta untuk menaruh pin, lalu catat kopimu di sana. {pinned.length} pin tersimpan.</p>

      <div className="bigmap">
        <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: '100%' }}>
          <DarkTiles /><FitOnce points={points} /><FlyTo target={target} />
          <Clicker onPick={setDraft} />
          {me && <CircleMarker center={[me.lat, me.lng]} radius={8} pathOptions={{ color: '#fffdf9', weight: 2, fillColor: '#fffdf9', fillOpacity: .35 }} />}
          {pinned.map(v => (
            <Marker key={v.id} position={[v.lat, v.lng]} icon={pinIcon(v.rating.toFixed(1))}>
              <Popup>
                <div className="pop">
                  <b>{v.name}</b>
                  <div><Stars value={v.rating} /></div>
                  <div className="meta">{TYPES[v.type]} · {fmtDate(v.date)}</div>
                  {v.flavors?.length > 0 && <div className="meta">{v.flavors.join(', ')}</div>}
                  <button className="outline" onClick={() => onOpen(v.id)}>Buka catatan</button>
                </div>
              </Popup>
            </Marker>
          ))}
          {draft && (
            <Marker key={`${draft.lat},${draft.lng}`} position={[draft.lat, draft.lng]} icon={pinIcon('+', true)}
              ref={m => { if (m) setTimeout(() => m.openPopup(), 0); }}>
              <Popup>
                <div className="pop">
                  <b>Pin baru</b>
                  <div className="meta">{draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}</div>
                  <button className="primary" onClick={() => { onAdd(draft); setDraft(null); }}>☕ Catat kopi di sini</button>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </section>
  );
}
