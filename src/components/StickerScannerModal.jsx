import { useState } from 'react';
import { createDieCutSticker, createCuppingCardSticker, scanCoffeeCard } from '../lib/stickerScanner';
import { FLAVORS, BREWS } from '../lib/util';

export default function StickerScannerModal({ cafe, onSaveSticker, onClose }) {
  const [file, setFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [style, setStyle] = useState('die-cut'); // 'die-cut' | 'cupping-card' | 'polaroid'
  const [scanning, setScanning] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [detectedData, setDetectedData] = useState({
    flavors: cafe?.flavors || [],
    brew: cafe?.brew || 'V60',
    bean: cafe?.bean || '',
    rawText: '',
  });
  const [generatedSticker, setGeneratedSticker] = useState(null);

  async function handleFileSelect(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewSrc(url);
    setGeneratedSticker(null);

    // Auto-generate instant preview sticker
    try {
      const stickerUrl = await createDieCutSticker(url);
      setGeneratedSticker(stickerUrl);
    } catch {
      // fallback
    }
  }

  async function runScan() {
    if (!previewSrc) return;
    setScanning(true);
    setProgressMsg('Memulai analisis citra & OCR...');

    const res = await scanCoffeeCard(previewSrc, ({ status, progress }) => {
      setProgressMsg(`${status} (${Math.round(progress * 100)}%)`);
    });

    setScanning(false);
    if (res.success) {
      setDetectedData(prev => ({
        ...prev,
        flavors: Array.from(new Set([...prev.flavors, ...res.flavors])),
        brew: res.brew || prev.brew,
        bean: res.bean || prev.bean,
        rawText: res.rawText,
      }));

      // Jika kartu cupping, regenerate stiker kartu
      if (style === 'cupping-card') {
        const cardUrl = createCuppingCardSticker({
          cafeName: cafe?.name || 'SPECIALTY COFFEE',
          bean: res.bean || cafe?.bean,
          brew: res.brew || cafe?.brew,
          area: cafe?.area,
          date: cafe?.date,
          flavors: Array.from(new Set([...(cafe?.flavors || []), ...res.flavors])),
        });
        setGeneratedSticker(cardUrl);
      }
    } else {
      setProgressMsg('Deteksi otomatis selesai (pilih profil rasa manual di bawah jika diperlukan).');
    }
  }

  async function switchStyle(newStyle) {
    setStyle(newStyle);
    if (!previewSrc) return;
    if (newStyle === 'cupping-card') {
      const card = createCuppingCardSticker({
        cafeName: cafe?.name || 'SPECIALTY COFFEE',
        bean: detectedData.bean || cafe?.bean,
        brew: detectedData.brew || cafe?.brew,
        area: cafe?.area,
        date: cafe?.date,
        flavors: detectedData.flavors,
      });
      setGeneratedSticker(card);
    } else {
      const dieCut = await createDieCutSticker(previewSrc);
      setGeneratedSticker(dieCut);
    }
  }

  function toggleFlavor(f) {
    const next = detectedData.flavors.includes(f)
      ? detectedData.flavors.filter(x => x !== f)
      : [...detectedData.flavors, f];
    setDetectedData(prev => ({ ...prev, flavors: next }));
    if (style === 'cupping-card') {
      const card = createCuppingCardSticker({
        cafeName: cafe?.name || 'SPECIALTY COFFEE',
        bean: detectedData.bean || cafe?.bean,
        brew: detectedData.brew || cafe?.brew,
        area: cafe?.area,
        date: cafe?.date,
        flavors: next,
      });
      setGeneratedSticker(card);
    }
  }

  function handleSave() {
    if (!generatedSticker) return;
    onSaveSticker({
      id: 'sticker-' + Date.now(),
      src: generatedSticker,
      type: style,
      label: style === 'cupping-card' ? `${cafe?.name || 'Kopi'} Cupping Card` : `${cafe?.name || 'Kopi'} Sticker`,
      flavors: detectedData.flavors,
      bean: detectedData.bean,
      brew: detectedData.brew,
      created: Date.now(),
    });
  }

  return (
    <div className="sticker-scanner-modal">
      <div className="scanner-header">
        <div className="telemetry-bar">
          <span className="data-tag">IMAGE SCANNER // AI STICKER ENGINE</span>
          <span className="data-tag lime-invert">{cafe?.name || 'KAFE LOG'}</span>
        </div>
        <h2 className="scanner-title">SCAN FOTO & BUAT STIKER KOLEKSI</h2>
        <p className="scanner-subtitle">
          Ambil foto kartu notes rasa (*cupping card*) atau cangkir kopimu. Aplikasi akan memindai teks, memotong stiker die-cut, dan menambahkannya ke lembaran buku scrapbook interaktifmu!
        </p>
      </div>

      {/* Upload & Camera Trigger */}
      <div className="scanner-body">
        {!previewSrc ? (
          <label className="scanner-dropzone">
            <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} />
            <div className="dropzone-inner">
              <span className="dropzone-icon">📷</span>
              <span className="dropzone-primary-text">AMBIL FOTO KARTU RASA / CANGKIR KOPI</span>
              <span className="dropzone-subtext mono">KLIK UNTUK MENGAMBIL FOTO DARI KAMERA ATAU GALERI</span>
            </div>
          </label>
        ) : (
          <div className="scanner-preview-container">
            <div className="scanner-image-split">
              {/* Original Preview */}
              <div className="preview-pane">
                <span className="mono-sub">01 // FOTO ASLI DARI KAFE</span>
                <div className="image-box">
                  <img src={previewSrc} alt="Foto asli" />
                  {scanning && (
                    <div className="scanner-laser-overlay">
                      <div className="laser-line"></div>
                      <span className="laser-text mono">{progressMsg}</span>
                    </div>
                  )}
                </div>
                <div className="preview-actions-row">
                  <button
                    type="button"
                    className="btn-ghost-sm"
                    onClick={runScan}
                    disabled={scanning}
                  >
                    {scanning ? 'SEDANG MEMINDAI...' : '⚡ SCAN TEKS & PROFIL RASA'}
                  </button>
                  <label className="btn-ghost-sm">
                    GANTI FOTO
                    <input type="file" accept="image/*" hidden onChange={handleFileSelect} />
                  </label>
                </div>
              </div>

              {/* Generated Sticker Preview */}
              <div className="preview-pane">
                <span className="mono-sub">02 // HASIL STIKER DIE-CUT KOLEKSI</span>
                <div className="sticker-result-box">
                  {generatedSticker ? (
                    <img src={generatedSticker} alt="Hasil Stiker" className="sticker-preview-img" />
                  ) : (
                    <div className="processing-placeholder mono">MEMPROSES STIKER...</div>
                  )}
                </div>

                {/* Style Selector */}
                <div className="style-selector-row">
                  <button
                    type="button"
                    className={`btn-ghost-sm ${style === 'die-cut' ? 'active-style' : ''}`}
                    onClick={() => switchStyle('die-cut')}
                  >
                    🏷️ DIE-CUT STICKER
                  </button>
                  <button
                    type="button"
                    className={`btn-ghost-sm ${style === 'cupping-card' ? 'active-style' : ''}`}
                    onClick={() => switchStyle('cupping-card')}
                  >
                    📜 KARTU NOTES RASA
                  </button>
                </div>
              </div>
            </div>

            {/* Flavor confirmation if card detected */}
            <div className="flavor-confirmation-box">
              <span className="mono-sub">PROFIL RASA YANG TERDETEKSI (KLIK UNTUK TAMBAH/KURANG):</span>
              <div className="tactical-chips-grid">
                {FLAVORS.map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`tactical-chip ${detectedData.flavors.includes(f) ? 'selected' : ''}`}
                    onClick={() => toggleFlavor(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="scanner-footer">
        <button type="button" className="btn-ghost" onClick={onClose}>
          BATAL
        </button>
        <button
          type="button"
          className="btn-lime"
          onClick={handleSave}
          disabled={!generatedSticker}
        >
          ✓ SIMPAN & TARUH DI BUKU SCRAPBOOK (+30 XP)
        </button>
      </div>
    </div>
  );
}
