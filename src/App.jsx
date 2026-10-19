import { useCallback, useEffect, useRef, useState } from 'react';
import Journal from './components/Journal';
import MapView from './components/MapView';
import Scrapbook from './components/Scrapbook';
import Quest from './components/Quest';
import Modal from './components/Modal';
import VisitForm from './components/VisitForm';
import VisitDetail from './components/VisitDetail';
import { loadVisits, saveVisits } from './lib/storage';
import { BADGES, computeStats, earned, missions, progress, titleFor } from './lib/game';
import { confetti } from './lib/confetti';

const TABS = [['journal', 'Jurnal'], ['map', 'Peta'], ['scrap', 'Scrapbook'], ['quest', 'Pencapaian']];

function Hero({ visits, onAdd, onMap }) {
  const s = computeStats(visits), ms = missions(visits), done = ms.filter(m => m.done).length;
  return (
    <section className="hero">
      <div className="stickers" aria-hidden="true"><span>☕</span><span>🥐</span><span>🫖</span><span>🍰</span></div>
      <h1>Ayo <em>berburu</em> kafe favoritmu!</h1>
      <p className="lead">Tandai kedai kopi, cafe, dan slowbar di peta. Catat rasa kopimu, kumpulkan XP, selesaikan misi mingguan, dan ubah fotomu jadi scrapbook.</p>
      <div className="hero-cta">
        <button className="primary" onClick={onAdd}>☕ Catat kunjungan</button>
        <button className="outline" onClick={onMap}>📍 Buka peta</button>
      </div>
      <div className="hud" aria-live="polite">
        <div>Level {s.level}<b>{titleFor(s.level).split(' ').slice(0, 2).join(' ')}</b><span className="bar"><i style={{ width: `${Math.round(progress(s) * 100)}%` }} /></span></div>
        <div>XP<b>{s.xp}</b></div>
        <div>Streak 🔥<b>{s.streak} mgg</b></div>
        <div>Misi<b>{done}/{ms.length}</b></div>
      </div>
    </section>
  );
}

export default function App() {
  const [visits, setVisits] = useState([]);
  const [tab, setTab] = useState('journal');
  const [form, setForm] = useState(null);      // { id?, draft? }
  const [detailId, setDetailId] = useState(null);
  const [scrapId, setScrapId] = useState(null);
  const [focus, setFocus] = useState(null);
  const [toast, setToast] = useState('');
  const timer = useRef();

  const notify = useCallback(msg => {
    setToast(msg); clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 3600);
  }, []);
  useEffect(() => { loadVisits().then(setVisits); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  const commit = useCallback(async next => {
    try { await saveVisits(next); setVisits(next); return true; }
    catch { notify('Penyimpanan penuh! Kurangi foto.'); return false; }
  }, [notify]);

  async function saveVisit(data) {
    const before = computeStats(visits), had = earned(before);
    const next = form.id
      ? visits.map(v => v.id === form.id ? { ...v, ...data } : v)
      : [...visits, { id: crypto.randomUUID(), created: Date.now(), seed: Math.floor(Math.random() * 1e9), paper: 'night', ...data }];
    if (!await commit(next)) return;
    const after = computeStats(next), newB = BADGES.filter(b => earned(after).has(b.id) && !had.has(b.id));
    let msg = `+${after.xp - before.xp} XP`;
    if (after.level > before.level) msg += ` · Naik ke level ${after.level}!`;
    if (newB.length) msg += ` · Lencana baru: ${newB.map(b => b.name).join(', ')}`;
    const mDone = missions(next).filter(m => m.done).length - missions(visits).filter(m => m.done).length;
    if (mDone > 0) msg += ` · ${mDone} misi selesai!`;
    confetti(after.level > before.level || newB.length || mDone > 0 ? 160 : 50);
    setForm(null); notify(msg);
  }
  async function removeVisit(id) {
    if (!confirm('Hapus kunjungan ini?')) return;
    if (await commit(visits.filter(v => v.id !== id))) { setDetailId(null); notify('Kunjungan dihapus'); }
  }
  const updateVisit = (id, patch) => commit(visits.map(v => v.id === id ? { ...v, ...patch } : v));

  const detail = visits.find(v => v.id === detailId);
  const editing = form?.id && visits.find(v => v.id === form.id);

  return (
    <>
      <header className="top">
        <a className="brand" href="#" onClick={e => { e.preventDefault(); setTab('journal'); }}>Jejak Kopi</a>
        <nav className="tabs" aria-label="Navigasi">
          {TABS.map(([k, label]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}
        </nav>
        <button className="primary" onClick={() => setForm({})}>+ Kunjungan</button>
      </header>

      {tab === 'journal' && <Hero visits={visits} onAdd={() => setForm({})} onMap={() => setTab('map')} />}

      <main>
        {tab === 'journal' && <Journal visits={visits} onOpen={setDetailId} />}
        {tab === 'map' && <MapView visits={visits} focus={focus} onAdd={draft => setForm({ draft })} onOpen={setDetailId} />}
        {tab === 'scrap' && <Scrapbook visits={visits} selectedId={scrapId} onSelect={setScrapId} onUpdate={updateVisit} />}
        {tab === 'quest' && <Quest visits={visits} notify={notify} onImport={async d => { if (await commit(d)) notify('Impor berhasil'); }} />}
      </main>

      <footer className="foot"><span>Jejak Kopi</span><span>Data tersimpan di browser ini · Peta © OpenStreetMap, CARTO</span></footer>

      <Modal open={!!form} onClose={() => setForm(null)}>
        {form && <VisitForm key={form.id || 'new'} initial={editing || null} draft={form.draft} notify={notify} onSave={saveVisit} onCancel={() => setForm(null)} />}
      </Modal>

      <Modal open={!!detail} onClose={() => setDetailId(null)}>
        {detail && <VisitDetail v={detail}
          onClose={() => setDetailId(null)}
          onDelete={() => removeVisit(detail.id)}
          onEdit={() => { setDetailId(null); setForm({ id: detail.id }); }}
          onScrap={() => { setScrapId(detail.id); setDetailId(null); setTab('scrap'); }}
          onShowOnMap={() => { setFocus({ lat: detail.lat, lng: detail.lng }); setDetailId(null); setTab('map'); }} />}
      </Modal>

      <div id="toast" className={toast ? 'show' : ''} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
