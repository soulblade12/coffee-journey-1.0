import { useMemo, useState } from 'react';
import { Stars } from './Stars';
import { TYPES, fmtDate } from '../lib/util';

export default function Journal({ visits, onOpen, onGoMap }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('date');

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return visits
      .filter(v => (!type || v.type === type) && (!k || [v.name, v.area, v.menu, v.note, v.bean, ...(v.flavors || [])].join(' ').toLowerCase().includes(k)))
      .sort((a, b) => sort === 'rating' ? b.rating - a.rating : sort === 'name' ? a.name.localeCompare(b.name) : b.date.localeCompare(a.date) || b.created - a.created);
  }, [visits, q, type, sort]);

  const count = name => visits.filter(x => x.name.toLowerCase() === name.toLowerCase()).length;

  return (
    <section className="terminal-log-section" aria-label="Logbook Kafe">
      <div className="terminal-header">
        <div className="telemetry-bar">
          <span className="data-tag">EXPEDITION ARCHIVE // 02</span>
          <span className="mono-label">REKAMAN SENSORI & SEDUHAN</span>
          <span className="data-tag lime-invert">{visits.length} ENTRI TERSIMPAN</span>
        </div>
        <h1 className="hero-display-title">
          LOGBOOK<br />KUNJUNGAN.
        </h1>
        <p className="hero-description">
          Daftar seluruh kedai kopi, cafe, dan slowbar yang telah dieksplorasi beserta catatan cupping, rating multi-dimensi, dan koordinat GPS.
        </p>
      </div>

      <div className="tactical-command-bar">
        <div className="search-command">
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="FILTER NAMA, AREA, ORIGIN, ATAU PROFIL RASA..."
            aria-label="Cari entri log"
          />
        </div>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          aria-label="Filter kategori"
          className="select-instrument"
        >
          <option value="">SEMUA KATEGORI</option>
          {Object.entries(TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v.toUpperCase()}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          aria-label="Urutan data"
          className="select-instrument"
        >
          <option value="date">TERBARU // WAKTU</option>
          <option value="rating">RATING TERTINGGI</option>
          <option value="name">NAMA TEMPAT [A-Z]</option>
        </select>
      </div>

      {visits.length === 0 ? (
        <div className="empty-field-box">
          <span className="mono-label">LOGBOOK MASIH KOSONG</span>
          <p>Belum ada rekaman survei kafe. Mulai dengan menandai pin pertama langsung di peta satelit.</p>
          <button type="button" className="btn-lime" onClick={onGoMap}>
            ⌖ BUKA PETA & TANDAI PIN DAHULU
          </button>
        </div>
      ) : (
        <div className="log-cards-grid">
          {list.map(v => (
            <button key={v.id} className="inversa-card" onClick={() => onOpen(v.id)}>
              <div className="card-imagery">
                {v.photos[0] ? (
                  <img src={v.photos[0]} alt="" loading="lazy" />
                ) : (
                  <div className="cover-fallback-mono">
                    <span className="stamp-icon">{v.sticker || '⌖'}</span>
                    <span className="mono-caption">// NO PHOTO ATTACHED</span>
                  </div>
                )}
                <div className="card-stamp-tag">
                  ★ {v.rating.toFixed(1)}
                </div>
              </div>

              <div className="card-data-body">
                <div className="card-coords-row">
                  {typeof v.lat === 'number' ? (
                    <span className="coord-chip-lime">
                      ⌖ {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                    </span>
                  ) : (
                    <span className="coord-chip-dim">// NO GPS LOCK</span>
                  )}
                  <span className="type-badge">{TYPES[v.type] || 'KAFE'}</span>
                  {count(v.name) > 1 && (
                    <span className="mono-repeat-badge">REVISIT {count(v.name)}×</span>
                  )}
                </div>

                <h3 className="card-title">{v.name}</h3>

                <div className="rating-telemetry">
                  <Stars value={v.rating} />
                  <span className="score-mono">
                    KOPI {v.ratings.coffee || '-'} // VIBE {v.ratings.vibe || '-'} // SERV {v.ratings.service || '-'}
                  </span>
                </div>

                {v.menu && <p className="card-menu-line">{v.menu}</p>}
                {(v.brew || v.bean) && (
                  <p className="card-brew-line mono">
                    {[v.brew, v.bean].filter(Boolean).join(' · ')}
                  </p>
                )}

                {v.flavors?.length > 0 && (
                  <div className="card-flavors-row">
                    {v.flavors.map(f => (
                      <span key={f} className="mini-chip">{f}</span>
                    ))}
                  </div>
                )}

                <div className="card-footer-date mono">
                  {fmtDate(v.date)}{v.area ? ` // ${v.area}` : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
