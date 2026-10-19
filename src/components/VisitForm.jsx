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
    } catch { /* offline fallback */ }
  }

  useEffect(() => {
    if (!initial && draft) onPick(draft);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function addPhotos(e) {
    const files = [...e.target.files];
    e.target.value = '';
    for (const file of files) {
      if (f.photos.length >= 6) { notify('MAKSIMAL 6 FOTO PER ENTRI LOG'); break; }
      try {
        const d = await compress(file);
        setF(p => p.photos.length < 6 ? { ...p, photos: [...p.photos, d] } : p);
      } catch {
        notify('GAGAL MEMBACA FORMAT BERKAS FOTO');
      }
    }
  }

  const toggleFlavor = x => set({
    flavors: f.flavors.includes(x) ? f.flavors.filter(y => y !== x) : [...f.flavors, x],
  });
  const setRate = key => v => set({ ratings: { ...f.ratings, [key]: v } });

  function submit(e) {
    e.preventDefault();
    const r = Object.values(f.ratings).filter(Boolean);
    if (!r.length) return setError('MASUKKAN MINIMAL SATU METRIK RATING UNTUK MENYIMPAN.');
    onSave({
      ...f,
      name: f.name.trim(),
      area: f.area.trim(),
      menu: f.menu.trim(),
      bean: f.bean.trim(),
      note: f.note.trim(),
      rating: r.reduce((a, b) => a + b, 0) / r.length,
    });
  }

  return (
    <form className="inversa-form" onSubmit={submit}>
      <div className="form-head">
        <span className="data-tag">
          {initial ? 'UPDATE ENTRY // RECORD EDIT' : 'NEW EXPEDITION LOG // SURVEY RECON'}
        </span>
        <h2 className="form-title">
          {initial ? 'UBAH DATA KUNJUNGAN' : 'CATAT KUNJUNGAN BARU'}
        </h2>
      </div>

      {/* 01: PIN LAPANGAN */}
      <div className="form-section-box">
        <div className="box-header-row">
          <span className="mono-sub">01 // LOKASI PETA SATELIT</span>
          <span className="coord-chip-lime">
            {pos ? `LAT ${pos.lat.toFixed(5)} · LON ${pos.lng.toFixed(5)}` : 'BELUM DITANDAI'}
          </span>
        </div>
        <MapPicker pos={pos} onPick={onPick} height={200} />
      </div>

      {/* 02: IDENTITAS */}
      <div className="form-section-box">
        <span className="mono-sub">02 // IDENTITAS KAFE & WAKTU</span>
        <label className="field-label">
          <span>NAMA KAFE / SLOWBAR *</span>
          <input
            required
            maxLength={80}
            value={f.name}
            onChange={e => set({ name: e.target.value })}
            placeholder="mis. Kopi Senja Kemang"
          />
        </label>

        <div className="form-grid-2">
          <label className="field-label">
            <span>KATEGORI TEMPAT</span>
            <select value={f.type} onChange={e => set({ type: e.target.value })}>
              {Object.entries(TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.toUpperCase()}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            <span>TANGGAL OBSERVASI *</span>
            <input
              type="date"
              required
              value={f.date}
              onChange={e => set({ date: e.target.value })}
            />
          </label>
        </div>

        <label className="field-label">
          <span>AREA / KOTA</span>
          <input
            maxLength={60}
            value={f.area}
            onChange={e => set({ area: e.target.value })}
            placeholder="mis. Kemang, Jakarta Selatan"
          />
        </label>
      </div>

      {/* 03: SEDUHAN & RASA */}
      <div className="form-section-box">
        <span className="mono-sub">03 // REKAMAN SENSORI & CUPPING</span>
        <label className="field-label">
          <span>MENU YANG DIPESAN</span>
          <input
            maxLength={120}
            value={f.menu}
            onChange={e => set({ menu: e.target.value })}
            placeholder="mis. V60 Guji Natural + Croissant"
          />
        </label>

        <div className="form-grid-2">
          <label className="field-label">
            <span>METODE SEDUH</span>
            <select value={f.brew} onChange={e => set({ brew: e.target.value })}>
              <option value="">— PILIH METODE —</option>
              {BREWS.map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}
            </select>
          </label>
          <label className="field-label">
            <span>ORIGIN / PROSES BIJI</span>
            <input
              maxLength={60}
              value={f.bean}
              onChange={e => set({ bean: e.target.value })}
              placeholder="mis. Ethiopia Guji, Anaerobic Natural"
            />
          </label>
        </div>

        <div className="field-label">
          <span>PROFIL RASA YANG TERDETEKSI (TASTING NOTES)</span>
          <div className="tactical-chips-grid">
            {FLAVORS.map(x => (
              <button
                type="button"
                key={x}
                className={`tactical-chip ${f.flavors.includes(x) ? 'selected' : ''}`}
                aria-pressed={f.flavors.includes(x)}
                onClick={() => toggleFlavor(x)}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        <label className="field-label">
          <span>CATATAN SENSORI / JURNAL SUASANA</span>
          <textarea
            rows={3}
            maxLength={400}
            value={f.note}
            onChange={e => set({ note: e.target.value })}
            placeholder="Aroma basah/kering, aftertaste, keasaman, intensitas body, atau suasana obrolan hari itu..."
          />
        </label>
      </div>

      {/* 04: EVALUASI RATING */}
      <div className="form-section-box">
        <span className="mono-sub">04 // METRIK EVALUASI</span>
        <div className="star-inputs-list">
          <StarInput label="KUALITAS KOPI" value={f.ratings.coffee} onChange={setRate('coffee')} />
          <StarInput label="SUASANA (VIBE)" value={f.ratings.vibe} onChange={setRate('vibe')} />
          <StarInput label="HOSPITALITY / PELAYANAN" value={f.ratings.service} onChange={setRate('service')} />
        </div>
      </div>

      {/* 05: DOKUMENTASI FOTO */}
      <div className="form-section-box">
        <span className="mono-sub">05 // DOKUMENTASI VISUAL & SCRAPBOOK</span>
        <label className="field-label file-upload-box">
          <span className="mono-label">[+] UNGGAH FOTO (MAKS. 6 FOTO)</span>
          <input type="file" accept="image/*" multiple onChange={addPhotos} />
        </label>

        {f.photos.length > 0 && (
          <div className="thumbs-strip">
            {f.photos.map((p, i) => (
              <div key={i} className="thumb-item">
                <img src={p} alt={`Foto ${i + 1}`} />
                <button
                  type="button"
                  className="btn-del-thumb"
                  aria-label="Hapus foto"
                  onClick={() => set({ photos: f.photos.filter((_, j) => j !== i) })}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="field-label">
          <span>EMBLEM SCRAPBOOK</span>
          <select value={f.sticker} onChange={e => set({ sticker: e.target.value })}>
            {STICKERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {error && <div className="terminal-err-bar mono">{error}</div>}

      <div className="form-actions-bottom">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          BATAL // CANCEL
        </button>
        <button type="submit" className="btn-lime">
          {initial ? 'SIMPAN PERUBAHAN RECORD' : 'REKAM KE LOGBOOK & PETA'}
        </button>
      </div>
    </form>
  );
}
