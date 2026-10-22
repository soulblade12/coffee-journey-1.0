import React, { useState } from 'react';
import { Modal, Button, Chip } from '@/shared/ui';
import { createDieCutSticker, scanCoffeeCardOCR } from './stickerScanner';
import { compressImage } from '@/shared/lib/image';

export function StickerScannerModal({ cafe, onSaveSticker, onClose }) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [stickerPreview, setStickerPreview] = useState(null);
  const [ocrData, setOcrData] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setStatusText('Mengompresi foto kartu...');
      const compressed = await compressImage(file, 800, 0.85);
      setPhoto(compressed);

      setStatusText('Membuat stiker vinyl die-cut...');
      const stickerImg = await createDieCutSticker(compressed);
      setStickerPreview(stickerImg);

      setStatusText('Menganalisis teks kartu rasa (OCR)...');
      const ocr = await scanCoffeeCardOCR(compressed, (pct) => setProgress(pct));
      setOcrData(ocr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const handleApply = () => {
    if (!stickerPreview) return;
    const stickerItem = {
      id: `stk-${Date.now()}`,
      src: stickerPreview,
      bean: ocrData?.bean || '',
      flavors: ocrData?.detectedFlavors || [],
      process: ocrData?.detectedProcess || '',
      created: Date.now(),
    };
    onSaveSticker(stickerItem);
  };

  return (
    <Modal open onClose={onClose} maxWidth="max-w-lg">
      <div className="flex flex-col gap-4 text-warm-cream">
        <div>
          <h2 className="text-sm font-sans font-medium uppercase tracking-wider text-warm-cream">
            🏷️ Scan Kartu Rasa & Bikin Stiker
          </h2>
          <p className="text-xs text-driftwood mt-1">
            Foto kartu informasi seduhan atau notes barista. Sistem akan mengubahnya jadi stiker koleksi vinyl dan mendeteksi profil rasanya!
          </p>
        </div>

        {!photo && !loading && (
          <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-cork-border hover:border-driftwood rounded cursor-pointer bg-[#180f08] transition-colors">
            <span className="text-3xl">📷</span>
            <span className="text-xs font-medium uppercase tracking-wider text-warm-cream">
              Ambil Foto Kartu / Unggah Berkas
            </span>
            <span className="text-[11px] text-driftwood">Format JPG, PNG atau foto kamera</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}

        {loading && (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-warm-cream/20 border-t-warm-cream rounded-full animate-spin" />
            <span className="text-xs font-mono text-warm-cream">{statusText}</span>
            {progress > 0 && (
              <div className="w-48 h-1.5 bg-walnut-shadow rounded-full overflow-hidden border border-cork-border">
                <div
                  className="h-full bg-ember-accent transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {stickerPreview && !loading && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center p-6 bg-[#180f08] border border-cork-border rounded">
              <span className="text-[11px] font-mono text-driftwood uppercase mb-2">
                Hasil Stiker Die-Cut
              </span>
              <img
                src={stickerPreview}
                alt="Sticker Preview"
                className="max-h-48 object-contain filter drop-shadow-md transform -rotate-2"
              />
            </div>

            {ocrData?.detectedFlavors?.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase text-warm-cream/80">
                  Rasa yang terdeteksi dari kartu:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ocrData.detectedFlavors.map((f) => (
                    <Chip key={f} label={f} active />
                  ))}
                </div>
              </div>
            )}

            {ocrData?.bean && (
              <div className="text-xs font-mono bg-bark-brown/30 p-2 border border-cork-border rounded">
                <span className="text-driftwood">Origin Terdeteksi: </span>
                <span className="text-warm-cream font-medium">{ocrData.bean}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-cork-border">
              <Button variant="ghost" size="md" onClick={onClose} className="flex-1">
                Batal
              </Button>
              <Button variant="primary" size="md" onClick={handleApply} className="flex-1">
                + Tambahkan ke Jurnal & Stiker
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default StickerScannerModal;
