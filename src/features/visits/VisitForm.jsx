import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, Stars, StarInput, Chip } from '@/shared/ui';
import { MapPicker } from '@/features/map/MapPicker';
import { PlaceAutocomplete } from '@/features/places/PlaceAutocomplete';
import { StickerScannerModal } from '@/features/stickers/StickerScannerModal';
import { compressImage } from '@/shared/lib/image';
import { todayStr } from '@/shared/lib/date';
import { reverse } from '@/shared/lib/geo';
import { COPY } from '@/shared/copy/id';

const ALL_PROCESSES = [
  { id: 'washed', label: 'Washed' },
  { id: 'natural', label: 'Natural' },
  { id: 'honey', label: 'Honey' },
  { id: 'anaerobic', label: 'Anaerobic' },
  { id: 'wet_hulled', label: 'Giling Basah' },
];

const ALL_ROASTS = [
  { id: 'light', label: 'Light Roast' },
  { id: 'medium', label: 'Medium Roast' },
  { id: 'dark', label: 'Dark Roast' },
];

const COMMON_FLAVORS = [
  'Floral', 'Citrus', 'Berry', 'Stone Fruit', 'Caramel', 'Chocolate',
  'Nutty', 'Honey', 'Tropical', 'Vanilla', 'Brown Sugar', 'Apple',
  'Black Tea', 'Spices', 'Creamy',
];

export function VisitForm({ initial, draft, onSave, onCancel, notify }) {
  const [f, setF] = useState(() => ({
    name: initial?.name || draft?.name || '',
    type: initial?.type || draft?.type || 'cafe',
    date: initial?.date || draft?.date || todayStr(),
    area: initial?.area || draft?.area || '',
    menu: initial?.menu || draft?.menu || '',
    bean: initial?.bean || draft?.bean || '',
    brew: initial?.brew || draft?.brew || 'V60 Filter',
    note: initial?.note || draft?.note || '',
    isWishlist: initial?.isWishlist ?? draft?.isWishlist ?? false,
    photos: initial?.photos || draft?.photos || [],
    stickers: initial?.stickers || draft?.stickers || [],
    flavors: initial?.flavors || draft?.flavors || [],
    ratings: initial?.ratings || {
      coffee: initial?.rating || draft?.rating || 4,
      place: 4,
      service: 4,
    },
    sensory: initial?.sensory || {
      acidity: 3,
      body: 3,
      sweetness: 3,
      aftertaste: 3,
      process: 'washed',
      roast: 'medium',
      category: 'black',
    },
    lat: initial?.lat ?? draft?.lat,
    lng: initial?.lng ?? draft?.lng,
    place: initial?.place || draft?.place || null,
  }));

  const [customFlavor, setCustomFlavor] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const patch = (p) => setF((prev) => ({ ...prev, ...p }));
  const patchSensory = (p) => setF((prev) => ({ ...prev, sensory: { ...prev.sensory, ...p } }));
  const patchRatings = (key, val) =>
    setF((prev) => ({ ...prev, ratings: { ...prev.ratings, [key]: val } }));

  // Auto-reverse geocode if draft has coords but no area
  useEffect(() => {
    if (typeof f.lat === 'number' && typeof f.lng === 'number' && !f.area) {
      reverse(f.lat, f.lng).then((r) => {
        if (r.area && !f.area) patch({ area: r.area });
      }).catch(() => {});
    }
  }, [f.lat, f.lng]);

  const handlePickLocation = async (pos) => {
    if (!pos) {
      patch({ lat: undefined, lng: undefined });
      return;
    }
    patch({ lat: pos.lat, lng: pos.lng });
    try {
      const res = await reverse(pos.lat, pos.lng);
      if (res.area && !f.area) patch({ area: res.area });
      if (res.name && !f.name) patch({ name: res.name });
    } catch {
      // ignore
    }
  };

  const handleAddPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const file of files) {
      if (f.photos.length >= 6) {
        notify?.('Maksimal 6 foto per kunjungan.');
        break;
      }
      try {
        const compressed = await compressImage(file, 1200, 0.82);
        patch({ photos: [...f.photos, compressed] });
      } catch {
        notify?.('Gagal memproses foto.');
      }
    }
  };

  const toggleFlavor = (flavor) => {
    const list = f.flavors.includes(flavor)
      ? f.flavors.filter((x) => x !== flavor)
      : [...f.flavors, flavor];
    patch({ flavors: list });
  };

  const handleAddCustomFlavor = (e) => {
    if (e.key === 'Enter' && customFlavor.trim()) {
      e.preventDefault();
      const val = customFlavor.trim();
      if (!f.flavors.includes(val)) {
        patch({ flavors: [...f.flavors, val] });
      }
      setCustomFlavor('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) {
      setError('Nama kafe wajib diisi.');
      return;
    }

    setSaving(true);
    const rValues = Object.values(f.ratings).filter(Boolean);
    const overallRating = f.isWishlist
      ? 0
      : rValues.length > 0
      ? rValues.reduce((a, b) => a + b, 0) / rValues.length
      : 4;

    const record = {
      ...f,
      name: f.name.trim(),
      area: f.area.trim(),
      menu: f.menu.trim(),
      bean: f.bean.trim(),
      note: f.note.trim(),
      rating: overallRating,
    };

    await onSave(record);
    setSaving(false);
  };

  const pos = typeof f.lat === 'number' && typeof f.lng === 'number' ? { lat: f.lat, lng: f.lng } : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-warm-cream">
      <div className="flex items-center justify-between pb-3 border-b border-cork-border/50">
        <div>
          <span className="text-[11px] font-mono text-driftwood uppercase tracking-wider">
            {initial ? 'UBAH DATA KUNJUNGAN' : 'CATATAN KUNJUNGAN BARU'}
          </span>
          <h2 className="text-base font-sans font-medium uppercase tracking-wider text-warm-cream">
            {initial ? f.name || 'Edit Kunjungan' : COPY.checkin.fullTitle}
          </h2>
        </div>

        {/* Wishlist switch */}
        <div className="flex items-center gap-1.5 p-1 bg-[#180f08] border border-cork-border rounded-ghost">
          <button
            type="button"
            onClick={() => patch({ isWishlist: false })}
            className={`px-3 py-1 text-xs uppercase tracking-wide rounded-ghost transition-colors ${
              !f.isWishlist ? 'bg-bark-brown text-warm-cream' : 'text-driftwood hover:text-warm-cream'
            }`}
          >
            ☕ Kunjungan
          </button>
          <button
            type="button"
            onClick={() => patch({ isWishlist: true })}
            className={`px-3 py-1 text-xs uppercase tracking-wide rounded-ghost transition-colors ${
              f.isWishlist ? 'bg-amber-950/60 text-amber-200 border border-amber-600/50' : 'text-driftwood hover:text-warm-cream'
            }`}
          >
            ⭐ Wishlist
          </button>
        </div>
      </div>

      {/* 01: MAP PICKER */}
      <div className="flex flex-col gap-2 p-4 bg-[#140c06] border border-cork-border rounded-card">
        <span className="text-xs font-mono text-driftwood uppercase tracking-wider">
          01 // Titik Lokasi Peta Satelit
        </span>
        <MapPicker pos={pos} onPick={handlePickLocation} height={180} />
      </div>

      {/* 02: CAFE IDENTITY */}
      <div className="flex flex-col gap-3 p-4 bg-[#140c06] border border-cork-border rounded-card">
        <span className="text-xs font-mono text-driftwood uppercase tracking-wider">
          02 // Identitas Kafe & Waktu
        </span>

        <div>
          <label className="text-xs uppercase tracking-wider text-warm-cream/80 font-medium block mb-1">
            {COPY.checkin.cafeName} *
          </label>
          <PlaceAutocomplete
            value={f.name}
            onChange={(name) => patch({ name })}
            onSelect={(item) => {
              patch({ name: item.name });
              if (item.area && !f.area) patch({ area: item.area });
            }}
            nearLat={f.lat}
            nearLng={f.lng}
            placeholder={COPY.checkin.cafeNamePlaceholder}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-warm-cream/80 font-medium">
              Kategori Kedai
            </label>
            <select
              value={f.type}
              onChange={(e) => patch({ type: e.target.value })}
              className="w-full bg-[#180f08] border border-cork-border text-warm-cream text-sm px-3 py-2.5 rounded-none focus:outline-none focus:border-warm-cream"
            >
              <option value="cafe">☕ Kedai Kopi / Coffee Shop</option>
              <option value="slowbar">🫖 Slowbar / Manual Brew Bar</option>
              <option value="roastery">🔥 Roastery & Lab</option>
            </select>
          </div>

          <Input
            label="Tanggal Kunjungan"
            type="date"
            value={f.date}
            onChange={(e) => patch({ date: e.target.value })}
            required
          />
        </div>

        <Input
          label={COPY.checkin.cityArea}
          value={f.area}
          onChange={(e) => patch({ area: e.target.value })}
          placeholder={COPY.checkin.cityAreaPlaceholder}
        />
      </div>

      {/* 03: SENSORY & CUPPING */}
      <div className="flex flex-col gap-4 p-4 bg-[#140c06] border border-cork-border rounded-card">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-driftwood uppercase tracking-wider">
            03 // {COPY.sensory.title}
          </span>
          <Button
            type="button"
            variant="ember"
            size="sm"
            onClick={() => setShowScanner(true)}
          >
            🏷️ Scan Kartu Rasa
          </Button>
        </div>

        {/* Category: Black vs Milk */}
        <div className="flex items-center gap-2 p-1 bg-[#180f08] border border-cork-border rounded-ghost w-fit">
          <button
            type="button"
            onClick={() => patchSensory({ category: 'black' })}
            className={`px-3 py-1 text-xs uppercase tracking-wide rounded-ghost transition-colors ${
              f.sensory.category === 'black' ? 'bg-bark-brown text-warm-cream' : 'text-driftwood hover:text-warm-cream'
            }`}
          >
            ☕ {COPY.sensory.drinkTypeBlack}
          </button>
          <button
            type="button"
            onClick={() => patchSensory({ category: 'milk' })}
            className={`px-3 py-1 text-xs uppercase tracking-wide rounded-ghost transition-colors ${
              f.sensory.category === 'milk' ? 'bg-bark-brown text-warm-cream' : 'text-driftwood hover:text-warm-cream'
            }`}
          >
            🥛 {COPY.sensory.drinkTypeMilk}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Menu Yang Dipesan"
            value={f.menu}
            onChange={(e) => patch({ menu: e.target.value })}
            placeholder="Cth: V60 Ethiopia Guji Natural / Flat White"
          />

          <Input
            label={COPY.sensory.beanName}
            value={f.bean}
            onChange={(e) => patch({ bean: e.target.value })}
            placeholder={COPY.sensory.beanNamePlaceholder}
          />
        </div>

        {/* Process & Roast */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-warm-cream/80 font-medium">
              {COPY.sensory.process}
            </label>
            <select
              value={f.sensory.process}
              onChange={(e) => patchSensory({ process: e.target.value })}
              className="w-full bg-[#180f08] border border-cork-border text-warm-cream text-sm px-3 py-2.5 rounded-none focus:outline-none focus:border-warm-cream"
            >
              {ALL_PROCESSES.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-warm-cream/80 font-medium">
              {COPY.sensory.roastLevel}
            </label>
            <select
              value={f.sensory.roast}
              onChange={(e) => patchSensory({ roast: e.target.value })}
              className="w-full bg-[#180f08] border border-cork-border text-warm-cream text-sm px-3 py-2.5 rounded-none focus:outline-none focus:border-warm-cream"
            >
              {ALL_ROASTS.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cupping sliders (1-5) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#180f08] border border-cork-border">
          {[
            { key: 'acidity', label: 'Acidity' },
            { key: 'body', label: 'Body' },
            { key: 'sweetness', label: 'Sweetness' },
            { key: 'aftertaste', label: 'Aftertaste' },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-driftwood">{label}</span>
                <span className="text-amber-300 font-bold">{f.sensory[key]}/5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={f.sensory[key]}
                onChange={(e) => patchSensory({ [key]: Number(e.target.value) })}
                className="accent-ember-accent cursor-pointer w-full"
              />
            </div>
          ))}
        </div>

        {/* Flavor chips */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider text-warm-cream/80 font-medium">
            {COPY.sensory.flavors}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_FLAVORS.map((flavor) => (
              <Chip
                key={flavor}
                label={flavor}
                active={f.flavors.includes(flavor)}
                onClick={() => toggleFlavor(flavor)}
              />
            ))}
          </div>

          <div className="pt-1">
            <input
              type="text"
              value={customFlavor}
              onChange={(e) => setCustomFlavor(e.target.value)}
              onKeyDown={handleAddCustomFlavor}
              placeholder={COPY.sensory.flavorAddPlaceholder}
              className="w-full bg-[#180f08] border border-cork-border text-warm-cream text-xs px-3 py-2 rounded-none placeholder-driftwood/60 focus:outline-none focus:border-warm-cream"
            />
          </div>
        </div>

        <Textarea
          label="Catatan Pengalaman & Suasana"
          rows={3}
          value={f.note}
          onChange={(e) => patch({ note: e.target.value })}
          placeholder="Ceritakan rasa seduhan, obrolan dengan barista, atau suasana kafe..."
        />
      </div>

      {/* 04: RATINGS (if not wishlist) */}
      {!f.isWishlist && (
        <div className="flex flex-col gap-3 p-4 bg-[#140c06] border border-cork-border rounded-card">
          <span className="text-xs font-mono text-driftwood uppercase tracking-wider">
            04 // Penilaian Pengalaman
          </span>
          <div className="flex flex-col gap-1">
            <StarInput
              label="Kualitas Kopi"
              value={f.ratings.coffee}
              onChange={(v) => patchRatings('coffee', v)}
            />
            <StarInput
              label="Suasana Tempat"
              value={f.ratings.place}
              onChange={(v) => patchRatings('place', v)}
            />
            <StarInput
              label="Keramahan & Pelayanan"
              value={f.ratings.service}
              onChange={(v) => patchRatings('service', v)}
            />
          </div>
        </div>
      )}

      {/* 05: PHOTOS */}
      <div className="flex flex-col gap-3 p-4 bg-[#140c06] border border-cork-border rounded-card">
        <span className="text-xs font-mono text-driftwood uppercase tracking-wider">
          05 // Foto Dokumentasi (Maks. 6)
        </span>

        {f.photos.length < 6 && (
          <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-cork-border hover:border-driftwood cursor-pointer bg-[#180f08]/50 text-xs text-driftwood hover:text-warm-cream transition-colors">
            <span>📷 Unggah Foto Cangkir / Suasana</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddPhotos}
              className="hidden"
            />
          </label>
        )}

        {f.photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
            {f.photos.map((src, idx) => (
              <div key={idx} className="relative aspect-square rounded border border-cork-border overflow-hidden">
                <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => patch({ photos: f.photos.filter((_, i) => i !== idx) })}
                  className="absolute top-1 right-1 bg-walnut-shadow/80 text-warm-cream rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div className="text-xs text-red-400 font-mono">{error}</div>}

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" size="md" onClick={onCancel} className="flex-1">
          {COPY.checkin.cancel}
        </Button>
        <Button variant="primary" size="md" type="submit" disabled={saving} className="flex-1">
          {saving ? 'Menyimpan...' : COPY.checkin.saveFull}
        </Button>
      </div>

      {showScanner && (
        <StickerScannerModal
          cafe={f}
          onClose={() => setShowScanner(false)}
          onSaveSticker={(stk) => {
            patch({
              stickers: [...f.stickers, stk],
              flavors: Array.from(new Set([...f.flavors, ...(stk.flavors || [])])),
              bean: stk.bean || f.bean,
            });
            setShowScanner(false);
            notify?.('Stiker berhasil ditambahkan dari scan!');
          }}
        />
      )}
    </form>
  );
}

export default VisitForm;
