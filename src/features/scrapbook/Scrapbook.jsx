import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scan, PenTool, Download, Save, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { Button, Tag } from '@/shared/ui';
import { StickerScannerModal } from '@/features/stickers/StickerScannerModal';
import { WASHI_TAPES, DECORATIVE_STAMPS, generateDefaultCollage } from './accessories';
import { exportScrapbookToPng } from './exportPng';
import { confetti } from '@/shared/lib/confetti';
import { fmtDate } from '@/shared/lib/date';
import { COPY } from '@/shared/copy/id';

export function Scrapbook({ visits = [], selectedId, onSelect, onUpdate, notify }) {
  const sorted = [...visits].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const currentVisit = visits.find((x) => x.id === selectedId) || sorted[0];

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showScanner, setShowScanner] = useState(false);
  const bookRef = useRef(null);

  // Load layout from visit or initialize draft in memory WITHOUT calling onUpdate (fixes auto-complete bug!)
  useEffect(() => {
    if (!currentVisit) {
      setItems([]);
      return;
    }

    if (Array.isArray(currentVisit.scrapbookLayout) && currentVisit.scrapbookLayout.length > 0) {
      setItems(currentVisit.scrapbookLayout);
    } else {
      // In-memory initial draft only - NOT saved to DB until user edits/saves
      const initialDraft = generateDefaultCollage(currentVisit);
      setItems(initialDraft);
    }
    setSelectedItem(null);
  }, [currentVisit?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const commitLayout = useCallback(
    (nextItems) => {
      setItems(nextItems);
      if (currentVisit) {
        onUpdate(currentVisit.id, {
          scrapbookLayout: nextItems,
          scrapbookSaved: true,
        });
      }
    },
    [currentVisit, onUpdate]
  );

  // Dragging handlers
  const handlePointerDown = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item.id);
    setDraggingId(item.id);

    if (!bookRef.current) return;
    const bookRect = bookRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    setDragOffset({
      x: clientX - bookRect.left - item.x,
      y: clientY - bookRect.top - item.y,
    });
  };

  const handlePointerMove = (e) => {
    if (!draggingId || !bookRef.current) return;
    const bookRect = bookRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const newX = Math.max(10, Math.min(bookRect.width - 100, clientX - bookRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(bookRect.height - 100, clientY - bookRect.top - dragOffset.y));

    setItems((prev) =>
      prev.map((it) => (it.id === draggingId ? { ...it, x: newX, y: newY } : it))
    );
  };

  const handlePointerUp = () => {
    if (draggingId) {
      setDraggingId(null);
      commitLayout(items);
    }
  };

  // Add handwriting story note
  const addStoryNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      type: 'text-note',
      x: 60 + Math.random() * 80,
      y: 200 + Math.random() * 80,
      width: 280,
      rotate: Math.random() * 6 - 3,
      font: 'Caveat',
      text: 'Cerita momen ngopi hari ini: aroma seduhan yang khas, suasana meja, dan kesan pertama...',
      bg: 'rgba(255, 237, 215, 0.95)',
      color: '#2b1b11',
    };
    commitLayout([...items, newNote]);
    setSelectedItem(newNote.id);
    confetti(30);
    notify?.('✍️ Catatan cerita ditambahkan ke buku kenangan!');
  };

  // Add Stamp
  const addStamp = (text) => {
    const newStamp = {
      id: `stamp-${Date.now()}`,
      type: 'stamp',
      x: 100 + Math.random() * 80,
      y: 180 + Math.random() * 80,
      width: 170,
      rotate: Math.random() * 12 - 6,
      text,
      color: '#dc5000',
    };
    commitLayout([...items, newStamp]);
    setSelectedItem(newStamp.id);
    notify?.('★ Cap stempel ditempel ke lembaran!');
  };

  // Add Washi Tape
  const addTape = (tape) => {
    const newTape = {
      id: `tape-${Date.now()}`,
      type: 'washi',
      x: 120 + Math.random() * 60,
      y: 150 + Math.random() * 60,
      width: 130,
      rotate: Math.random() * 16 - 8,
      color: tape.color,
    };
    commitLayout([...items, newTape]);
    setSelectedItem(newTape.id);
  };

  // Save Scanned Sticker
  const handleSaveScannedSticker = (stickerObj) => {
    const newSticker = {
      id: `sticker-scan-${Date.now()}`,
      type: 'scanned-sticker',
      src: stickerObj.src,
      x: 120 + Math.random() * 60,
      y: 160 + Math.random() * 60,
      width: 220,
      rotate: Math.random() * 8 - 4,
    };

    const currentStickers = currentVisit.stickers || [];
    const nextStickers = [...currentStickers, stickerObj];
    const nextFlavors = Array.from(
      new Set([...(currentVisit.flavors || []), ...(stickerObj.flavors || [])])
    );

    const nextItems = [...items, newSticker];
    setItems(nextItems);
    onUpdate(currentVisit.id, {
      stickers: nextStickers,
      scrapbookLayout: nextItems,
      flavors: nextFlavors,
      scrapbookSaved: true,
    });

    setShowScanner(false);
    confetti(70);
    notify?.('🎉 Stiker vinyl berhasil dibuat dari scan & ditempel!');
  };

  const handleExportPng = async () => {
    if (!currentVisit) return;
    notify?.('Menyiapkan ekspor buku resolusi tinggi...');
    await exportScrapbookToPng(currentVisit, items, bookRef.current?.clientWidth || 860);
    notify?.('✅ Berkas gambar scrapbook berhasil diunduh!');
  };

  const handleManualSave = () => {
    commitLayout(items);
    confetti(40);
    notify?.(COPY.scrapbook.savedToast);
  };

  if (!currentVisit) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#140c06] border border-cork-border rounded-card text-center gap-3">
        <span className="text-4xl">📖</span>
        <h2 className="text-sm font-sans font-medium uppercase tracking-wider text-warm-cream">
          Belum Ada Kunjungan Untuk Scrapbook
        </h2>
        <p className="text-xs text-driftwood">
          Catat setidaknya 1 kafe terlebih dahulu untuk merangkai buku kenangan kopi.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full text-warm-cream">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-cork-border/40">
        <div>
          <span className="text-[11px] font-mono text-driftwood uppercase tracking-wider">
            {COPY.brand} // {COPY.scrapbook.title}
          </span>
          <h1 className="text-2xl sm:text-3xl font-sans font-medium uppercase tracking-tight text-warm-cream mt-0.5">
            Buku Kenangan Kopi
          </h1>
          <p className="text-xs text-driftwood mt-1 max-w-xl">
            {COPY.scrapbook.subtitle} Geser dan atur stiker dan foto secara bebas.
          </p>
        </div>

        {/* Visit selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-driftwood uppercase">Kunjungan:</label>
          <select
            value={currentVisit.id}
            onChange={(e) => onSelect(e.target.value)}
            className="bg-[#180f08] border border-cork-border text-warm-cream text-xs px-3 py-1.5 rounded-none font-mono focus:outline-none focus:border-warm-cream"
          >
            {sorted.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({fmtDate(item.date)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-[#140c06] border border-cork-border rounded-card">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ember" size="sm" onClick={() => setShowScanner(true)} className="inline-flex items-center gap-1.5">
            <Scan className="w-3.5 h-3.5" />
            Scan Stiker
          </Button>

          <Button variant="ghost" size="sm" onClick={addStoryNote} className="inline-flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5" />
            Catatan Kenangan
          </Button>

          {/* Stamps */}
          <div className="flex items-center gap-1">
            {DECORATIVE_STAMPS.slice(0, 3).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => addStamp(st.text)}
                className="px-2 py-1 text-[11px] font-mono bg-bark-brown/40 border border-cork-border hover:border-driftwood rounded text-warm-cream"
              >
                {st.text}
              </button>
            ))}
          </div>

          {/* Washi tapes */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-cork-border/50">
            {WASHI_TAPES.map((tape) => (
              <button
                key={tape.id}
                type="button"
                title={`Tempel ${tape.name}`}
                onClick={() => addTape(tape)}
                className="w-5 h-5 rounded-full border border-walnut-shadow transition-transform hover:scale-110"
                style={{ backgroundColor: tape.color }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExportPng} className="inline-flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-driftwood" />
            Ekspor PNG
          </Button>

          <Button variant="primary" size="sm" onClick={handleManualSave} className="inline-flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5 text-warm-cream" />
            Simpan Lembaran
          </Button>
        </div>
      </div>

      {/* Canvas Paper Canvas */}
      <div className="w-full overflow-x-auto pb-4">
        <div
          ref={bookRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative mx-auto w-[860px] h-[1050px] bg-[#160e08] border border-cork-border rounded-card shadow-2xl overflow-hidden select-none touch-none"
        >
          {/* Left Spine Ribbon */}
          <div className="absolute left-0 top-0 bottom-0 w-9 bg-bark-brown/40 border-r border-cork-border pointer-events-none" />

          {/* Paper Dot Grid */}
          <div
            className="absolute inset-0 left-9 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#ffedd7 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Page Title Bar */}
          <div className="absolute top-7 left-14 right-8 pb-3 border-b border-cork-border/40 pointer-events-none">
            <div className="flex items-baseline justify-between">
              <h2 className="font-sans text-xl font-medium uppercase tracking-wider text-warm-cream">
                {currentVisit.name}
              </h2>
              <span className="font-mono text-xs text-driftwood">
                {fmtDate(currentVisit.date)} · {currentVisit.area || 'Indonesia'}
              </span>
            </div>
          </div>

          {/* Draggable items */}
          {items.map((it) => {
            const isSelected = selectedItem === it.id;

            return (
              <div
                key={it.id}
                onPointerDown={(e) => handlePointerDown(e, it)}
                style={{
                  left: it.x,
                  top: it.y,
                  width: it.width,
                  transform: `rotate(${it.rotate || 0}deg)`,
                }}
                className={`absolute cursor-move transition-shadow ${
                  isSelected ? 'ring-2 ring-ember-accent/80 z-40' : 'z-20 hover:z-30'
                }`}
              >
                {/* Polaroid Photo */}
                {it.type === 'polaroid' && (
                  <div className="p-2.5 pb-7 bg-white text-gray-900 rounded-sm shadow-xl flex flex-col gap-2">
                    {/* Washi tape topper */}
                    {it.tapeColor && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 opacity-85 shadow-sm transform -rotate-2"
                        style={{ backgroundColor: it.tapeColor }}
                      />
                    )}
                    <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                      <img
                        src={it.src}
                        alt="Polaroid"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                    <span className="font-handwriting text-lg text-gray-800 text-center line-clamp-1 px-1">
                      {it.caption || currentVisit.name}
                    </span>
                  </div>
                )}

                {/* Scanned Vinyl Sticker */}
                {it.type === 'scanned-sticker' && (
                  <div className="filter drop-shadow-xl">
                    <img
                      src={it.src}
                      alt="Vinyl Sticker"
                      className="w-full h-auto object-contain pointer-events-none"
                    />
                  </div>
                )}

                {/* Handwritten Memory Note */}
                {it.type === 'text-note' && (
                  <div
                    className="p-4 rounded shadow-lg flex flex-col gap-2"
                    style={{ backgroundColor: it.bg || '#ffedd7', color: it.color || '#2b1b11' }}
                  >
                    <textarea
                      value={it.text}
                      onChange={(e) => {
                        const nextText = e.target.value;
                        setItems((prev) =>
                          prev.map((x) => (x.id === it.id ? { ...x, text: nextText } : x))
                        );
                      }}
                      className="w-full bg-transparent border-none resize-none focus:outline-none font-handwriting text-xl leading-snug"
                      rows={4}
                    />
                  </div>
                )}

                {/* Cupping Tasting Badge */}
                {it.type === 'cupping-badge' && (
                  <div className="p-3.5 bg-[#1f130b] border-2 border-amber-800/80 rounded shadow-xl flex flex-col gap-1.5 text-warm-cream">
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-amber-200">
                      ☕ {it.title}
                    </span>
                    <span className="font-mono text-xs text-ember-accent font-medium">
                      {it.bean}
                    </span>
                    <span className="font-mono text-[11px] text-driftwood">
                      Metode: {it.brew}
                    </span>
                    {it.flavors?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {it.flavors.map((fl) => (
                          <span
                            key={fl}
                            className="text-[9px] uppercase font-mono px-1.5 py-0.2 bg-bark-brown text-warm-cream rounded border border-cork-border/60"
                          >
                            {fl}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Stamp */}
                {it.type === 'stamp' && (
                  <div
                    className="px-3 py-1.5 border-2 rounded text-xs font-bold font-mono tracking-widest text-center shadow-sm select-none"
                    style={{ borderColor: it.color, color: it.color }}
                  >
                    {it.text}
                  </div>
                )}

                {/* Washi Tape */}
                {it.type === 'washi' && (
                  <div
                    className="h-6 rounded-xs opacity-85 shadow"
                    style={{ backgroundColor: it.color }}
                  />
                )}

                {/* Item controls when selected */}
                {isSelected && (
                  <div className="absolute -bottom-9 left-0 right-0 flex items-center justify-center gap-1.5 z-50">
                    <button
                      type="button"
                      title="Putar Kiri"
                      onClick={() =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === it.id ? { ...x, rotate: (x.rotate || 0) - 5 } : x
                          )
                        )
                      }
                      className="p-1.5 bg-walnut-shadow text-warm-cream rounded border border-cork-border hover:border-driftwood transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Putar Kanan"
                      onClick={() =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === it.id ? { ...x, rotate: (x.rotate || 0) + 5 } : x
                          )
                        )
                      }
                      className="p-1.5 bg-walnut-shadow text-warm-cream rounded border border-cork-border hover:border-driftwood transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Hapus Elemen"
                      onClick={() => {
                        const filtered = items.filter((x) => x.id !== it.id);
                        setItems(filtered);
                        setSelectedItem(null);
                        commitLayout(filtered);
                      }}
                      className="p-1.5 bg-red-950 text-red-200 rounded border border-red-800 hover:bg-red-900 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showScanner && (
        <StickerScannerModal
          cafe={currentVisit}
          onClose={() => setShowScanner(false)}
          onSaveSticker={handleSaveScannedSticker}
        />
      )}
    </div>
  );
}

export default Scrapbook;
