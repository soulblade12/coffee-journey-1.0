import { describe, it, expect } from 'vitest';
import {
  computeUserStats,
  getWeeklyMissions,
  xpForLevel,
  titleForLevel,
  levelProgress,
  BADGES,
  earnedBadges,
} from '../lib';

describe('Gamification Logic', () => {
  it('calculates level thresholds correctly', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(40);
    expect(xpForLevel(3)).toBe(160);
    expect(titleForLevel(1)).toBe('Peminum Kopi Pemula');
  });

  it('calculates level progress within 0..1', () => {
    expect(levelProgress(0, 1)).toBe(0);
    expect(levelProgress(20, 1)).toBe(0.5);
    expect(levelProgress(40, 1)).toBe(1);
  });

  it('does not auto-complete scrapbook mission on empty visit', () => {
    const visits = [
      {
        id: 'v1',
        name: 'Kafe Test',
        date: new Date().toISOString().slice(0, 10),
        rating: 4.5,
        photos: [],
        scrapbookLayout: [], // empty layout
        scrapbookSaved: false,
      },
    ];

    const missions = getWeeklyMissions(visits);
    const scrapMission = missions.find((m) => m.id === 'm-scrapbook');
    expect(scrapMission).toBeDefined();
    expect(scrapMission.done).toBe(false);
    expect(scrapMission.current).toBe(0);
  });

  it('completes scrapbook mission only when explicitly saved', () => {
    const visits = [
      {
        id: 'v1',
        name: 'Kafe Test',
        date: new Date().toISOString().slice(0, 10),
        rating: 4.5,
        photos: ['data:image/jpeg;base64,...'],
        scrapbookLayout: [{ id: 'item1', type: 'polaroid' }],
        scrapbookSaved: true,
      },
    ];

    const missions = getWeeklyMissions(visits);
    const scrapMission = missions.find((m) => m.id === 'm-scrapbook');
    expect(scrapMission.done).toBe(true);
    expect(scrapMission.current).toBe(1);
  });

  it('computes XP and unlocks first visit badge', () => {
    const visits = [
      {
        id: 'v1',
        name: 'Kopi Kenangan',
        type: 'cafe',
        date: new Date().toISOString().slice(0, 10),
        rating: 5,
        lat: -6.2,
        lng: 106.8,
        photos: ['photo1.jpg'],
        flavors: ['caramel', 'chocolate'],
        note: 'Kopi yang sangat nikmat dengan aroma kuat dan manis seimbang.',
      },
    ];

    const stats = computeUserStats(visits);
    expect(stats.totalVisits).toBe(1);
    expect(stats.visitedCount).toBe(1);
    expect(stats.xp).toBeGreaterThanOrEqual(50);

    const badges = earnedBadges(stats);
    expect(badges.has('first')).toBe(true);
    expect(badges.has('perfect')).toBe(true);
    expect(badges.has('five')).toBe(false);
  });
});
