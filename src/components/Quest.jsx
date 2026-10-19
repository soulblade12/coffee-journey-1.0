import { BADGES, computeStats, earned, missions, progress, titleFor, xpFor } from '../lib/game';
import { download, todayStr } from '../lib/util';

export default function Quest({ visits, onImport, notify }) {
  const s = computeStats(visits), got = earned(s), next = xpFor(s.level + 1);

  async function pickFile(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (!Array.isArray(d) || d.some(v => !v.id || !v.name || !Array.isArray(v.photos))) throw 0;
      if (!confirm(`GANTI DATA SAAT INI DENGAN ${d.length} ENTRI CADANGAN DARI BERKAS?`)) return;
      onImport(d);
    } catch {
      notify('BERKAS JSON TIDAK VALID ATAU RUSAK.');
    }
  }

  return (
    <section className="terminal-quest-section" aria-label="Misi dan Telemetri">
      <div className="terminal-header">
        <div className="telemetry-bar">
          <span className="data-tag">TELEMETRY & LOG METRICS // 04</span>
          <span className="mono-label">STATUS OPERASIONAL RECON</span>
          <span className="data-tag lime-invert">OPERATOR STATUS: ACTIVE</span>
        </div>
        <h1 className="hero-display-title">
          MISI &<br />TELEMETRI.
        </h1>
        <p className="hero-description">
          Tingkat reputasi penjelajah kafe, akumulasi experience points (XP), progres target misi mingguan, dan koleksi lencana survei lapangan.
        </p>
      </div>

      {/* Operator Rank & XP Console */}
      <div className="inversa-rank-console">
        <div className="console-top-row">
          <span className="data-tag lime-invert">LEVEL {String(s.level).padStart(2, '0')} // REPUTASI</span>
          <span className="coord-mono">{s.xp} TOTAL XP ACCUMULATED</span>
        </div>
        <h2 className="console-rank-title">{titleFor(s.level).toUpperCase()}</h2>

        <div className="tactical-progress-wrap">
          <div className="tactical-progress-bar">
            <i style={{ width: `${Math.round(progress(s) * 100)}%` }} />
          </div>
          <div className="progress-labels mono">
            <span>{s.xp} XP</span>
            <span>{next - s.xp} XP MENUJU LEVEL {s.level + 1}</span>
          </div>
        </div>

        <div className="console-stats-grid">
          <div className="stat-unit">
            <span className="unit-label mono">TEMPAT DIEKSPLORASI</span>
            <span className="unit-num">{s.places}</span>
          </div>
          <div className="stat-unit">
            <span className="unit-label mono">TOTAL KUNJUNGAN</span>
            <span className="unit-num">{s.total}</span>
          </div>
          <div className="stat-unit">
            <span className="unit-label mono">PIN SATELIT TERKUNCI</span>
            <span className="unit-num lime">{s.pins}</span>
          </div>
          <div className="stat-unit">
            <span className="unit-label mono">FOTO DOKUMENTASI</span>
            <span className="unit-num">{s.photos}</span>
          </div>
          <div className="stat-unit">
            <span className="unit-label mono">WEEKLY STREAK</span>
            <span className="unit-num">{s.streak} MGG</span>
          </div>
        </div>

        <div className="xp-rule-footer mono">
          // ATURAN XP: TEMPAT BARU +25 | REVISIT +10 | TIPE BARU +15 | FOTO +5 | MENU +5 | JURNAL LENGKAP +10 | PIN PETA +5 | CUPPING TASTING +5
        </div>
      </div>

      {/* Weekly Mission Objectives */}
      <div className="terminal-section-heading">
        <span className="data-tag">ACTIVE OBJECTIVES</span>
        <h3 className="section-title-sub">TARGET MISI MINGGU INI</h3>
      </div>

      <div className="inversa-missions-grid">
        {missions(visits).map(m => (
          <div key={m.t} className={`inversa-mission-card ${m.done ? 'objective-complete' : ''}`}>
            <div className="mission-card-top">
              <span className="mission-status-tag mono">
                {m.done ? '[ COMPLETE // ✓ ]' : '[ IN PROGRESS ]'}
              </span>
              <span className="mission-score mono">{m.n} / {m.goal}</span>
            </div>
            <h4 className="mission-title">{m.t}</h4>
            <div className="mission-bar-track">
              <div
                className="mission-bar-fill"
                style={{ width: `${(m.n / m.goal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Badges Collection */}
      <div className="terminal-section-heading">
        <span className="data-tag">FIELD COMMENDATIONS</span>
        <h3 className="section-title-sub">LENCANA SURVEI ({got.size}/{BADGES.length})</h3>
      </div>

      <div className="inversa-badges-grid">
        {BADGES.map(b => (
          <div key={b.id} className={`inversa-badge-card ${got.has(b.id) ? 'unlocked' : 'locked'}`}>
            <div className="badge-glyph">{b.ic}</div>
            <div className="badge-content">
              <span className="badge-status-mono">
                {got.has(b.id) ? 'ACQUIRED // TERVERIFIKASI' : 'LOCKED // BELUM TERCAPAI'}
              </span>
              <h4 className="badge-name">{b.name}</h4>
              <p className="badge-desc mono">{b.d}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Data Backup & Restore */}
      <div className="terminal-section-heading">
        <span className="data-tag">DATA MANAGEMENT</span>
        <h3 className="section-title-sub">CADANGAN & RECOVERY DATABASE</h3>
      </div>

      <div className="data-backup-row">
        <button
          type="button"
          className="btn-lime"
          onClick={() => download(URL.createObjectURL(new Blob([JSON.stringify(visits)], { type: 'application/json' })), `jejak-kopi-backup-${todayStr()}.json`)}
        >
          ⬇ EKSPOR CADANGAN JSON
        </button>
        <label className="btn-ghost">
          📂 IMPOR CADANGAN JSON
          <input type="file" accept="application/json" hidden onChange={pickFile} />
        </label>
        <span className="backup-note mono">
          // SEMUA FOTO DAN DATA TERSIMPAN DALAM FORMAT STANDAR JSON PORTABLE
        </span>
      </div>
    </section>
  );
}
