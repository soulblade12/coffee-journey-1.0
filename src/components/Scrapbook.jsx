import { useEffect, useRef, useState, useCallback } from 'react';
import StickerScannerModal from './StickerScannerModal';
import { PAPERS } from '../lib/scrap';
import { download, fmtDate } from '../lib/util';
import { confetti } from '../lib/confetti';

const WASHI_TAPES = [
  { id: 'washi-kraft', name: 'Washi Kraft', color: '#c9a77c', pattern: 'dots' },
  { id: 'washi-amber', name: 'Washi Amber', color: '#dc5000', pattern: 'stripes' },
  { id: 'washi-matcha', name: 'Washi Matcha', color: '#556b2f', pattern: 'solid' },
  { id: 'washi-dark', name: 'Washi Espresso', color: '#382416', pattern: 'lines' },
];

const DECORATIVE_STAMPS = [
  { id: 'stamp-coffee', text: '☕ FRESH BREW' },
  { id: 'stamp-beans', text: '🫘 SINGLE ORIGIN' },
  { id: 'stamp-slowbar', text: '🫖 SLOWBAR ARCHIVE' },
  { id: 'stamp-star', text: '★ APPROVED TASTE' },
  { id: 'stamp-polaroid', text: '📷 EXPEDITION MEMORY' },
];

export default function Scrapbook({ visits, selectedId, onSelect, onUpdate, notify }) {
  const sorted = [...visits].sort((a, b) => b.date.localeCompare(a.date));
  const v = visits.find(x => x.id === selectedId) || sorted[0];

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showScanner, setShowScanner] = useState(false);
  const [activeFont, setActiveFont] = useState('Caveat');
  const bookRef = useRef(null);

  // Load layout from visit data or initialize with smart default collage
  useEffect(() => {
    if (!v) return;
    if (v.scrapbookLayout && Array.isArray(v.scrapbookLayout) && v.scrapbookLayout.length > 0) {
      setItems(v.scrapbookLayout);
    } else {
      // Create initial beautiful collage
      const initial = [];

      // 1. Photos from visit as polaroids
      (v.photos || []).slice(0, 4).forEach((photo, idx) => {
        const posX = 40 + (idx % 2) * 260 + (Math.random() * 20 - 10);
        const posY = 130 + Math.floor(idx / 2) * 290 + (Math.random() * 20 - 10);
        const rot = (idx % 2 === 0 ? -4 : 5) + (Math.random() * 4 - 2);
        initial.push({
          id: `photo-${idx}-${Date.now()}`,
          type: 'polaroid',
          src: photo,
          x: posX,
          y: posY,
          width: 230,
          rotate: rot,
          caption: `${v.name} · ${fmtDate(v.date)}`,
          tapeColor: WASHI_TAPES[idx % WASHI_TAPES.length].color,
        });
      });

      // 2. Initial Cupping Tasting Note Card
      initial.push({
        id: `card-cupping-${Date.now()}`,
        type: 'cupping-badge',
        x: 320,
        y: 460,
        width: 280,
        rotate: -2,
        title: v.name.toUpperCase(),
        bean: v.bean || 'Single Origin Blend',
        brew: v.brew || 'Filter Coffee',
        flavors: v.flavors?.length ? v.flavors : ['Caramel', 'Floral', 'Citrus'],
        rating: v.rating,
      });

      // 3. Initial handwritten memory story note
      initial.push({
        id: `note-story-${Date.now()}`,
        type: 'text-note',
        x: 50,
        y: 680,
        width: 320,
        rotate: 1.5,
        font: 'Caveat',
        text: v.note || 'Duduk santai di sudut kafe, menikmati aroma seduhan segar sambil mencatat rasa...',
        bg: 'rgba(255, 237, 215, 0.12)',
        color: '#ffedd7',
      });

      setItems(initial);
      onUpdate(v.id, { scrapbookLayout: initial });
    }
    setSelectedItem(null);
  }, [v?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper to persist changes
  const saveLayout = useCallback((nextItems) => {
    setItems(nextItems);
    if (v) {
      onUpdate(v.id, { scrapbookLayout: nextItems });
    }
  }, [v, onUpdate]);

  // Pointer down (mouse or touch) to initiate drag
  function handlePointerDown(e, item) {
    e.stopPropagation();
    setSelectedItem(item.id);
    setDraggingId(item.id);

    const bookRect = bookRef.current.getBoundingClientRect();
    const itemX = item.x;
    const itemY = item.y;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    setDragOffset({
      x: (clientX - bookRect.left) - itemX,
      y: (clientY - bookRect.top) - itemY,
    });
  }

  // Pointer move to update dragged position
  function handlePointerMove(e) {
    if (!draggingId || !bookRef.current) return;
    const bookRect = bookRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const newX = Math.max(0, Math.min(bookRect.width - 60, (clientX - bookRect.left) - dragOffset.x));
    const newY = Math.max(0, Math.min(bookRect.height - 60, (clientY - bookRect.top) - dragOffset.y));

    setItems(prev => prev.map(it => it.id === draggingId ? { ...it, x: newX, y: newY } : it));
  }

  // Pointer up to finish drag
  function handlePointerUp() {
    if (draggingId) {
      setDraggingId(null);
      saveLayout(items);
    }
  }

  // Rotate item
  function rotateItem(id, delta) {
    const updated = items.map(it => it.id === id ? { ...it, rotate: (it.rotate || 0) + delta } : it);
    saveLayout(updated);
  }

  // Resize item
  function resizeItem(id, delta) {
    const updated = items.map(it => it.id === id ? { ...it, width: Math.max(120, Math.min(500, (it.width || 220) + delta)) } : it);
    saveLayout(updated);
  }

  // Delete item
  function removeItem(id) {
    const updated = items.filter(it => it.id !== id);
    setSelectedItem(null);
    saveLayout(updated);
    notify?.('ITEM DIHAPUS DARI LEMBARAN SCRAPBOOK');
  }

  // Bring to front
  function bringToFront(id) {
    const target = items.find(it => it.id === id);
    if (!target) return;
    const updated = [...items.filter(it => it.id !== id), target];
    saveLayout(updated);
  }

  // Add custom writing note
  function addTextNote() {
    const newNote = {
      id: `note-${Date.now()}`,
      type: 'text-note',
      x: 120 + Math.random() * 80,
      y: 200 + Math.random() * 100,
      width: 280,
      rotate: (Math.random() * 8 - 4),
      font: activeFont,
      text: 'Tulis cerita pengalaman ngopi, obrolan seru, atau catatan aroma hari ini di sini...',
      bg: 'rgba(255, 237, 215, 0.15)',
      color: '#ffedd7',
    };
    saveLayout([...items, newNote]);
    setSelectedItem(newNote.id);
    confetti(30);
    notify?.('+ CATATAN CERITA DITAMBAHKAN');
  }

  // Add Decorative Stamp
  function addStamp(stampText) {
    const newStamp = {
      id: `stamp-${Date.now()}`,
      type: 'stamp',
      x: 140 + Math.random() * 100,
      y: 180 + Math.random() * 100,
      width: 180,
      rotate: (Math.random() * 14 - 7),
      text: stampText,
      color: '#dc5000',
    };
    saveLayout([...items, newStamp]);
    setSelectedItem(newStamp.id);
    notify?.('+ STAMP DITEMPEL PADA BUKU');
  }

  // Add Washi Tape
  function addWashiTape(tape) {
    const newTape = {
      id: `tape-${Date.now()}`,
      type: 'washi',
      x: 160 + Math.random() * 80,
      y: 160 + Math.random() * 80,
      width: 140,
      rotate: (Math.random() * 20 - 10),
      color: tape.color,
      name: tape.name,
    };
    saveLayout([...items, newTape]);
    setSelectedItem(newTape.id);
    notify?.('+ SELOTIP WASHI TAPE DITEMPEL');
  }

  // Save Scanned Sticker from Scanner Modal
  function handleSaveScannedSticker(stickerObj) {
    const newStickerItem = {
      id: `sticker-scan-${Date.now()}`,
      type: 'scanned-sticker',
      src: stickerObj.src,
      x: 150 + Math.random() * 60,
      y: 180 + Math.random() * 60,
      width: 240,
      rotate: (Math.random() * 10 - 5),
      label: stickerObj.label,
    };

    // Also update visit stickers collection
    const currentStickers = v.stickers || [];
    const updatedVisit = {
      stickers: [...currentStickers, stickerObj],
      scrapbookLayout: [...items, newStickerItem],
      flavors: Array.from(new Set([...(v.flavors || []), ...(stickerObj.flavors || [])])),
    };

    saveLayout([...items, newStickerItem]);
    onUpdate(v.id, updatedVisit);
    setShowScanner(false);
    confetti(90);
    notify?.('🎉 STIKER BERHASIL DIBUAT DARI SCAN & DITEMPEL KE BUKU! (+30 XP)');
  }

  // Randomize Layout
  function randomizeLayout() {
    const updated = items.map(it => ({
      ...it,
      x: Math.max(30, Math.min(480, it.x + (Math.random() * 80 - 40))),
      y: Math.max(100, Math.min(750, it.y + (Math.random() * 80 - 40))),
      rotate: (Math.random() * 16 - 8),
    }));
    saveLayout(updated);
    confetti(40);
    notify?.('🎲 TATA LETAK SCRAPBOOK DIACAK SECARA DINAMIS');
  }

  // High-Resolution PNG Export of the Book Canvas
  async function exportBookPNG() {
    notify?.('MENYIAPKAN EKSPOR BUKU RESOLUSI TINGGI...');
    const W = 1000, H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 1. Draw Paper Texture
    const paper = PAPERS[v.paper] || PAPERS.night;
    ctx.fillStyle = paper.bg;
    ctx.fillRect(0, 0, W, H);

    // Book spine / ribbon
    ctx.fillStyle = 'rgba(56, 36, 22, 0.4)';
    ctx.fillRect(0, 0, 40, H);
    ctx.strokeStyle = '#40372e';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 0, 1, H);

    // Grid dots if applicable
    ctx.fillStyle = 'rgba(255, 237, 215, 0.08)';
    for (let x = 60; x < W; x += 30) {
      for (let y = 30; y < H; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Header on paper
    ctx.fillStyle = '#ffedd7';
    ctx.font = '600 24px Inter, sans-serif';
    ctx.fillText(`${v.name.toUpperCase()} // COFFEE EXPEDITION`, 60, 60);
    ctx.font = '500 13px monospace';
    ctx.fillStyle = '#a89c8e';
    ctx.fillText(`${fmtDate(v.date)} · ${v.area || 'FIELD JOURNAL'} · ★ ${v.rating.toFixed(1)}/5.0`, 60, 85);

    // 2. Render each item onto canvas
    for (const it of items) {
      ctx.save();
      const cx = it.x + (it.width || 200) / 2;
      const cy = it.y + 100;
      ctx.translate(cx, cy);
      ctx.rotate(((it.rotate || 0) * Math.PI) / 180);

      const w = it.width || 200;

      if (it.type === 'polaroid' || it.type === 'scanned-sticker') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = it.src;
        await new Promise(r => { img.onload = r; img.onerror = r; });

        if (it.type === 'polaroid') {
          const h = w * 1.15;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = 10;
          ctx.fillRect(-w / 2, -h / 2, w, h);

          const photoH = w * 0.82;
          ctx.drawImage(img, -w / 2 + 10, -h / 2 + 10, w - 20, photoH);

          ctx.fillStyle = '#222222';
          ctx.font = '600 13px Caveat, cursive';
          ctx.fillText(it.caption || v.name, -w / 2 + 14, h / 2 - 12);
        } else {
          // Scanned Sticker
          ctx.shadowColor = 'rgba(0,0,0,0.45)';
          ctx.shadowBlur = 12;
          ctx.drawImage(img, -w / 2, -w / 2, w, (img.height * w) / img.width);
        }
      } else if (it.type === 'text-note') {
        const h = 130;
        ctx.fillStyle = 'rgba(255, 237, 215, 0.95)';
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 8;
        ctx.fillRect(-w / 2, -h / 2, w, h);

        ctx.fillStyle = '#2b1b11';
        ctx.font = it.font === 'Caveat' ? '600 18px Caveat, cursive' : '500 13px monospace';
        const words = it.text.split(' ');
        let line = '', lineY = -h / 2 + 28;
        for (const word of words) {
          const test = line + word + ' ';
          if (ctx.measureText(test).width > w - 24) {
            ctx.fillText(line, -w / 2 + 12, lineY);
            line = word + ' ';
            lineY += 22;
          } else {
            line = test;
          }
        }
        ctx.fillText(line, -w / 2 + 12, lineY);
      } else if (it.type === 'cupping-badge') {
        const h = 140;
        ctx.fillStyle = '#2b1c11';
        ctx.strokeStyle = '#a67c4e';
        ctx.lineWidth = 2;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);

        ctx.fillStyle = '#ffedd7';
        ctx.font = '700 14px Inter, sans-serif';
        ctx.fillText(it.title, -w / 2 + 12, -h / 2 + 24);
        ctx.fillStyle = '#dc5000';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.fillText(it.bean, -w / 2 + 12, -h / 2 + 46);
        ctx.fillStyle = '#a89c8e';
        ctx.font = '500 11px monospace';
        ctx.fillText(`NOTES: ${(it.flavors || []).join(', ')}`, -w / 2 + 12, -h / 2 + 70);
      } else if (it.type === 'washi') {
        ctx.fillStyle = it.color || '#dc5000';
        ctx.fillRect(-w / 2, -12, w, 24);
      } else if (it.type === 'stamp') {
        ctx.strokeStyle = it.color || '#dc5000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-w / 2, -16, w, 32);
        ctx.fillStyle = it.color || '#dc5000';
        ctx.font = '700 12px monospace';
        ctx.fillText(it.text, -w / 2 + 10, 5);
      }

      ctx.restore();
    }

    canvas.toBlob(blob => {
      download(URL.createObjectURL(blob), `scrapbook-journal-${v.name.replace(/\W+/g, '-')}.png`);
      confetti(80);
      notify?.('🎉 LEMBARAN SCRAPBOOK BERHASIL DIUNDUH DALAM FORMAT PNG RESOLUSI TINGGI!');
    });
  }

  if (!v) {
    return (
      <section className="terminal-scrap-section" aria-label="Scrapbook Buku Kopi">
        <div className="empty-field-box">
          <span className="mono-label">BELUM ADA DATA KAFE TERSIMPAN</span>
          <p>Mulai dengan menandai pin kafe di peta untuk membuat lembaran buku scrapbook interaktif.</p>
        </div>
      </section>
    );
  }

  const paper = PAPERS[v.paper] || PAPERS.night;

  return (
    <section className="terminal-scrap-section" aria-label="Scrapbook Buku Kopi">
      {/* Header */}
      <div className="terminal-header">
        <div className="telemetry-bar">
          <span className="data-tag">INTERACTIVE SCRAPBOOK // JOURNAL BOOK</span>
          <span className="mono-label">DRAG & DROP STIKER, POLAROID & CATATAN CERITA</span>
          <span className="data-tag lime-invert">{items.length} ITEM AKTIF DI BUKU</span>
        </div>
        <h1 className="hero-display-title">
          BUKU JURNAL<br />& STIKER KOLEKSI.
        </h1>
        <p className="hero-description">
          Bebas atur dan susun stiker kenangan, kartu notes rasa hasil scan, foto polaroid, selotip washi, dan tulis cerita ngopimu langsung di atas lembaran buku jurnal ini.
        </p>
      </div>

      {/* Primary Action Controls Bar */}
      <div className="tactical-command-bar">
        <select
          value={v.id}
          onChange={e => onSelect(e.target.value)}
          aria-label="Pilih kunjungan kafe"
          className="select-instrument flex-grow"
        >
          {sorted.map(x => (
            <option key={x.id} value={x.id}>
              {x.name.toUpperCase()} — {fmtDate(x.date)} {x.photos.length ? `(${x.photos.length} FOTO)` : ''}
            </option>
          ))}
        </select>

        <select
          value={v.paper || 'night'}
          onChange={e => onUpdate(v.id, { paper: e.target.value })}
          aria-label="Tekstur kertas buku"
          className="select-instrument"
        >
          {Object.entries(PAPERS).map(([k, p]) => (
            <option key={k} value={k}>{p.label.toUpperCase()}</option>
          ))}
        </select>

        {/* Scan Foto / Buat Stiker CTA */}
        <button
          type="button"
          className="btn-lime"
          onClick={() => setShowScanner(true)}
        >
          📷 SCAN FOTO & BUAT STIKER (+30 XP)
        </button>

        <button
          type="button"
          className="btn-ghost"
          onClick={addTextNote}
        >
          ✍️ + TULIS CERITA DI BUKU
        </button>

        <button
          type="button"
          className="btn-ghost"
          onClick={randomizeLayout}
        >
          🎲 ACAK SUSUNAN
        </button>

        <button
          type="button"
          className="btn-ghost highlight"
          onClick={exportBookPNG}
        >
          ⬇ UNDUH PNG BUKU
        </button>
      </div>

      {/* Sticker Tray & Accessories Bar */}
      <div className="scrapbook-accessories-bar">
        <div className="tray-section">
          <span className="mono-sub">SEKOCI SELOTIP WASHI:</span>
          <div className="washi-palette">
            {WASHI_TAPES.map(t => (
              <button
                key={t.id}
                type="button"
                className="washi-sample-btn"
                style={{ backgroundColor: t.color }}
                onClick={() => addWashiTape(t)}
                title={`Tempel ${t.name}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="tray-section">
          <span className="mono-sub">STEMPEL & EMBLEM:</span>
          <div className="stamps-palette">
            {DECORATIVE_STAMPS.map(s => (
              <button
                key={s.id}
                type="button"
                className="btn-ghost-sm"
                onClick={() => addStamp(s.text)}
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The Interactive Scrapbook Notebook Page */}
      <div
        className="interactive-notebook-wrapper"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          ref={bookRef}
          className="interactive-notebook-page"
          style={{ backgroundColor: paper.bg }}
          onClick={() => setSelectedItem(null)}
        >
          {/* Notebook Paper Elements (Spine & Margin) */}
          <div className="book-spine-line" />
          <div className="book-page-header">
            <span className="book-header-title">{v.name.toUpperCase()} // COFFEE JOURNAL</span>
            <span className="book-header-date mono">{fmtDate(v.date)} · {v.area || 'FIELD RECON'}</span>
          </div>

          {/* Draggable Items */}
          {items.map(it => {
            const isSelected = selectedItem === it.id;
            return (
              <div
                key={it.id}
                className={`book-canvas-item ${it.type} ${isSelected ? 'is-selected' : ''}`}
                style={{
                  transform: `translate3d(${it.x}px, ${it.y}px, 0px) rotate(${it.rotate || 0}deg)`,
                  width: `${it.width || 220}px`,
                  zIndex: isSelected ? 50 : 10,
                }}
                onPointerDown={e => handlePointerDown(e, it)}
                onClick={e => { e.stopPropagation(); setSelectedItem(it.id); }}
              >
                {/* Floating controls for selected item */}
                {isSelected && (
                  <div className="item-action-controls" onPointerDown={e => e.stopPropagation()}>
                    <button type="button" onClick={() => rotateItem(it.id, -10)} title="Putar Kiri">↺</button>
                    <button type="button" onClick={() => rotateItem(it.id, 10)} title="Putar Kanan">↻</button>
                    <button type="button" onClick={() => resizeItem(it.id, -20)} title="Kecilkan">−</button>
                    <button type="button" onClick={() => resizeItem(it.id, 20)} title="Besarkan">+</button>
                    <button type="button" onClick={() => bringToFront(it.id)} title="Paling Depan">⬆</button>
                    <button type="button" className="btn-del-item" onClick={() => removeItem(it.id)} title="Hapus">✕</button>
                  </div>
                )}

                {/* ITEM RENDERING TYPES */}
                {it.type === 'polaroid' && (
                  <div className="polaroid-frame">
                    <div className="polaroid-tape" style={{ backgroundColor: it.tapeColor || '#dc5000' }} />
                    <img src={it.src} alt="Foto Polaroid" className="polaroid-img" draggable={false} />
                    <span className="polaroid-caption">{it.caption}</span>
                  </div>
                )}

                {it.type === 'scanned-sticker' && (
                  <div className="scanned-sticker-wrap">
                    <img src={it.src} alt={it.label} className="scanned-sticker-img" draggable={false} />
                  </div>
                )}

                {it.type === 'cupping-badge' && (
                  <div className="cupping-badge-card">
                    <div className="badge-header">
                      <span className="badge-top-label">SPECIALTY COFFEE // CUPPING</span>
                      <span className="badge-star-seal">★ {it.rating?.toFixed(1) || '5.0'}</span>
                    </div>
                    <h4 className="badge-cafe-name">{it.title}</h4>
                    <p className="badge-bean-origin">{it.bean}</p>
                    <div className="badge-flavors-row">
                      {(it.flavors || []).map(f => (
                        <span key={f} className="badge-chip">{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {it.type === 'text-note' && (
                  <div className="text-note-card">
                    <div className="note-washi-tape" />
                    <textarea
                      value={it.text}
                      rows={4}
                      style={{ fontFamily: it.font === 'Caveat' ? 'Caveat, cursive' : 'monospace' }}
                      onChange={e => {
                        const val = e.target.value;
                        setItems(prev => prev.map(x => x.id === it.id ? { ...x, text: val } : x));
                      }}
                      onBlur={() => saveLayout(items)}
                      placeholder="Ketik catatan ceritamu di sini..."
                    />
                  </div>
                )}

                {it.type === 'washi' && (
                  <div className="washi-tape-strip" style={{ backgroundColor: it.color }} />
                )}

                {it.type === 'stamp' && (
                  <div className="vintage-post-stamp" style={{ borderColor: it.color, color: it.color }}>
                    {it.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <StickerScannerModal
          cafe={v}
          onSaveSticker={handleSaveScannedSticker}
          onClose={() => setShowScanner(false)}
        />
      )}
    </section>
  );
}
