import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, BookOpen, MapPin, ExternalLink, Bookmark, Coffee, Sparkles } from 'lucide-react';
import { Button, Stars, Tag, Chip } from '@/shared/ui';
import { CuppingRadar } from './CuppingRadar';
import { MapPicker } from '@/features/map/MapPicker';
import { fetchLivePlaceDetails } from '@/features/places';
import { fmtDate } from '@/shared/lib/date';

export function VisitDetail({
  v,
  allVisits = [],
  onEdit,
  onDelete,
  onScrap,
  onShowOnMap,
  onClose,
}) {
  const [liveGoogle, setLiveGoogle] = useState(null);

  useEffect(() => {
    if (v.place?.placeId) {
      fetchLivePlaceDetails(v.place.placeId).then(setLiveGoogle);
    }
  }, [v.place?.placeId]);

  // Find all visits to this same cafe (grouping repeat visits!)
  const samePlaceVisits = allVisits.filter(
    (other) =>
      other.id !== v.id &&
      (other.name || '').trim().toLowerCase() === (v.name || '').trim().toLowerCase()
  );

  const pinned = typeof v.lat === 'number' && typeof v.lng === 'number';

  return (
    <div className="flex flex-col gap-5 text-warm-cream">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-3 border-b border-cork-border/50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {v.isWishlist ? (
              <Tag variant="wishlist" className="inline-flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-amber-400" /> Wishlist (Mau Dicoba)
              </Tag>
            ) : (
              <Tag variant="default" className="inline-flex items-center gap-1">
                <Coffee className="w-3 h-3 text-amber-300" /> Sudah Dikunjungi
              </Tag>
            )}
            <Tag variant="ember">{v.type === 'slowbar' ? 'Slowbar' : v.type === 'roastery' ? 'Roastery' : 'Kedai Kopi'}</Tag>
          </div>
          <span className="text-xs font-mono text-driftwood">
            {fmtDate(v.date)}
          </span>
        </div>

        <h2 className="text-xl font-sans font-medium uppercase tracking-wider text-warm-cream">
          {v.name}
        </h2>

        {v.area && (
          <span className="text-xs text-driftwood font-mono flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-ember-accent" /> {v.area}
          </span>
        )}
      </div>

      {/* Rating Strip (if not wishlist) */}
      {!v.isWishlist && (
        <div className="flex items-center justify-between p-4 bg-[#180f08] border border-cork-border rounded-card flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Stars value={v.rating} size="md" />
            <span className="text-lg font-mono font-bold text-warm-cream">
              {Number(v.rating).toFixed(1)} <span className="text-xs text-driftwood">/ 5.0</span>
            </span>
          </div>

          {v.ratings && (
            <div className="flex items-center gap-4 text-xs font-mono text-driftwood">
              <span>Kopi: <b className="text-warm-cream">{v.ratings.coffee || '-'}/5</b></span>
              <span>Tempat: <b className="text-warm-cream">{v.ratings.place || '-'}/5</b></span>
              <span>Layanan: <b className="text-warm-cream">{v.ratings.service || '-'}/5</b></span>
            </div>
          )}
        </div>
      )}

      {/* Repeat visits history alert */}
      {samePlaceVisits.length > 0 && (
        <div className="p-3 bg-[#180f08]/80 border border-cork-border/70 rounded text-xs">
          <span className="text-driftwood font-mono">
            🔄 Kamu sudah mengunjungi kafe ini sebanyak <b>{samePlaceVisits.length + 1} kali</b>. Kunjungan sebelumnya:{' '}
            {samePlaceVisits.map((item) => fmtDate(item.date)).join(', ')}.
          </span>
        </div>
      )}

      {/* Live Google Places Info (Ephemeral details) */}
      {liveGoogle && (
        <div className="p-3 bg-[#180f08] border border-amber-900/40 rounded flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between text-driftwood font-mono text-[10px]">
            <span>INFO GOOGLE PLACES</span>
            <span>{liveGoogle.isOpenNow ? '🟢 Buka Sekarang' : '🔴 Tutup'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-bold">★ {liveGoogle.rating}</span>
            <span className="text-driftwood">({liveGoogle.userRatingCount} ulasan)</span>
          </div>
          {liveGoogle.address && (
            <span className="text-driftwood text-[11px]">{liveGoogle.address}</span>
          )}
        </div>
      )}

      {/* Cupping & Sensory Indicator */}
      {v.sensory && <CuppingRadar sensory={v.sensory} />}

      {/* Menu & Beans */}
      {(v.menu || v.bean || v.brew) && (
        <div className="flex flex-col gap-1 p-3 bg-[#180f08] border border-cork-border rounded">
          <span className="text-[10px] font-mono text-driftwood uppercase">Menu & Seduhan</span>
          {v.menu && <span className="text-sm font-medium text-warm-cream">🍽️ {v.menu}</span>}
          {(v.brew || v.bean) && (
            <span className="text-xs text-driftwood font-mono">
              {[v.brew, v.bean].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
      )}

      {/* Tasting notes chips */}
      {Array.isArray(v.flavors) && v.flavors.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-driftwood uppercase">Profil Rasa</span>
          <div className="flex flex-wrap gap-1.5">
            {v.flavors.map((fl) => (
              <Chip key={fl} label={fl} active />
            ))}
          </div>
        </div>
      )}

      {/* Photos gallery */}
      {Array.isArray(v.photos) && v.photos.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-driftwood uppercase">
            Dokumentasi Foto ({v.photos.length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {v.photos.map((src, idx) => (
              <div key={idx} className="aspect-square rounded border border-cork-border overflow-hidden">
                <img src={src} alt={`${v.name} ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanned stickers */}
      {Array.isArray(v.stickers) && v.stickers.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-driftwood uppercase">
            Stiker Koleksi Dari Scan ({v.stickers.length})
          </span>
          <div className="flex flex-wrap gap-3">
            {v.stickers.map((stk, idx) => (
              <div key={idx} className="w-20 h-20 p-1 bg-[#180f08] border border-cork-border rounded flex items-center justify-center">
                <img src={stk.src} alt="Sticker" className="max-h-full max-w-full object-contain filter drop-shadow" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note / Journal */}
      {v.note && (
        <div className="flex flex-col gap-1 p-3 bg-[#180f08] border border-cork-border rounded">
          <span className="text-[10px] font-mono text-driftwood uppercase">Catatan Cerita</span>
          <p className="text-xs leading-relaxed text-warm-cream/90 whitespace-pre-line font-serif italic">
            "{v.note}"
          </p>
        </div>
      )}

      {/* Mini Satellite Map */}
      {pinned && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-driftwood">
            <span>LOKASI PETA SATELIT</span>
            <button
              type="button"
              onClick={onShowOnMap}
              className="text-amber-300 hover:underline"
            >
              Buka di Peta Utama ↗
            </button>
          </div>
          <MapPicker pos={{ lat: v.lat, lng: v.lng }} readOnly height={140} />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-cork-border flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm" onClick={onDelete} className="inline-flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} className="inline-flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" />
            Ubah
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onScrap}
          className="border-amber-600/40 text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 inline-flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-300" />
          Rangkai di Buku Kenangan
        </Button>
      </div>
    </div>
  );
}

export default VisitDetail;
