import { BADGES, computeStats, earned, missions, progress, titleFor, xpFor } from '../lib/game';
import { download, todayStr } from '../lib/util';

export default function Quest({ visits, onImport, notify }) {
  const s = computeStats(visits), got = earned(s), next = xpFor(s.level + 1);

  async function pickFile(e) {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (!Array.isArray(d) || d.some(v => !v.id || !v.name || !Array.isArray(v.photos))) throw 0;
      if (!confirm(`Ganti data saat ini dengan ${d.length} kunjungan dari berkas?`)) return;
      onImport(d);
    } catch { notify('Berkas tidak valid'); }
  }

  return (
    <section aria-label="Pencapaian">
      <div className="level">
        <div className="meta">Level {s.level}</div>
        <div className="big">{titleFor(s.level)}</div>
        <div className="bar"><i style={{ width: `${Math.round(progress(s) * 100)}%` }} /></div>
        <div className="meta">{s.xp} XP · {next - s.xp} XP lagi ke level {s.level + 1}</div>
        <p>{s.places} tempat · {s.total} kunjungan · {s.pins} pin · {s.photos} foto · streak {s.streak} minggu</p>
        <p className="meta">XP: tempat baru +25, kunjungan ulang +10, jenis baru +15, foto +5 (maks 5), pesanan +5, catatan lengkap +10, pin di peta +5, rasa kopi +5</p>
      </div>
      <h2 className="section-title">Misi minggu ini</h2>
      <div className="missions">
        {missions(visits).map(m => (
          <div key={m.t} className={`mission${m.done ? ' done' : ''}`}>
            <div className="top-row"><span className="em">{m.done ? '✅' : m.em}</span><b>{m.t}</b><span className="count">{m.n}/{m.goal}</span></div>
            <span className="bar"><i style={{ width: `${m.n / m.goal * 100}%` }} /></span>
          </div>
        ))}
      </div>
      <h2 className="section-title">Lencana</h2>
      <div className="badges">
        {BADGES.map(b => (
          <div key={b.id} className={`badge${got.has(b.id) ? '' : ' locked'}`}>
            <div className="ic">{b.ic}</div><b>{b.name}</b><small>{b.d}</small>
          </div>
        ))}
      </div>
      <h2 className="section-title">Data</h2>
      <div className="toolbar">
        <button className="outline" onClick={() => download(URL.createObjectURL(new Blob([JSON.stringify(visits)], { type: 'application/json' })), `jejak-kopi-${todayStr()}.json`)}>Ekspor cadangan</button>
        <label className="outline">Impor <input type="file" accept="application/json" hidden onChange={pickFile} /></label>
      </div>
    </section>
  );
}
