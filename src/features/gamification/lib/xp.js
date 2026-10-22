/**
 * XP & Level calculation formulas
 */

export const xpForLevel = (lvl) => 40 * Math.max(0, lvl - 1) ** 2;

export const TITLES = [
  'Peminum Kopi Pemula',
  'Pencicip Kedai',
  'Penjelajah Kafe',
  'Kartografer Seduhan',
  'Pemburu Single Origin',
  'Barista Companion',
  'Master Slowbar & Artisan',
  'Legenda Coffee Sommelier',
];

export function titleForLevel(level) {
  return TITLES[Math.min(Math.max(1, level) - 1, TITLES.length - 1)];
}

export function levelProgress(currentXp, currentLevel) {
  const currentFloor = xpForLevel(currentLevel);
  const nextFloor = xpForLevel(currentLevel + 1);
  const range = nextFloor - currentFloor;
  if (range <= 0) return 1;
  return Math.min(1, Math.max(0, (currentXp - currentFloor) / range));
}
