import { fmtDate } from '@/shared/lib/date';

export const WASHI_TAPES = [
  { id: 'washi-kraft', name: 'Washi Kraft', color: '#c9a77c' },
  { id: 'washi-amber', name: 'Washi Amber', color: '#dc5000' },
  { id: 'washi-matcha', name: 'Washi Matcha', color: '#556b2f' },
  { id: 'washi-espresso', name: 'Washi Espresso', color: '#382416' },
];

export const DECORATIVE_STAMPS = [
  { id: 'stamp-fresh', text: '☕ FRESH BREWED' },
  { id: 'stamp-single', text: '🫘 SINGLE ORIGIN' },
  { id: 'stamp-slowbar', text: '🫖 SLOWBAR ARCHIVE' },
  { id: 'stamp-approved', text: '★ APPROVED TASTE' },
  { id: 'stamp-memory', text: '📷 COFFEE STORY' },
];

/**
 * Generate default starter collage layout for a visit
 */
export function generateDefaultCollage(visit) {
  if (!visit) return [];
  const items = [];

  // 1. Photos from visit as tilted polaroids
  (visit.photos || []).slice(0, 3).forEach((photo, idx) => {
    const posX = 40 + (idx % 2) * 240 + (Math.random() * 20 - 10);
    const posY = 120 + Math.floor(idx / 2) * 280 + (Math.random() * 20 - 10);
    const rot = (idx % 2 === 0 ? -4 : 4) + (Math.random() * 3 - 1.5);
    items.push({
      id: `photo-${idx}-${Date.now()}`,
      type: 'polaroid',
      src: photo,
      x: posX,
      y: posY,
      width: 220,
      rotate: rot,
      caption: `${visit.name} · ${fmtDate(visit.date)}`,
      tapeColor: WASHI_TAPES[idx % WASHI_TAPES.length].color,
    });
  });

  // 2. Cupping tasting badge
  items.push({
    id: `card-cupping-${Date.now()}`,
    type: 'cupping-badge',
    x: 290,
    y: 380,
    width: 260,
    rotate: -2,
    title: (visit.name || 'Kedai Kopi').toUpperCase(),
    bean: visit.bean || 'Single Origin Specialty',
    brew: visit.brew || 'Filter Coffee V60',
    flavors: visit.flavors?.length ? visit.flavors : ['Caramel', 'Floral', 'Citrus'],
    rating: visit.rating || 4.5,
  });

  // 3. Handwritten memory note
  items.push({
    id: `note-story-${Date.now()}`,
    type: 'text-note',
    x: 50,
    y: 580,
    width: 300,
    rotate: 2,
    font: 'Caveat',
    text: visit.note || 'Menikmati seduhan hangat sambil mencatat karakter rasa kopi hari ini...',
    bg: 'rgba(255, 237, 215, 0.94)',
    color: '#2b1b11',
  });

  return items;
}
