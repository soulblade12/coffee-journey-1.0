import { useEffect, useRef } from 'react';
import { PAPERS, renderScrap } from '../lib/scrap';
import { download, fmtDate } from '../lib/util';

export default function Scrapbook({ visits, selectedId, onSelect, onUpdate }) {
  const ref = useRef(null);
  const sorted = [...visits].sort((a, b) => b.date.localeCompare(a.date));
  const v = visits.find(x => x.id === selectedId) || sorted[0];

  useEffect(() => {
    if (!v || !ref.current) return;
    let stale = false;
    renderScrap(ref.current, v, () => stale);
    return () => { stale = true; };
  }, [v]);

  return (
    <section className="terminal-scrap-section" aria-label="Dokumentasi Scrapbook">
      <div className="terminal-header">
        <div className="telemetry-bar">
          <span className="data-tag">VISUAL COMPILATION // 03</span>
          <span className="mono-label">SCRAPBOOK POLAROID & REVIEW</span>
          <span className="data-tag lime-invert">{sorted.length} ENTRI SIAP CETAK</span>
        </div>
        <h1 className="hero-display-title">
          EXPEDITION<br />SCRAPBOOK.
        </h1>
        <p className="hero-description">
          Kompilasi foto-foto survei kafe menjadi lembaran polaroid vintage lengkap dengan selotip washi, tiket cupping, dan koordinat. Siap diunduh format PNG.
        </p>
      </div>

      {!v ? (
        <div className="empty-field-box">
          <span className="mono-label">BELUM ADA DOKUMENTASI FOTO</span>
          <p>Catat kunjungan kafe dan lampirkan foto untuk membuat lembaran scrapbook otomatis.</p>
        </div>
      ) : (
        <>
          <div className="tactical-command-bar">
            <select
              value={v.id}
              onChange={e => onSelect(e.target.value)}
              aria-label="Pilih kunjungan kafe"
              className="select-instrument flex-grow"
            >
              {sorted.map(x => (
                <option key={x.id} value={x.id}>
                  {x.name.toUpperCase()} — {fmtDate(x.date)} {x.photos.length ? `(${x.photos.length} FOTO)` : '(NO PHOTO)'}
                </option>
              ))}
            </select>

            <select
              value={v.paper || 'night'}
              onChange={e => onUpdate(v.id, { paper: e.target.value })}
              aria-label="Tekstur kertas"
              className="select-instrument"
            >
              {Object.entries(PAPERS).map(([k, p]) => (
                <option key={k} value={k}>{p.label.toUpperCase()}</option>
              ))}
            </select>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => onUpdate(v.id, { seed: Math.floor(Math.random() * 1e9) })}
            >
              🎲 ACAK TATA LETAK
            </button>

            <button
              type="button"
              className="btn-lime"
              onClick={() => ref.current.toBlob(b => download(URL.createObjectURL(b), `scrapbook-${v.name.replace(/\W+/g, '-')}.png`))}
            >
              ⬇ UNDUH PNG
            </button>
          </div>

          <div className="inversa-scrapbook-canvas-wrap">
            <canvas ref={ref} aria-label="Pratinjau scrapbook polaroid" />
          </div>
        </>
      )}
    </section>
  );
}
