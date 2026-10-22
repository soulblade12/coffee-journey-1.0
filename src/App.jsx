import { useCallback, useEffect, useRef, useState } from 'react';
import Journal from './components/Journal';
import MapView from './components/MapView';
import Scrapbook from './components/Scrapbook';
import Quest from './components/Quest';
import Modal from './components/Modal';
import VisitForm from './components/VisitForm';
import VisitDetail from './components/VisitDetail';
import { loadVisits, saveVisits } from './lib/storage';
import { BADGES, computeStats, earned, missions } from './lib/game';
import { confetti } from './lib/confetti';

const TABS = [
  ['map', '01 // PETA LAPANGAN', '🗺️'],
  ['journal', '02 // LOGBOOK KAFE', '📖'],
  ['scrap', '03 // SCRAPBOOK FOTO', '🖼️'],
  ['quest', '04 // MISI & TELEMETRI', '🎯'],
];

export default function App() {
  const [visits, setVisits] = useState([]);
  const [tab, setTab] = useState('map'); // PIN-FIRST: default to map survey terminal!
  const [form, setForm] = useState(null);      // { id?, draft? }
  const [detailId, setDetailId] = useState(null);
  const [scrapId, setScrapId] = useState(null);
  const [focus, setFocus] = useState(null);
  const [toast, setToast] = useState('');
  const timer = useRef();

  const notify = useCallback(msg => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 3800);
  }, []);

  useEffect(() => {
    loadVisits().then(setVisits);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  const commit = useCallback(async next => {
    try {
      await saveVisits(next);
      setVisits(next);
      return true;
    } catch {
      notify('KAPASITAS PENYIMPANAN PENUH. KURANGI RESOLUSI ATAU JUMLAH FOTO.');
      return false;
    }
  }, [notify]);

  async function saveVisit(data) {
    const before = computeStats(visits), had = earned(before);
    const next = form.id
      ? visits.map(v => v.id === form.id ? { ...v, ...data } : v)
      : [...visits, { id: crypto.randomUUID(), created: Date.now(), seed: Math.floor(Math.random() * 1e9), paper: 'night', ...data }];

    if (!await commit(next)) return;
    const after = computeStats(next), newB = BADGES.filter(b => earned(after).has(b.id) && !had.has(b.id));
    let msg = `+${after.xp - before.xp} XP RECORDED`;
    if (after.level > before.level) msg += ` // ELEVATED TO LEVEL ${after.level}`;
    if (newB.length) msg += ` // LENCANA: ${newB.map(b => b.name).join(', ')}`;
    const mDone = missions(next).filter(m => m.done).length - missions(visits).filter(m => m.done).length;
    if (mDone > 0) msg += ` // ${mDone} MISI TERPENUHI`;

    confetti(after.level > before.level || newB.length || mDone > 0 ? 120 : 40);
    setForm(null);
    notify(msg);
  }

  async function removeVisit(id) {
    if (!confirm('HAPUS DATA LOG INI DARI TERMINAL?')) return;
    if (await commit(visits.filter(v => v.id !== id))) {
      setDetailId(null);
      notify('DATA LOG TELAH DIHAPUS.');
    }
  }

  const updateVisit = (id, patch) => commit(visits.map(v => v.id === id ? { ...v, ...patch } : v));

  const detail = visits.find(v => v.id === detailId);
  const editing = form?.id && visits.find(v => v.id === form.id);
  const stats = computeStats(visits);

  return (
    <div className="inversa-terminal-app">
      {/* Oryzo Vertical Sidebar Brand Label */}
      <div className="oryzo-sidebar-label" aria-hidden="true">
        ORYZO 1-MODEL // JEJAK KOPI 2.0
      </div>

      {/* Top Command Navigation Bar */}
      <header className="terminal-nav">
        <div className="nav-brand-group">
          <a href="#" className="nav-wordmark" onClick={e => { e.preventDefault(); setTab('map'); }}>
            JEJAK KOPI <span className="brand-dot"></span>
          </a>
          <span className="nav-status-tag">DARKROOM EDITORIAL</span>
        </div>

        <nav className="nav-tabs" aria-label="Navigasi instrumen">
          {TABS.map(([k, label, icon]) => (
            <button
              key={k}
              type="button"
              className={`nav-tab-btn ${tab === k ? 'active' : ''}`}
              onClick={() => setTab(k)}
            >
              <span className="tab-icon">{icon}</span> {label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="nav-telemetry-pill">
            <span className="dot-live"></span>
            <span>LVL {stats.level} // {stats.xp} XP</span>
          </div>
          <button
            type="button"
            className="btn-lime-nav"
            onClick={() => setForm({})}
          >
            + TANDAI PIN KAFE
          </button>
        </div>
      </header>

      {/* Main Command Workspace */}
      <main className="terminal-main-viewport">
        {tab === 'map' && (
          <MapView
            visits={visits}
            focus={focus}
            onAdd={draft => setForm({ draft })}
            onOpen={setDetailId}
          />
        )}
        {tab === 'journal' && (
          <Journal
            visits={visits}
            onOpen={setDetailId}
            onGoMap={() => setTab('map')}
          />
        )}
        {tab === 'scrap' && (
          <Scrapbook
            visits={visits}
            selectedId={scrapId}
            onSelect={setScrapId}
            onUpdate={updateVisit}
            notify={notify}
          />
        )}
        {tab === 'quest' && (
          <Quest
            visits={visits}
            notify={notify}
            onImport={async d => { if (await commit(d)) notify('IMPORT SELESAI'); }}
          />
        )}
      </main>

      {/* Mobile & Tablet Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Navigasi ponsel">
        {TABS.map(([k, label, icon]) => (
          <button
            key={k}
            type="button"
            className={`mobile-nav-btn ${tab === k ? 'active' : ''}`}
            onClick={() => setTab(k)}
          >
            <span className="mobile-nav-icon">{icon}</span>
            <span className="mobile-nav-label">{label.replace(/^\d+\s*\/\/\s*/, '')}</span>
          </button>
        ))}
      </nav>

      {/* Footer Instrument Status Bar */}
      <footer className="terminal-footer">
        <div className="footer-col">
          <span className="mono">ORYZO DARKROOM EDITORIAL // JEJAK KOPI 2.0</span>
          <span className="mono-sub">WARM DARKNESS PRODUCT & COFFEE EXPEDITION LOG</span>
        </div>
        <div className="footer-col right">
          <span className="mono">STORAGE: INDEXEDDB LOCAL // SATELLITE: ESRI WORLD IMAGERY</span>
          <span className="mono-sub">&copy; OPENSTREETMAP CONTRIBUTORS</span>
        </div>
      </footer>

      {/* Modal Dialogs */}
      <Modal open={!!form} onClose={() => setForm(null)}>
        {form && (
          <VisitForm
            key={form.id || 'new'}
            initial={editing || null}
            draft={form.draft}
            notify={notify}
            onSave={saveVisit}
            onCancel={() => setForm(null)}
          />
        )}
      </Modal>

      <Modal open={!!detail} onClose={() => setDetailId(null)}>
        {detail && (
          <VisitDetail
            v={detail}
            onClose={() => setDetailId(null)}
            onDelete={() => removeVisit(detail.id)}
            onEdit={() => { setDetailId(null); setForm({ id: detail.id }); }}
            onScrap={() => { setScrapId(detail.id); setDetailId(null); setTab('scrap'); }}
            onShowOnMap={() => {
              setFocus({ lat: detail.lat, lng: detail.lng });
              setDetailId(null);
              setTab('map');
            }}
          />
        )}
      </Modal>

      {/* Terminal Notification Banner */}
      <div id="toast" className={`terminal-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
        <span className="toast-bullet">▪</span> {toast}
      </div>
    </div>
  );
}
