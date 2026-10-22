import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input } from '@/shared/ui';
import { PlaceAutocomplete } from '@/features/places/PlaceAutocomplete';
import { compressImage } from '@/shared/lib/image';
import { todayStr } from '@/shared/lib/date';
import { COPY } from '@/shared/copy/id';

export function QuickCheckinModal({
  open,
  draft,
  onClose,
  onSaveQuick,
  onOpenFullForm,
}) {
  const [name, setName] = useState(draft?.name || '');
  const [area, setArea] = useState(draft?.area || '');
  const [rating, setRating] = useState(draft?.rating || 4);
  const [isWishlist, setIsWishlist] = useState(Boolean(draft?.isWishlist));
  const [photo, setPhoto] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nameInputRef = useRef(null);

  // Sync draft when opened
  useEffect(() => {
    if (draft) {
      setName(draft.name || '');
      setArea(draft.area || '');
      setRating(draft.rating || 4);
      setIsWishlist(Boolean(draft.isWishlist));
      setPhoto(draft.photos?.[0] || '');
      setError('');
    }
  }, [draft]);

  // Auto focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        nameInputRef.current?.focus?.();
      }, 100);
    }
  }, [open]);

  if (!open) return null;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1080, 0.8);
      setPhoto(compressed);
    } catch {
      // ignore
    }
  };

  const handleQuickSave = async (e) => {
    e?.preventDefault?.();
    if (!name.trim()) {
      setError('Nama kafe atau kedai wajib diisi.');
      nameInputRef.current?.focus?.();
      return;
    }
    setError('');
    setSaving(true);

    try {
      const visitData = {
        name: name.trim(),
        area: area.trim(),
        date: draft?.date || todayStr(),
        rating: isWishlist ? 0 : rating,
        isWishlist,
        type: draft?.type || 'cafe',
        lat: draft?.lat,
        lng: draft?.lng,
        photos: photo ? [photo] : [],
        place: draft?.place || null,
        sensory: {
          acidity: 3,
          body: 3,
          sweetness: 3,
          aftertaste: 3,
          process: 'washed',
          roast: 'medium',
          category: 'black',
        },
      };
      await onSaveQuick(visitData);
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchToFull = () => {
    const prefill = {
      ...draft,
      name,
      area,
      rating,
      isWishlist,
      photos: photo ? [photo] : [],
    };
    onOpenFullForm(prefill);
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleQuickSave} className="flex flex-col gap-4 text-warm-cream">
        <div>
          <h2 className="text-sm font-sans font-medium uppercase tracking-wider text-warm-cream">
            {COPY.checkin.quickTitle}
          </h2>
          <p className="text-xs text-driftwood mt-1">
            Catat momen ngopimu secara kilat. Kamu selalu bisa melengkapi detailnya nanti.
          </p>
        </div>

        {/* Location Badge if Pinned from Map */}
        {typeof draft?.lat === 'number' && typeof draft?.lng === 'number' && (
          <div className="flex items-center justify-between p-2.5 bg-[#180f08] border border-cork-border/70 rounded text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400">📍</span>
              <span className="text-warm-cream font-medium">
                {area || 'Titik Koordinat Peta'}
              </span>
            </div>
            <span className="text-[10px] text-driftwood">
              {draft.lat.toFixed(4)}, {draft.lng.toFixed(4)}
            </span>
          </div>
        )}

        {/* Toggle Wishlist vs Visited */}
        <div className="flex items-center gap-2 p-1 bg-[#180f08] border border-cork-border rounded-ghost">
          <button
            type="button"
            onClick={() => setIsWishlist(false)}
            className={`flex-1 py-1.5 text-xs font-medium uppercase tracking-wide rounded-ghost transition-colors ${
              !isWishlist
                ? 'bg-bark-brown text-warm-cream border border-cork-border/80 shadow-sm'
                : 'text-driftwood hover:text-warm-cream'
            }`}
          >
            ☕ Sudah Dikunjungi
          </button>
          <button
            type="button"
            onClick={() => setIsWishlist(true)}
            className={`flex-1 py-1.5 text-xs font-medium uppercase tracking-wide rounded-ghost transition-colors ${
              isWishlist
                ? 'bg-amber-950/60 text-amber-200 border border-amber-600/50 shadow-sm'
                : 'text-driftwood hover:text-warm-cream'
            }`}
          >
            ⭐ Mau Dicoba (Wishlist)
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-warm-cream/80 font-medium block mb-1">
              {COPY.checkin.cafeName} *
            </label>
            <PlaceAutocomplete
              ref={nameInputRef}
              value={name}
              onChange={(val) => {
                setName(val);
                if (val.trim()) setError('');
              }}
              onSelect={(p) => {
                setName(p.name);
                if (p.area) setArea(p.area);
                setError('');
              }}
              nearLat={draft?.lat}
              nearLng={draft?.lng}
              placeholder={COPY.checkin.cafeNamePlaceholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <span className="text-xs text-red-400 font-mono mt-1 block">
                {error}
              </span>
            )}
          </div>

          <Input
            label={COPY.checkin.cityArea}
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={COPY.checkin.cityAreaPlaceholder}
          />

          {!isWishlist && (
            <div className="flex items-center justify-between p-3 bg-[#180f08] border border-cork-border rounded">
              <span className="text-xs uppercase tracking-wider text-warm-cream font-medium">
                {COPY.checkin.quickRating}
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-xl p-0.5 transition-colors ${
                      star <= rating ? 'text-ember-accent' : 'text-cork-border'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Photo Upload */}
          <div>
            <label className="text-xs uppercase tracking-wider text-warm-cream/80 font-medium block mb-1.5">
              {COPY.checkin.quickPhoto}
            </label>
            {photo ? (
              <div className="relative w-24 h-24 rounded border border-cork-border overflow-hidden">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  className="absolute top-1 right-1 bg-walnut-shadow/80 text-warm-cream rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-cork-border hover:border-driftwood cursor-pointer bg-[#180f08]/50 text-xs text-driftwood hover:text-warm-cream transition-colors rounded">
                <span>📷 Ambil Foto Cangkir</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-cork-border">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Menyimpan...' : '⚡ ' + COPY.checkin.saveQuick}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleSwitchToFull}
            className="w-full text-driftwood hover:text-warm-cream"
          >
            📝 {COPY.checkin.saveAndCompleteLater}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default QuickCheckinModal;
