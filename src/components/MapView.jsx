import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { SatelliteTiles, TopoDarkTiles, Resize, FlyTo, pinIcon } from './mapParts';
import { Stars } from './Stars';
import { DEFAULT_CENTER, locate, search, reverse } from '../lib/geo';
import { TYPES, fmtDate } from '../lib/util';

function MapEventHandler({ onPick, onMouseMove }) {
  useMapEvents({
    click: e => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
    mousemove: e => onMouseMove({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

function FitOnce({ points }) {
  const map = useMap(), done = useRef(false);
  useEffect(() => {
    if (done.current || !points.length) return;
    done.current = true;
    if (points.length === 1) map.setView(points[0], 15);
    else map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 16 });
  }, [points, map]);
  return null;
}

export default function MapView({ visits, focus, onAdd, onOpen }) {
  const [draft, setDraft] = useState(null);
  const [draftArea, setDraftArea] = useState('');
  const [me, setMe] = useState(null);
  const [target, setTarget] = useState(focus || null);
  const [cursorPos, setCursorPos] = useState(null);
  const [layer, setLayer] = useState('sat'); // 'sat' | 'topo'
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [msg, setMsg] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const pinned = useMemo(() => visits.filter(v => typeof v.lat === 'number'), [visits]);
  const points = useMemo(() => pinned.map(v => [v.lat, v.lng]), [pinned]);

  // Reverse geocode when draft pin is placed
  useEffect(() => {
    if (!draft) { setDraftArea(''); return; }
    let active = true;
    reverse(draft.lat, draft.lng)
      .then(res => { if (active && res.area) setDraftArea(res.area); })
      .catch(() => {});
    return () => { active = false; };
  }, [draft]);

  async function goMe() {
    setIsLocating(true);
    setMsg('ACQUIRING SATELLITE FIX // MENGAMBIL LOKASI GPS...');
    try {
      const p = await locate();
      setMe(p);
      setDraft(p);
      setTarget(p);
      setMsg('');
    } catch (e) {
      setMsg(e.code === 1 ? 'AKSES GPS DITOLAK. KLIK PETA UNTUK MENANDAI SECARA MANUAL.' : 'LOKASI TIDAK DAPAT DITEMUKAN.');
    } finally {
      setIsLocating(false);
    }
  }

  async function doSearch(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setMsg('SEARCHING GEO DATABASE...');
    try {
      const r = await search(q.trim());
      setResults(r);
      setMsg(r.length ? '' : 'KOORDINAT TIDAK DITEMUKAN.');
    } catch {
      setMsg('GAGAL MENGHUBUNGI SERVER NOMINATIM.');
    }
  }

  function pick(r) {
    setResults([]);
    const pos = { lat: r.lat, lng: r.lng };
    setDraft(pos);
    setTarget(pos);
  }

  return (
    <section className="terminal-map-section" aria-label="Terminal Peta Lapangan">
      {/* Editorial Mission Header */}
      <div className="terminal-header">
        <div className="telemetry-bar">
          <span className="data-tag">FIELD SURVEY // RECON 01</span>
          <span className="mono-label">PETA KOORDINAT KAFE & SLOWBAR</span>
          <span className="data-tag lime-invert">{pinned.length} TITIK TERKUNCI</span>
        </div>
        <h1 className="hero-display-title">
          TANDAI PIN<br />KAFE DAHULU.
        </h1>
        <p className="hero-description">
          Arahkan kursor dan klik di mana saja pada citra satelit untuk mengunci koordinat. Masukkan profil seduhan, aroma, dan abadikan foto untuk scrapbook.
        </p>
      </div>

      {/* Tactical Command Control Bar */}
      <div className="tactical-command-bar">
        <form className="search-command" onSubmit={doSearch}>
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="CARI LOKASI ATAU ALAMAT..."
            aria-label="Cari koordinat"
          />
          <button type="submit" className="btn-ghost">CARI</button>
        </form>

        <button type="button" className="btn-lime" onClick={goMe} disabled={isLocating}>
          {isLocating ? 'MENGUNCI GPS...' : '⌖ LOKASI SAYA SEKARANG'}
        </button>

        <div className="layer-toggle-group">
          <button
            type="button"
            className={`btn-layer ${layer === 'sat' ? 'active' : ''}`}
            onClick={() => setLayer('sat')}
          >
            SATELLITE
          </button>
          <button
            type="button"
            className={`btn-layer ${layer === 'topo' ? 'active' : ''}`}
            onClick={() => setLayer('topo')}
          >
            TOPO DARK
          </button>
        </div>
      </div>

      {msg && <div className="terminal-status-msg mono">{msg}</div>}

      {results.length > 0 && (
        <ul className="geo-results-list">
          {results.map((r, i) => (
            <li key={i}>
              <button type="button" className="geo-item-btn" onClick={() => pick(r)}>
                <span className="coord-mono">[{r.lat.toFixed(4)}, {r.lng.toFixed(4)}]</span>
                <span className="label-text">{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Map Instrument Window */}
      <div className="terminal-map-wrapper">
        {/* Reticle HUD overlay */}
        <div className="map-hud-overlay">
          <div className="hud-metric">
            <span className="hud-key">CURSOR POS:</span>
            <span className="hud-val">
              {cursorPos ? `${cursorPos.lat.toFixed(5)}, ${cursorPos.lng.toFixed(5)}` : 'KLIK PETA UNTUK PIN'}
            </span>
          </div>
          {draft && (
            <div className="hud-metric target-locked">
              <span className="hud-key">TARGET PIN:</span>
              <span className="hud-val">{draft.lat.toFixed(5)}, {draft.lng.toFixed(5)} {draftArea && `// ${draftArea}`}</span>
            </div>
          )}
        </div>

        <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '100%' }}>
          {layer === 'sat' ? <SatelliteTiles /> : <TopoDarkTiles />}
          <Resize />
          <FitOnce points={points} />
          <FlyTo target={target} />
          <MapEventHandler onPick={setDraft} onMouseMove={setCursorPos} />

          {me && (
            <CircleMarker
              center={[me.lat, me.lng]}
              radius={9}
              pathOptions={{ color: '#ebfc72', weight: 2, fillColor: '#ebfc72', fillOpacity: 0.4 }}
            />
          )}

          {pinned.map(v => (
            <Marker key={v.id} position={[v.lat, v.lng]} icon={pinIcon(v.rating.toFixed(1))}>
              <Popup>
                <div className="terminal-popup">
                  <div className="popup-top">
                    <span className="data-tag">{TYPES[v.type] || 'KAFE'}</span>
                    <span className="coord-mono">{v.lat.toFixed(4)}, {v.lng.toFixed(4)}</span>
                  </div>
                  <h3 className="popup-title">{v.name}</h3>
                  <div className="popup-meta">
                    <Stars value={v.rating} />
                    <span className="mono-rating">{v.rating.toFixed(1)}/5.0</span>
                  </div>
                  {v.area && <div className="popup-area mono">{v.area}</div>}
                  {v.flavors?.length > 0 && (
                    <div className="popup-flavors">
                      {v.flavors.slice(0, 3).map(f => (
                        <span key={f} className="mini-tag">{f}</span>
                      ))}
                    </div>
                  )}
                  <button type="button" className="btn-lime popup-btn" onClick={() => onOpen(v.id)}>
                    BUKA CATATAN LOG //
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {draft && (
            <Marker
              key={`${draft.lat},${draft.lng}`}
              position={[draft.lat, draft.lng]}
              icon={pinIcon('+', true)}
              ref={m => { if (m) setTimeout(() => m.openPopup(), 10); }}
            >
              <Popup autoPan={true}>
                <div className="terminal-popup draft-popup">
                  <div className="popup-top">
                    <span className="data-tag lime-invert">TARGET TERKUNCI</span>
                    <span className="coord-mono">{draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}</span>
                  </div>
                  <p className="draft-prompt">
                    {draftArea ? `Lokasi terdeteksi: ${draftArea}` : 'Titik koordinat berhasil dikunci pada peta satelit.'}
                  </p>
                  <button
                    type="button"
                    className="btn-lime full-width"
                    onClick={() => { onAdd(draft); setDraft(null); }}
                  >
                    + CATAT KAFE DI SINI
                  </button>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Field Survey Log Table / Cards below the map */}
      <div className="survey-expedition-log">
        <div className="expedition-bar">
          <span className="data-tag">LOGBOOK SURVEY LAPANGAN ({pinned.length})</span>
          <span className="mono-label">TITIK YANG SUDAH DITANDAI PADA PETA</span>
        </div>

        {pinned.length === 0 ? (
          <div className="empty-field-box">
            <span className="mono-label">BELUM ADA PIN TERSIMPAN</span>
            <p>Klik titik mana pun pada citra satelit di atas atau tekan tombol "LOKASI SAYA SEKARANG" untuk menaruh pin pertama.</p>
          </div>
        ) : (
          <div className="survey-grid">
            {pinned.map(v => (
              <div key={v.id} className="survey-card" onClick={() => onOpen(v.id)}>
                <div className="survey-card-top">
                  <span className="coord-mono">{v.lat.toFixed(4)}, {v.lng.toFixed(4)}</span>
                  <span className="rating-tag">★ {v.rating.toFixed(1)}</span>
                </div>
                <h4 className="survey-card-name">{v.name}</h4>
                <div className="survey-card-meta">
                  <span className="type-tag">{TYPES[v.type]}</span>
                  <span className="date-mono">{fmtDate(v.date)}</span>
                </div>
                {v.area && <p className="area-text">{v.area}</p>}
                {v.flavors?.length > 0 && (
                  <div className="flavors-row">
                    {v.flavors.map(f => (
                      <span key={f} className="mini-chip">{f}</span>
                    ))}
                  </div>
                )}
                <div className="survey-card-actions">
                  <button
                    type="button"
                    className="btn-ghost-sm"
                    onClick={e => {
                      e.stopPropagation();
                      setTarget({ lat: v.lat, lng: v.lng });
                    }}
                  >
                    FOKUS PETA ⌖
                  </button>
                  <button type="button" className="btn-ghost-sm highlight">
                    DETAIL →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
