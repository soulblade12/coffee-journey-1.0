import { useMemo, useState } from 'react';
import { Stars } from './Stars';
import { TYPES, fmtDate } from '../lib/util';

export default function Journal({ visits, onOpen }) {
  const [q, setQ] = useState(''), [type, setType] = useState(''), [sort, setSort] = useState('date');
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return visits
      .filter(v => (!type || v.type === type) && (!k || [v.name, v.area, v.menu, v.note, v.bean, ...(v.flavors || [])].join(' ').toLowerCase().includes(k)))
      .sort((a, b) => sort === 'rating' ? b.rating - a.rating : sort === 'name' ? a.name.localeCompare(b.name) : b.date.localeCompare(a.date) || b.created - a.created);
  }, [visits, q, type, sort]);
  const count = name => visits.filter(x => x.name.toLowerCase() === name.toLowerCase()).length;

  return (
    <section aria-label="Jurnal">
      <div className="toolbar">
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Cari tempat / area / menu / rasa" aria-label="Cari" />
        <select value={type} onChange={e => setType(e.target.value)} aria-label="Filter jenis">
          <option value="">Semua jenis</option>
          {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Urutkan">
          <option value="date">Terbaru</option><option value="rating">Rating tertinggi</option><option value="name">Nama A–Z</option>
        </select>
      </div>
      {visits.length === 0 && <p className="empty">Belum ada kunjungan. Tekan <b>+ Kunjungan</b> atau taruh pin di tab Peta untuk mencatat tempat pertamamu.</p>}
      <div className="grid">
        {list.map(v => (
          <button key={v.id} className="visit" onClick={() => onOpen(v.id)}>
            <div className="cover">{v.photos[0] ? <img src={v.photos[0]} alt="" loading="lazy" /> : v.sticker}<span className="score">★ {v.rating.toFixed(1)}</span></div>
            <div className="info">
              <h3>{v.name}</h3>
              <div><Stars value={v.rating} /> <span className="meta">{v.rating.toFixed(1)}</span></div>
              <div>
                <span className="tag">{TYPES[v.type]}</span>
                {typeof v.lat === 'number' && <span className="tag pin">📍 Di peta</span>}
                {count(v.name) > 1 && <span className="tag">{count(v.name)}×</span>}
              </div>
              <div className="meta">{fmtDate(v.date)}{v.area ? ` · ${v.area}` : ''}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
