import { useEffect, useRef, useState } from 'react';
import { StarInput } from './Stars';
import MapPicker from './MapPicker';
import { reverse } from '../lib/geo';
import { BREWS, FLAVORS, STICKERS, TYPES, compress, todayStr } from '../lib/util';

const blank = (draft) => ({
  name: '', type: 'kedai kopi', date: todayStr(), area: '', menu: '', brew: '', bean: '', flavors: [], note: '',
  sticker: '☕', photos: [], ratings: { coffee: 0, vibe: 0, service: 0 },
  lat: draft?.lat, lng: draft?.lng,
});

export default function VisitForm({ initial, draft, onSave, onCancel, notify }) {
  const [f, setF] = useState(() => initial ? { ...blank(), ...initial, ratings: { coffee: 0, vibe: 0, service: 0, ...initial.ratings } } : blank(draft));
  const [error, setError] = useState('');
  const geoSeq = useRef(0);
  const set = patch => setF(p => ({ ...p, ...patch }));
  const pos = typeof f.lat === 'number' ? { lat: f.lat, lng: f.lng } : null;

  async function onPick(p) {
    if (!p) return set({ lat: undefined, lng: undefined });
    set({ lat: p.lat, lng: p.lng });
    const seq = ++geoSeq.current;
    try {
      const r = await reverse(p.lat, p.lng);
      if (seq === geoSeq.current) setF(prev => ({ ...prev, area: prev.area || r.area, name: prev.name || r.name }));
    } catch { /* opsional: abaikan jika offline */ }
  }
  // Pin dari klik peta: isi area/nama otomatis sekali saat form dibuka
  useEffect(() => { if (!initial && draft) onPick(draft); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function addPhotos(e) {
    const files = [...e.target.files]; e.target.value = '';
    for (const file of files) {
      if (f.photos.length >= 6) { notify('Maksimal 6 foto per kunjungan'); break; }
      try { const d = await compress(file); setF(p => p.photos.length < 6 ? { ...p, photos: [...p.photos, d] } : p); }
      catch { notify('Gagal membaca foto'); }
    }
  }
  const toggleFlavor = x => set({ flavors: f.flavors.includes(x) ? f.flavors.filter(y => y !== x) : [...f.flavors, x] });
  const setRate = key => v => set({ ratings: { ...f.ratings, [key]: v } });

  function submit(e) {
    e.preventDefault();
    const r = Object.values(f.ratings).filter(Boolean);
    if (!r.length) return setError('Beri minimal satu rating.');
    onSave({
      ...f, name: f.name.trim(), area: f.area.trim(), menu: f.menu.trim(), bean: f.bean.trim(), note: f.note.trim(),
      rating: r.reduce((a, b) => a + b, 0) / r.length,
    });
  }

  return (
    <form onSubmit={submit}>
      <h2>{initial ? 'Ubah kunjungan' : 'Kunjungan baru'}</h2>

      <label>Lokasi di peta (opsional)</label>
      <MapPicker pos={pos} onPick={onPick} />

      <label>Nama tempat
        <input required maxLength={80} value={f.name} onChange={e => set({ name: e.target.value })} placeholder="mis. Kopi Kenangan Senja" />
      </label>
      <div className="row">
        <label>Jenis
          <select value={f.type} onChange={e => set({ type: e.target.value })}>
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>Tanggal <input type="date" required value={f.date} onChange={e => set({ date: e.target.value })} /></label>
      </div>
      <label>Area / Kota <input maxLength={60} value={f.area} onChange={e => set({ area: e.target.value })} placeholder="mis. Kemang, Jakarta" /></label>

      <fieldset>
        <legend>Catatan kopi</legend>
        <label>Pesanan <input maxLength={120} value={f.menu} onChange={e => set({ menu: e.target.value })} placeholder="mis. V60 Ethiopia + croissant" /></label>
        <div className="row">
          <label>Metode seduh
            <select value={f.brew} onChange={e => set({ brew: e.target.value })}>
              <option value="">—</option>
              {BREWS.map(b => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label>Biji / origin <input maxLength={60} value={f.bean} onChange={e => set({ bean: e.target.value })} placeholder="mis. Gayo, natural" /></label>
        </div>
        <div className="label-like">Rasa yang terasa</div>
        <div className="chips">
          {FLAVORS.map(x => (
            <button type="button" key={x} className={`chip${f.flavors.includes(x) ? ' on' : ''}`} aria-pressed={f.flavors.includes(x)} onClick={() => toggleFlavor(x)}>{x}</button>
          ))}
        </div>
        <label>Catatan bebas
          <textarea rows={3} maxLength={400} value={f.note} onChange={e => set({ note: e.target.value })} placeholder="Aroma, rasa, body, cerita hari itu…" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Rating</legend>
        <StarInput label="Kopi" value={f.ratings.coffee} onChange={setRate('coffee')} />
        <StarInput label="Suasana" value={f.ratings.vibe} onChange={setRate('vibe')} />
        <StarInput label="Pelayanan" value={f.ratings.service} onChange={setRate('service')} />
      </fieldset>

      <label>Foto (maks. 6)
        <input type="file" accept="image/*" multiple onChange={addPhotos} />
      </label>
      <div className="thumbs">
        {f.photos.map((p, i) => (
          <div key={i}><img src={p} alt={`Foto ${i + 1}`} />
            <button type="button" aria-label="Hapus foto" onClick={() => set({ photos: f.photos.filter((_, j) => j !== i) })}>×</button></div>
        ))}
      </div>

      <label>Stiker scrapbook
        <select value={f.sticker} onChange={e => set({ sticker: e.target.value })}>{STICKERS.map(s => <option key={s}>{s}</option>)}</select>
      </label>

      {error && <p className="meta err" role="alert">{error}</p>}
      <div className="actions">
        <button type="button" className="ghost" onClick={onCancel}>Batal</button>
        <button className="primary">Simpan</button>
      </div>
    </form>
  );
}
