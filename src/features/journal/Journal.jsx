import React, { useState, useMemo } from 'react';
import { Search, MapPin, Coffee, Bookmark, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Card, Button, Stars, Tag, Chip } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { fmtDate } from '@/shared/lib/date';
import { COPY } from '@/shared/copy/id';

export function Journal({ visits = [], onOpen, onGoMap }) {
  const [query, setQuery] = useState('');
  const [tabFilter, setTabFilter] = useState('all'); // 'all' | 'visited' | 'wishlist' | 'slowbar'
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'rating' | 'name'

  const filteredVisits = useMemo(() => {
    const q = query.trim().toLowerCase();

    return visits
      .filter((v) => {
        // Tab filters
        if (tabFilter === 'visited' && v.isWishlist) return false;
        if (tabFilter === 'wishlist' && !v.isWishlist) return false;
        if (tabFilter === 'slowbar' && v.type !== 'slowbar') return false;

        // Search text
        if (!q) return true;
        const haystack = [
          v.name,
          v.area,
          v.city,
          v.bean,
          v.menu,
          v.brew,
          v.note,
          ...(v.flavors || []),
        ].join(' ').toLowerCase();

        return haystack.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return (b.date || '').localeCompare(a.date || '') || (b.created || 0) - (a.created || 0);
      });
  }, [visits, query, tabFilter, sortBy]);

  const visitedCount = visits.filter((v) => !v.isWishlist).length;
  const wishlistCount = visits.filter((v) => Boolean(v.isWishlist)).length;

  return (
    <div className="flex flex-col gap-6 w-full text-warm-cream">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-cork-border/40">
        <div>
          <span className="text-[11px] font-mono text-driftwood uppercase tracking-wider">
            {COPY.brand} // {COPY.nav.journal}
          </span>
          <h1 className="text-2xl sm:text-3xl font-sans font-medium uppercase tracking-tight text-warm-cream mt-0.5">
            Logbook Seduhan & Kafe
          </h1>
          <p className="text-xs text-driftwood mt-1 max-w-xl">
            Arsip lengkap catatan ngopimu: profil rasa, metode seduh, dan cerita berkesan di setiap cangkir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onGoMap} className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-ember-accent" />
            Buka di Peta
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#140c06] border border-cork-border rounded-ghost overflow-x-auto">
          {[
            { id: 'all', label: `Semua (${visits.length})`, Icon: null },
            { id: 'visited', label: `Dikunjungi (${visitedCount})`, Icon: Coffee },
            { id: 'wishlist', label: `Wishlist (${wishlistCount})`, Icon: Bookmark },
            { id: 'slowbar', label: 'Slowbar', Icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.Icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabFilter(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider rounded-ghost whitespace-nowrap transition-colors",
                  tabFilter === tab.id ? 'bg-bark-brown text-warm-cream font-medium' : 'text-driftwood hover:text-warm-cream'
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-amber-300" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search input & sort dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-driftwood pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={COPY.journal.searchPlaceholder}
              className="w-full bg-[#180f08] border border-cork-border text-warm-cream text-xs pl-8 pr-3.5 py-2 rounded-none placeholder-driftwood/60 focus:outline-none focus:border-warm-cream"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#180f08] border border-cork-border text-warm-cream text-xs px-3 py-2 rounded-none focus:outline-none focus:border-warm-cream font-mono"
            >
              <option value="date">Terbaru</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="name">Nama [A-Z]</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredVisits.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[#140c06] border border-dashed border-cork-border rounded-card text-center gap-3">
          <Coffee className="w-10 h-10 text-driftwood/60" />
          <h3 className="text-sm font-sans font-medium uppercase tracking-wider text-warm-cream">
            {COPY.journal.empty}
          </h3>
          <p className="text-xs text-driftwood max-w-sm">
            {query
              ? `Tidak ditemukan catatan yang cocok dengan "${query}". Coba kata kunci lain.`
              : 'Mulai petualanganmu dengan menandai pin di peta atau menambah check-in baru.'}
          </p>
          <Button variant="primary" size="md" onClick={onGoMap} className="mt-2 inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-warm-cream" />
            Jelajahi Peta Kafe
          </Button>
        </div>
      ) : (
        /* Journal Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVisits.map((v) => {
            const isWishlist = Boolean(v.isWishlist);
            const coverPhoto = v.photos?.[0];

            return (
              <Card
                key={v.id}
                hoverable
                onClick={() => onOpen(v.id)}
                className="flex flex-col justify-between overflow-hidden p-0 bg-[#140c06]"
              >
                {/* Photo Header if available */}
                {coverPhoto ? (
                  <div className="relative h-44 w-full overflow-hidden bg-[#100904]">
                    <img
                      src={coverPhoto}
                      alt={v.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {isWishlist ? (
                        <Tag variant="wishlist">⭐ Wishlist</Tag>
                      ) : (
                        <Tag variant="default">☕ Dikunjungi</Tag>
                      )}
                      <Tag variant="ember">
                        {v.type === 'slowbar' ? 'Slowbar' : v.type === 'roastery' ? 'Roastery' : 'Kafe'}
                      </Tag>
                    </div>
                    {!isWishlist && v.rating > 0 && (
                      <div className="absolute bottom-2.5 right-2.5 bg-walnut-shadow/90 px-2 py-0.5 rounded font-mono text-xs font-bold text-warm-cream border border-cork-border">
                        ★ {Number(v.rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isWishlist ? (
                        <Tag variant="wishlist">⭐ Wishlist</Tag>
                      ) : (
                        <Tag variant="default">☕ Dikunjungi</Tag>
                      )}
                      <Tag variant="ember">
                        {v.type === 'slowbar' ? 'Slowbar' : v.type === 'roastery' ? 'Roastery' : 'Kafe'}
                      </Tag>
                    </div>
                    {!isWishlist && v.rating > 0 && (
                      <span className="font-mono text-xs font-bold text-warm-cream">
                        ★ {Number(v.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Body */}
                <div className="p-4 flex flex-col gap-2.5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono text-driftwood">
                      {fmtDate(v.date)} {v.area ? `· ${v.area}` : ''}
                    </span>
                    <h3 className="text-base font-sans font-medium uppercase tracking-wide text-warm-cream mt-0.5 line-clamp-1">
                      {v.name}
                    </h3>
                  </div>

                  {(v.menu || v.bean) && (
                    <div className="text-xs text-warm-cream/80 line-clamp-1">
                      {v.menu ? `🍽️ ${v.menu}` : `🫘 ${v.bean}`}
                    </div>
                  )}

                  {/* Flavors Chips */}
                  {Array.isArray(v.flavors) && v.flavors.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {v.flavors.slice(0, 3).map((fl) => (
                        <span
                          key={fl}
                          className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-bark-brown/60 text-warm-cream/90 border border-cork-border/50"
                        >
                          {fl}
                        </span>
                      ))}
                      {v.flavors.length > 3 && (
                        <span className="text-[10px] text-driftwood font-mono self-center">
                          +{v.flavors.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Cupping Process Indicator */}
                  {v.sensory?.process && (
                    <div className="flex items-center gap-2 pt-1 border-t border-cork-border/30 text-[11px] font-mono text-driftwood">
                      <span>Proses: <b className="text-warm-cream capitalize">{v.sensory.process.replace('_', ' ')}</b></span>
                      <span>·</span>
                      <span>{v.sensory.category === 'milk' ? 'Kopi Susu' : 'Kopi Hitam'}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Journal;
