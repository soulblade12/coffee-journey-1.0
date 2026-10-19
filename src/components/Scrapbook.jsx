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
    <section aria-label="Scrapbook">
      <h2 className="section-title">Scrapbook</h2>
      {!v ? <p className="empty">Tambahkan kunjungan dengan foto untuk membuat scrapbook.</p> : (
        <>
          <div className="toolbar">
            <select value={v.id} onChange={e => onSelect(e.target.value)} aria-label="Pilih kunjungan">
              {sorted.map(x => <option key={x.id} value={x.id}>{x.name} — {fmtDate(x.date)}</option>)}
            </select>
            <select value={v.paper || 'night'} onChange={e => onUpdate(v.id, { paper: e.target.value })} aria-label="Kertas">
              {Object.entries(PAPERS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
            </select>
            <button className="outline" onClick={() => onUpdate(v.id, { seed: Math.floor(Math.random() * 1e9) })}>Acak tata letak</button>
            <button className="outline" onClick={() => ref.current.toBlob(b => download(URL.createObjectURL(b), `scrapbook-${v.name.replace(/\W+/g, '-')}.png`))}>Unduh PNG</button>
          </div>
          <div className="scrapwrap"><canvas ref={ref} aria-label="Pratinjau scrapbook" /></div>
        </>
      )}
    </section>
  );
}
