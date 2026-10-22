import { weekId, todayStr } from '@/shared/lib/date';

/**
 * Weekly coffee explorer missions
 */
export function getWeeklyMissions(visits) {
  const currentWeek = weekId(todayStr());
  
  // Filter visits from this week that are actual visits (not just wishlist)
  const thisWeekVisits = visits.filter(
    (v) => !v.isWishlist && weekId(v.date) === currentWeek
  );

  // Cafes visited before this week
  const pastCafes = new Set(
    visits
      .filter((v) => !v.isWishlist && weekId(v.date) < currentWeek)
      .map((v) => (v.name || '').trim().toLowerCase())
  );

  // New cafes visited this week
  const newPlacesThisWeek = new Set(
    thisWeekVisits
      .map((v) => (v.name || '').trim().toLowerCase())
      .filter((n) => n && !pastCafes.has(n))
  );

  const hasCoords = (v) => typeof v.lat === 'number' && typeof v.lng === 'number';

  // Count stickers scanned this week or saved
  const stickersTotal = visits.reduce((acc, v) => acc + (v.stickers?.length || 0), 0);

  // Count explicitly saved scrapbooks (not auto-generated empty defaults)
  const savedScrapbooks = visits.filter(
    (v) => Array.isArray(v.scrapbookLayout) && v.scrapbookLayout.length > 0 && v.scrapbookSaved === true
  ).length;

  const missionList = [
    {
      id: 'm-visit-2',
      emoji: '☕',
      title: 'Mampir ke 2 kafe minggu ini',
      progress: thisWeekVisits.length,
      goal: 2,
      xp: 25,
    },
    {
      id: 'm-new-cafe',
      emoji: '🧭',
      title: 'Temukan 1 kedai kopi baru',
      progress: newPlacesThisWeek.size,
      goal: 1,
      xp: 30,
    },
    {
      id: 'm-pin-map',
      emoji: '📍',
      title: 'Tandai 2 pin di peta',
      progress: thisWeekVisits.filter(hasCoords).length,
      goal: 2,
      xp: 20,
    },
    {
      id: 'm-sensory-notes',
      emoji: '👅',
      title: 'Catat profil rasa atau cupping 2 kali',
      progress: thisWeekVisits.filter((v) => (v.flavors?.length || 0) > 0 || v.sensory).length,
      goal: 2,
      xp: 25,
    },
    {
      id: 'm-slowbar',
      emoji: '🫖',
      title: 'Coba manual brew di slowbar',
      progress: thisWeekVisits.filter((v) => v.type === 'slowbar').length,
      goal: 1,
      xp: 25,
    },
    {
      id: 'm-photo',
      emoji: '📸',
      title: 'Abadikan 3 foto cangkir kopi',
      progress: thisWeekVisits.reduce((acc, v) => acc + (v.photos?.length || 0), 0),
      goal: 3,
      xp: 20,
    },
    {
      id: 'm-sticker-scan',
      emoji: '🏷️',
      title: 'Scan foto label kopi jadi stiker',
      progress: stickersTotal,
      goal: 1,
      xp: 35,
    },
    {
      id: 'm-scrapbook',
      emoji: '📖',
      title: 'Rangkai & simpan 1 lembar buku kenangan',
      progress: savedScrapbooks,
      goal: 1,
      xp: 30,
    },
  ];

  return missionList.map((m) => {
    const capped = Math.min(m.progress, m.goal);
    return {
      ...m,
      current: capped,
      done: capped >= m.goal,
    };
  });
}
