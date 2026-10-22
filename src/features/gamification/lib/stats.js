import { weekId, todayStr } from '@/shared/lib/date';
import { getWeeklyMissions } from './missions';

export function computeUserStats(visits = []) {
  const actualVisits = visits.filter((v) => !v.isWishlist);
  const wishlistVisits = visits.filter((v) => Boolean(v.isWishlist));

  const sorted = [...actualVisits].sort(
    (a, b) => (a.date || '').localeCompare(b.date || '') || (a.created || 0) - (b.created || 0)
  );

  const seenPlaces = new Set();
  const seenTypes = new Set();
  const allFlavors = new Set();
  let baseExperience = 0;

  for (const v of sorted) {
    const placeKey = (v.name || '').trim().toLowerCase();
    if (placeKey) {
      baseExperience += seenPlaces.has(placeKey) ? 10 : 25;
      seenPlaces.add(placeKey);
    } else {
      baseExperience += 10;
    }

    if (v.type && !seenTypes.has(v.type)) {
      baseExperience += 15;
      seenTypes.add(v.type);
    }

    // Photos: +5 per photo up to 5 photos
    const photoCount = Math.min((v.photos || []).length, 5);
    baseExperience += photoCount * 5;

    // Menu note: +5
    if (v.menu || v.bean) baseExperience += 5;

    // Tasting / review note: +10 if >= 20 chars
    if ((v.note || '').trim().length >= 20) baseExperience += 10;

    // Map coordinates: +5
    if (typeof v.lat === 'number' && typeof v.lng === 'number') baseExperience += 5;

    // Flavors: +5
    if (Array.isArray(v.flavors) && v.flavors.length > 0) {
      baseExperience += 5;
      v.flavors.forEach((f) => f && allFlavors.add(f.toLowerCase().trim()));
    }

    // Stickers: +15 each
    if (Array.isArray(v.stickers) && v.stickers.length > 0) {
      baseExperience += v.stickers.length * 15;
    }

    // Explicitly saved scrapbook: +10
    if (Array.isArray(v.scrapbookLayout) && v.scrapbookLayout.length > 0 && v.scrapbookSaved === true) {
      baseExperience += 10;
    }
  }

  // Calculate mission bonus XP
  const missions = getWeeklyMissions(visits);
  const missionBonusXp = missions.filter((m) => m.done).reduce((acc, m) => acc + (m.xp || 20), 0);
  const totalXp = baseExperience + missionBonusXp;

  // Level formula: floor(sqrt(xp / 40)) + 1
  const level = Math.floor(Math.sqrt(totalXp / 40)) + 1;

  // Streak calculation (consecutive weeks)
  const weeksWithVisits = new Set(actualVisits.map((v) => weekId(v.date)));
  let currentW = weekId(todayStr());
  if (!weeksWithVisits.has(currentW)) currentW--;
  let weeklyStreak = 0;
  while (weeksWithVisits.has(currentW)) {
    weeklyStreak++;
    currentW--;
  }

  const hasCoords = (v) => typeof v.lat === 'number' && typeof v.lng === 'number';

  return {
    xp: totalXp,
    level,
    weeklyStreak,
    totalVisits: visits.length,
    visitedCount: actualVisits.length,
    wishlistCount: wishlistVisits.length,
    uniquePlaces: seenPlaces.size,
    areasCount: new Set(visits.map((v) => (v.area || v.city || '').trim().toLowerCase()).filter(Boolean)).size,
    photosCount: visits.reduce((acc, v) => acc + (v.photos?.length || 0), 0),
    stickersCount: visits.reduce((acc, v) => acc + (v.stickers?.length || 0), 0),
    scrapbooksCount: visits.filter((v) => Array.isArray(v.scrapbookLayout) && v.scrapbookLayout.length > 0 && v.scrapbookSaved === true).length,
    flavorsCount: allFlavors.size,
    pinsCount: actualVisits.filter(hasCoords).length,
    hasFiveStar: actualVisits.some((v) => typeof v.rating === 'number' && v.rating >= 4.95),
    slowbarCount: actualVisits.filter((v) => v.type === 'slowbar').length,
    typesCount: seenTypes.size,
    cuppingCount: actualVisits.filter((v) => v.sensory && (v.sensory.acidity || v.sensory.body)).length,
  };
}
