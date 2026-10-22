/**
 * Coffee Lover Badges & Achievements
 */
export const BADGES = [
  {
    id: 'first',
    icon: '🌱',
    name: 'Tegukan Pertama',
    desc: 'Catat 1 kunjungan kafe pertamamu',
    test: (s) => s.visitedCount >= 1,
  },
  {
    id: 'five',
    icon: '🔥',
    name: 'Rutin Ngopi',
    desc: 'Sudah mengunjungi 5 kafe',
    test: (s) => s.visitedCount >= 5,
  },
  {
    id: 'ten',
    icon: '📚',
    name: 'Kolektor Logbook',
    desc: '10 catatan kunjungan tersimpan rapi',
    test: (s) => s.visitedCount >= 10,
  },
  {
    id: '25',
    icon: '👑',
    name: 'Legenda Penjelajah',
    desc: '25 kunjungan kafe tercatat di jurnal',
    test: (s) => s.visitedCount >= 25,
  },
  {
    id: 'places',
    icon: '🧭',
    name: 'Penjelajah Kedai',
    desc: 'Mencoba 5 tempat ngopi berbeda',
    test: (s) => s.uniquePlaces >= 5,
  },
  {
    id: 'pins',
    icon: '📍',
    name: 'Kartografer Kopi',
    desc: 'Tandai 5 titik kafe di peta satelit',
    test: (s) => s.pinsCount >= 5,
  },
  {
    id: 'wishlist',
    icon: '⭐',
    name: 'Penakluk Wishlist',
    desc: 'Punya kafe incaran di daftar wishlist',
    test: (s) => s.wishlistCount >= 1,
  },
  {
    id: 'slow',
    icon: '🫖',
    name: 'Pencinta Slowbar',
    desc: '3 kali menikmati seduhan manual di slowbar',
    test: (s) => s.slowbarCount >= 3,
  },
  {
    id: 'cupping',
    icon: '📊',
    name: 'Analis Sensori',
    desc: 'Catat profil cupping (acidity, body, sweetness)',
    test: (s) => s.cuppingCount >= 2,
  },
  {
    id: 'sticker',
    icon: '🏷️',
    name: 'Artisan Stiker',
    desc: 'Scan foto label kopi menjadi stiker scrapbook',
    test: (s) => s.stickersCount >= 1,
  },
  {
    id: 'scrap',
    icon: '📖',
    name: 'Storyteller Kopi',
    desc: 'Simpan susunan buku kenangan scrapbook',
    test: (s) => s.scrapbooksCount >= 1,
  },
  {
    id: 'sommelier',
    icon: '🍇',
    name: 'Sommelier Rasa',
    desc: 'Mencoba 5 karakter rasa berbeda pada seduhan',
    test: (s) => s.flavorsCount >= 5,
  },
  {
    id: 'photo',
    icon: '📸',
    name: 'Dokumentasi Visual',
    desc: 'Simpan minimal 8 foto kopi favoritmu',
    test: (s) => s.photosCount >= 8,
  },
  {
    id: 'perfect',
    icon: '✨',
    name: 'Seduhan Sempurna',
    desc: 'Berikan rating sempurna 5.0 untuk kafe istimewa',
    test: (s) => s.hasFiveStar,
  },
  {
    id: 'streak',
    icon: '⚡',
    name: 'Ritual 3 Minggu',
    desc: 'Konsisten ngopi 3 minggu berturut-turut',
    test: (s) => s.weeklyStreak >= 3,
  },
];

export function earnedBadges(stats) {
  const set = new Set();
  for (const b of BADGES) {
    if (b.test(stats)) set.add(b.id);
  }
  return set;
}
