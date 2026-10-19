import { todayStr } from './util';

export const xpFor = l => 40 * (l - 1) ** 2;
export const TITLES = ['Pemburu Pemula', 'Pencicip Setia', 'Pemburu Cafe', 'Penjelajah Kopi', 'Pemburu Single Origin', 'Master Slowbar', 'Legenda Cafe Hunter'];
export const titleFor = level => TITLES[Math.min(level - 1, TITLES.length - 1)];
export const progress = s => (s.xp - xpFor(s.level)) / (xpFor(s.level + 1) - xpFor(s.level));

export const weekId = d => Math.floor((Date.parse(d + 'T00:00:00Z') / 864e5 + 3) / 7);
const hasPin = v => typeof v.lat === 'number' && typeof v.lng === 'number';

/** Misi mingguan: reset tiap Senin, dihitung dari kunjungan minggu ini. */
export function missions(visits) {
  const wk = weekId(todayStr());
  const mine = visits.filter(v => weekId(v.date) === wk);
  const before = new Set(visits.filter(v => weekId(v.date) < wk).map(v => v.name.trim().toLowerCase()));
  const fresh = new Set(mine.map(v => v.name.trim().toLowerCase()).filter(n => !before.has(n)));
  return [
    { em: '🎯', t: 'Kunjungi 3 tempat minggu ini', n: mine.length, goal: 3 },
    { em: '🆕', t: 'Temukan 1 tempat baru', n: fresh.size, goal: 1 },
    { em: '📍', t: 'Taruh 2 pin di peta', n: mine.filter(hasPin).length, goal: 2 },
    { em: '👅', t: 'Catat rasa kopi 2 kali', n: mine.filter(v => v.flavors?.length).length, goal: 2 },
    { em: '🫖', t: 'Mampir ke slowbar', n: mine.filter(v => v.type === 'slowbar').length, goal: 1 },
    { em: '📸', t: 'Ambil 5 foto', n: mine.reduce((a, v) => a + v.photos.length, 0), goal: 5 },
  ].map(m => ({ ...m, n: Math.min(m.n, m.goal), done: m.n >= m.goal }));
}

export function computeStats(visits) {
  const sorted = [...visits].sort((a, b) => a.date.localeCompare(b.date) || a.created - b.created);
  const seenPlace = new Set(), seenType = new Set();
  let xp = 0;
  for (const v of sorted) {
    const k = v.name.trim().toLowerCase();
    xp += seenPlace.has(k) ? 10 : 25; seenPlace.add(k);
    if (!seenType.has(v.type)) { xp += 15; seenType.add(v.type); }
    xp += Math.min(v.photos.length, 5) * 5;
    if (v.menu) xp += 5;
    if ((v.note || '').length >= 20) xp += 10;
    if (hasPin(v)) xp += 5;
    if (v.flavors?.length) xp += 5;
  }
  const level = Math.floor(Math.sqrt(xp / 40)) + 1;
  const weeks = new Set(visits.map(v => weekId(v.date)));
  let w = weekId(todayStr()); if (!weeks.has(w)) w--;
  let streak = 0; while (weeks.has(w)) { streak++; w--; }
  const count = t => visits.filter(v => v.type === t).length;
  return {
    xp, level, streak, total: visits.length, places: seenPlace.size,
    areas: new Set(visits.map(v => (v.area || '').trim().toLowerCase()).filter(Boolean)).size,
    photos: visits.reduce((a, v) => a + v.photos.length, 0),
    notes: visits.filter(v => (v.note || '').length >= 20).length,
    pins: visits.filter(hasPin).length,
    five: visits.some(v => v.rating >= 4.95),
    slowbar: count('slowbar'), types: seenType.size,
  };
}

export const BADGES = [
  { id: 'first', ic: '🌱', name: 'Tegukan Pertama', d: 'Catat 1 kunjungan', test: s => s.total >= 1 },
  { id: 'five', ic: '🔥', name: 'Rutin Ngopi', d: '5 kunjungan', test: s => s.total >= 5 },
  { id: 'ten', ic: '📚', name: 'Kolektor', d: '10 kunjungan', test: s => s.total >= 10 },
  { id: '25', ic: '👑', name: 'Legenda', d: '25 kunjungan', test: s => s.total >= 25 },
  { id: 'places', ic: '🧭', name: 'Penjelajah', d: '5 tempat berbeda', test: s => s.places >= 5 },
  { id: 'pins', ic: '📍', name: 'Kartografer', d: '5 pin di peta', test: s => s.pins >= 5 },
  { id: 'areas', ic: '🗺️', name: 'Cafe Hopper', d: '3 area berbeda', test: s => s.areas >= 3 },
  { id: 'slow', ic: '🫖', name: 'Slowbar Lover', d: '3 kunjungan slowbar', test: s => s.slowbar >= 3 },
  { id: 'types', ic: '🎯', name: 'Serba Bisa', d: 'Coba ketiga jenis tempat', test: s => s.types >= 3 },
  { id: 'photo', ic: '📸', name: 'Fotografer', d: '10 foto terkumpul', test: s => s.photos >= 10 },
  { id: 'notes', ic: '✍️', name: 'Kritikus', d: '5 catatan lengkap', test: s => s.notes >= 5 },
  { id: 'perfect', ic: '⭐', name: 'Bintang Lima', d: 'Beri rating sempurna', test: s => s.five },
  { id: 'streak', ic: '⚡', name: 'Streak 3 Minggu', d: 'Ngopi 3 minggu beruntun', test: s => s.streak >= 3 },
];
export const earned = s => new Set(BADGES.filter(b => b.test(s)).map(b => b.id));
