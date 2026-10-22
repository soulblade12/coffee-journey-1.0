import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Search,
  Navigation,
  Coffee,
  Bookmark,
  Sparkles,
  MapPin,
  Compass,
  Crosshair,
  ArrowRight,
  Layers,
  Map as MapIcon,
  X,
} from 'lucide-react';
import {
  SatelliteTiles,
  StreetsTiles,
  Resize,
  FlyTo,
  visitedPinIcon,
  wishlistPinIcon,
  ghostCafePinIcon,
  draftPinIcon,
} from './mapParts';
import { Button, Tag, Stars } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { DEFAULT_CENTER, locate, reverse } from '@/shared/lib/geo';
import { getNearbyCafes, searchCafes } from '@/features/places';
import { fmtDate } from '@/shared/lib/date';
import { COPY } from '@/shared/copy/id';

function MapEventHandler({ onClick, onMouseMove }) {
  useMapEvents({
    click: (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
    mousemove: (e) => onMouseMove?.({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

function FitBoundsOnce({ points }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || !points.length) return;
    fitted.current = true;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 16 });
    }
  }, [points, map]);

  return null;
}

export function MapView({ visits = [], focus, onAdd, onOpen }) {
  const [layer, setLayer] = useState('sat'); // 'sat' | 'streets'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'visited' | 'wishlist'
  const [draft, setDraft] = useState(null); // { lat, lng, name?, area? }
  const [draftArea, setDraftArea] = useState('');
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [targetPos, setTargetPos] = useState(focus || null);
  const [userGps, setUserGps] = useState(null);
  const [locating, setLocating] = useState(false);
  const [cursorCoords, setCursorCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Sync focus if passed
  useEffect(() => {
    if (focus) {
      setTargetPos(focus);
    }
  }, [focus]);

  // Group visits by place (1 place = 1 pin!)
  const groupedPlaces = useMemo(() => {
    const map = new Map();

    for (const v of visits) {
      if (typeof v.lat !== 'number' || typeof v.lng !== 'number') continue;

      if (filterMode === 'visited' && v.isWishlist) continue;
      if (filterMode === 'wishlist' && !v.isWishlist) continue;

      const key = (v.name || '').trim().toLowerCase() || `${v.lat},${v.lng}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: v.name,
          lat: v.lat,
          lng: v.lng,
          isWishlist: Boolean(v.isWishlist),
          rating: v.rating || 0,
          latestDate: v.date,
          latestId: v.id,
          visits: [v],
        });
      } else {
        const existing = map.get(key);
        existing.visits.push(v);
        if (!v.isWishlist) existing.isWishlist = false;
        if ((v.date || '') > (existing.latestDate || '')) {
          existing.latestDate = v.date;
          existing.latestId = v.id;
          if (v.rating) existing.rating = v.rating;
        }
      }
    }

    return Array.from(map.values());
  }, [visits, filterMode]);

  const mapPoints = useMemo(() => groupedPlaces.map((p) => [p.lat, p.lng]), [groupedPlaces]);

  // Reverse geocode & fetch nearby cafes when draft pin is placed
  useEffect(() => {
    if (!draft) {
      setDraftArea('');
      setNearbyCafes([]);
      return;
    }

    let active = true;

    // Fast reverse geocode for area name
    reverse(draft.lat, draft.lng)
      .then((res) => {
        if (!active) return;
        if (res.area) setDraftArea(res.area);
        if (res.name && !draft.name) {
          setDraft((prev) => (prev ? { ...prev, name: res.name } : prev));
        }
      })
      .catch(() => {});

    // Non-blocking background check for nearby cafes
    getNearbyCafes(draft.lat, draft.lng, 350)
      .then((data) => {
        if (!active) return;
        setNearbyCafes(data.results || []);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [draft?.lat, draft?.lng]);

  // Handle map tap: Instantly places the eye-catching pin!
  const handleMapClick = (pos) => {
    setDraft({ lat: pos.lat, lng: pos.lng });
    setTargetPos(pos);
  };

  // Locate user GPS
  const handleLocateMe = async () => {
    setLocating(true);
    try {
      const p = await locate();
      setUserGps(p);
      setDraft(p);
      setTargetPos(p);
    } catch {
      // GPS not available
    } finally {
      setLocating(false);
    }
  };

  // Search places
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { results } = await searchCafes(searchQuery);
      setSearchResults(results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handlePickSearchResult = (item) => {
    if (typeof item.lat === 'number' && typeof item.lng === 'number') {
      const pos = { lat: item.lat, lng: item.lng, name: item.name, area: item.area };
      setDraft(pos);
      setTargetPos(pos);
      if (item.area) setDraftArea(item.area);
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleStartCheckin = (isWishlist = false, cafeName = '') => {
    if (!draft) return;
    onAdd({
      lat: draft.lat,
      lng: draft.lng,
      name: cafeName || draft.name || '',
      area: draftArea || draft.area || '',
      isWishlist,
    });
    setDraft(null);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-cork-border/40">
        <div>
          <span className="text-[11px] font-mono text-driftwood uppercase tracking-wider">
            {COPY.brand} // {COPY.map.title}
          </span>
          <h1 className="text-2xl sm:text-3xl font-sans font-medium uppercase tracking-tight text-warm-cream mt-0.5">
            Peta Jelajah Kafe
          </h1>
          <p className="text-xs text-driftwood mt-1 max-w-xl">
            {COPY.map.pinPrompt}. Sentuh titik mana saja untuk mengunci pin dan mencatat pengalaman ngopimu.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#140c06] border border-cork-border rounded-ghost self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={cn(
              "px-3 py-1 text-xs uppercase tracking-wide rounded-ghost transition-colors",
              filterMode === 'all' ? 'bg-bark-brown text-warm-cream font-medium' : 'text-driftwood hover:text-warm-cream'
            )}
          >
            Semua ({groupedPlaces.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('visited')}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wide rounded-ghost transition-colors",
              filterMode === 'visited' ? 'bg-bark-brown text-warm-cream font-medium' : 'text-driftwood hover:text-warm-cream'
            )}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-300" />
            Dikunjungi
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('wishlist')}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wide rounded-ghost transition-colors",
              filterMode === 'wishlist' ? 'bg-amber-950/60 text-amber-200 border border-amber-600/50' : 'text-driftwood hover:text-warm-cream'
            )}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            Wishlist
          </button>
        </div>
      </div>

      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-driftwood pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kafe atau lokasi..."
            className="w-full bg-[#180f08] border border-cork-border text-warm-cream text-xs pl-8 pr-3.5 py-2 rounded-none placeholder-driftwood focus:outline-none focus:border-warm-cream"
          />
          {searching && (
            <div className="absolute right-3 top-2.5 w-3.5 h-3.5 border-2 border-warm-cream/30 border-t-warm-cream rounded-full animate-spin" />
          )}

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#140c06] border border-cork-border rounded shadow-lg z-30 max-h-52 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePickSearchResult(item)}
                  className="w-full text-left p-2.5 hover:bg-bark-brown/60 border-b border-cork-border/30 last:border-none flex flex-col text-xs"
                >
                  <span className="font-medium text-warm-cream inline-flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-300" /> {item.name}
                  </span>
                  {item.area && <span className="text-[11px] text-driftwood pl-5">{item.area}</span>}
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLocateMe}
            disabled={locating}
            className="text-xs inline-flex items-center gap-1.5"
          >
            <Navigation className={cn("w-3.5 h-3.5 text-ember-accent", locating && "animate-spin")} />
            {locating ? 'Mencari...' : 'Posisi Saya'}
          </Button>

          {/* Layer switcher */}
          <div className="flex items-center p-0.5 bg-[#140c06] border border-cork-border rounded-ghost">
            <button
              type="button"
              onClick={() => setLayer('sat')}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 text-xs uppercase tracking-wider rounded-ghost transition-colors",
                layer === 'sat' ? 'bg-bark-brown text-warm-cream' : 'text-driftwood hover:text-warm-cream'
              )}
            >
              <Layers className="w-3 h-3" />
              {COPY.map.satellite}
            </button>
            <button
              type="button"
              onClick={() => setLayer('streets')}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 text-xs uppercase tracking-wider rounded-ghost transition-colors",
                layer === 'streets' ? 'bg-bark-brown text-warm-cream' : 'text-driftwood hover:text-warm-cream'
              )}
            >
              <MapIcon className="w-3 h-3" />
              {COPY.map.streets}
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[60vh] min-h-[400px] max-h-[700px] border border-cork-border rounded-card overflow-hidden bg-[#100904]">
        {/* Top-Right HUD Coordinates Indicator */}
        <div className="absolute top-2.5 right-2.5 z-[500] pointer-events-none hidden sm:flex items-center gap-2 px-2.5 py-1 bg-walnut-shadow/85 backdrop-blur border border-cork-border rounded-sm text-[10px] font-mono text-driftwood">
          <span>KOORDINAT:</span>
          <span className="text-warm-cream">
            {cursorCoords
              ? `${cursorCoords.lat.toFixed(4)}, ${cursorCoords.lng.toFixed(4)}`
              : 'KLIK PETA UNTUK PIN'}
          </span>
        </div>

        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          {layer === 'sat' ? <SatelliteTiles /> : <StreetsTiles />}
          <Resize />
          <FitBoundsOnce points={mapPoints} />
          <FlyTo target={targetPos} />
          <MapEventHandler onClick={handleMapClick} onMouseMove={setCursorCoords} />

          {/* User GPS Circle */}
          {userGps && (
            <CircleMarker
              center={[userGps.lat, userGps.lng]}
              radius={8}
              pathOptions={{
                color: '#ffedd7',
                weight: 2,
                fillColor: '#dc5000',
                fillOpacity: 0.85,
              }}
            />
          )}

          {/* Saved Cafe Pins (1 place = 1 pin!) */}
          {groupedPlaces.map((place) => {
            const isWishlist = place.isWishlist;
            const icon = isWishlist
              ? wishlistPinIcon()
              : visitedPinIcon(place.visits.length, place.rating);

            return (
              <Marker
                key={place.key}
                position={[place.lat, place.lng]}
                icon={icon}
              >
                <Popup autoPan>
                  <div className="flex flex-col gap-1.5 p-1 text-warm-cream min-w-[200px]">
                    <div className="flex items-center justify-between gap-2 border-b border-cork-border/40 pb-1">
                      <span className="text-[10px] font-mono text-driftwood uppercase">
                        {isWishlist ? '⭐ WISHLIST' : '☕ SUDAH DIKUNJUNGI'}
                      </span>
                      {place.visits.length > 1 && (
                        <span className="text-[10px] font-mono bg-amber-950/70 text-amber-200 px-1.5 py-0.2 rounded border border-amber-700/50">
                          {place.visits.length}x Mampir
                        </span>
                      )}
                    </div>

                    <h3 className="font-sans font-medium text-sm text-warm-cream mt-0.5">
                      {place.name}
                    </h3>

                    {!isWishlist && place.rating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Stars value={place.rating} size="xs" />
                        <span className="text-xs font-mono text-warm-cream font-bold">
                          {place.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    <span className="text-[11px] text-driftwood font-mono">
                      Terakhir: {fmtDate(place.latestDate)}
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onOpen(place.latestId)}
                      className="w-full mt-1.5 text-xs"
                    >
                      Buka Catatan Seduhan →
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* ACTIVE DRAFT PIN — INSTANTLY APPEARS WHEN CLICKING THE MAP! */}
          {draft && (
            <Marker
              key={`draft-${draft.lat}-${draft.lng}`}
              position={[draft.lat, draft.lng]}
              icon={draftPinIcon('+')}
              ref={(m) => {
                if (m) setTimeout(() => m.openPopup(), 15);
              }}
            >
              <Popup autoPan>
                <div className="flex flex-col gap-2 p-1.5 text-warm-cream min-w-[230px]">
                  <div className="flex items-center justify-between gap-2 border-b border-cork-border/40 pb-1">
                    <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">
                      📍 TITIK TERKUNCI
                    </span>
                    <span className="text-[10px] font-mono text-driftwood">
                      {draft.lat.toFixed(4)}, {draft.lng.toFixed(4)}
                    </span>
                  </div>

                  <p className="text-xs text-warm-cream font-medium">
                    {draftArea ? `Lokasi: ${draftArea}` : 'Titik koordinat berhasil dikunci pada peta.'}
                  </p>

                  {/* Nearby Cafes Quick Pick */}
                  {nearbyCafes.length > 0 && (
                    <div className="flex flex-col gap-1 pt-1 border-t border-cork-border/30">
                      <span className="text-[10px] font-mono text-driftwood">
                        Kafe Terdeteksi Sekitar:
                      </span>
                      <div className="flex flex-col gap-1 max-h-28 overflow-y-auto pr-0.5">
                        {nearbyCafes.slice(0, 3).map((cafe) => (
                          <button
                            key={cafe.id}
                            type="button"
                            onClick={() => handleStartCheckin(false, cafe.name)}
                            className="text-left px-2 py-1 bg-bark-brown/50 hover:bg-bark-brown rounded border border-cork-border/50 text-[11px] text-warm-cream flex items-center justify-between"
                          >
                            <span className="truncate">☕ {cafe.name}</span>
                            <span className="text-[9px] text-driftwood font-mono">Pilih →</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 pt-1.5 border-t border-cork-border/40">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleStartCheckin(false);
                      }}
                      className="w-full text-xs font-bold inline-flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Check-in Cepat (+25 XP)
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleStartCheckin(true);
                      }}
                      className="w-full text-xs text-amber-300 border-amber-800/40 hover:bg-amber-950/30 inline-flex items-center justify-center gap-1.5"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      Simpan ke Wishlist
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* EYE-CATCHING FLOATING ACTION DRAWER AT THE BOTTOM OF THE MAP */}
        {draft ? (
          <div
            className="mobile-map-drawer"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="drawer-inner">
              <div className="drawer-header-info">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-ember-accent animate-ping" />
                  <span className="text-xs font-mono font-bold text-amber-300 inline-flex items-center gap-1">
                    <Crosshair className="w-3 h-3 text-amber-300" />
                    {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
                  </span>
                </div>
                <span className="drawer-area-text text-xs text-driftwood">
                  {draftArea || 'TITIK KOORDINAT TERKUNCI'}
                </span>
              </div>

              {/* Nearby Cafes Suggestion Pill Chips */}
              {nearbyCafes.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="text-[10px] font-mono text-driftwood whitespace-nowrap">
                    Kafe Sekitar:
                  </span>
                  {nearbyCafes.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleStartCheckin(false, c.name);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs bg-[#1f140c] hover:bg-bark-brown border border-cork-border rounded-ghost text-warm-cream whitespace-nowrap transition-colors"
                    >
                      <Coffee className="w-3 h-3 text-amber-300" />
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="drawer-buttons-row">
                <button
                  type="button"
                  className="btn-lime flex-grow py-2 text-xs font-bold uppercase tracking-wider rounded-pill bg-bark-brown text-warm-cream hover:bg-[#4a3120] border border-cork-border/80 inline-flex items-center justify-center gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleStartCheckin(false);
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Check-in Kunjungan (+25 XP)
                </button>

                <button
                  type="button"
                  className="px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-pill bg-amber-950/40 text-amber-200 border border-amber-600/50 hover:bg-amber-900/40 inline-flex items-center justify-center gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleStartCheckin(true);
                  }}
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  Wishlist
                </button>

                <button
                  type="button"
                  className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-driftwood hover:text-warm-cream rounded-pill border border-cork-border"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setDraft(null);
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Hint banner when no pin is active */
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[500] pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#140c06]/90 backdrop-blur border border-cork-border rounded-ghost text-xs text-warm-cream/90 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px]">
                Sentuh / klik peta untuk menaruh pin dan mencatat kafe
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Field Survey Log / Cards below the map */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between pb-1 border-b border-cork-border/30">
          <span className="text-xs font-mono text-driftwood uppercase tracking-wider">
            Daftar Kafe di Peta ({groupedPlaces.length} Kedai)
          </span>
          <span className="text-xs font-mono text-warm-cream/70">
            {groupedPlaces.reduce((acc, p) => acc + p.visits.length, 0)} Total Kunjungan
          </span>
        </div>

        {groupedPlaces.length === 0 ? (
          <div className="p-8 bg-[#140c06] border border-dashed border-cork-border rounded-card text-center flex flex-col items-center gap-2 text-driftwood text-xs">
            <Compass className="w-8 h-8 text-driftwood/60 mx-auto" />
            <span>Belum ada pin kafe yang ditandai di peta.</span>
            <span>Sentuh titik mana pun pada citra satelit di atas atau tekan "Posisi Saya" untuk menaruh pin pertama!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groupedPlaces.map((place) => (
              <div
                key={place.key}
                onClick={() => onOpen(place.latestId)}
                className="p-3.5 bg-[#140c06] hover:bg-bark-brown/20 border border-cork-border hover:border-driftwood rounded-card cursor-pointer transition-colors flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-driftwood">
                      LAT {place.lat.toFixed(4)} · LNG {place.lng.toFixed(4)}
                    </span>
                    <h4 className="text-sm font-sans font-medium uppercase tracking-wide text-warm-cream mt-0.5 line-clamp-1">
                      {place.name}
                    </h4>
                  </div>
                  {place.isWishlist ? (
                    <Tag variant="wishlist" size="xs">⭐ Wishlist</Tag>
                  ) : (
                    <Tag variant="default" size="xs">
                      {place.visits.length > 1 ? `${place.visits.length}x Mampir` : `★ ${place.rating.toFixed(1)}`}
                    </Tag>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-cork-border/30 text-[11px] font-mono text-driftwood">
                  <span>Terakhir: {fmtDate(place.latestDate)}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetPos({ lat: place.lat, lng: place.lng });
                    }}
                    className="text-amber-300 hover:underline"
                  >
                    Fokus Peta ⌖
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;
