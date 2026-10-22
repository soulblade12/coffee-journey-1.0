import Dexie from 'dexie';

/**
 * Jejak Kopi Dexie Database
 * Schema versioning, individual visit records, media storage, and automatic legacy migration
 */
export const db = new Dexie('JejakKopiDB');

db.version(1).stores({
  visits: 'id, created, date, name, type, rating, city, area, isWishlist, *flavors',
  media: 'id, visitId, type',
  settings: 'key',
});

let migrationDone = false;

/**
 * Run automatic migration from legacy single-blob IndexedDB and localStorage
 */
export async function runLegacyMigration() {
  if (migrationDone) return;
  migrationDone = true;

  try {
    const existingCount = await db.visits.count();
    if (existingCount > 0) {
      // Already has data in Dexie DB
      return;
    }

    // 1. Try reading legacy IndexedDB 'jejak-kopi' store 'kv'
    const legacyVisits = await readLegacyIndexedDB();
    if (Array.isArray(legacyVisits) && legacyVisits.length > 0) {
      console.info(`[Migration] Migrating ${legacyVisits.length} visits from legacy IndexedDB...`);
      await db.visits.bulkPut(legacyVisits.map(normalizeVisit));
      return;
    }

    // 2. Try reading legacy localStorage
    const local = localStorage.getItem('jejak-kopi-visits');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.info(`[Migration] Migrating ${parsed.length} visits from localStorage...`);
          await db.visits.bulkPut(parsed.map(normalizeVisit));
        }
      } catch (err) {
        console.warn('[Migration] Failed to parse localStorage visits', err);
      }
    }
  } catch (err) {
    console.error('[Migration] Error during legacy migration:', err);
  }
}

function normalizeVisit(v) {
  return {
    id: v.id || crypto.randomUUID(),
    created: v.created || Date.now(),
    date: v.date || new Date().toISOString().slice(0, 10),
    name: v.name || 'Kafe Tanpa Nama',
    type: v.type || 'cafe',
    rating: typeof v.rating === 'number' ? v.rating : 4,
    city: v.city || '',
    area: v.area || '',
    lat: typeof v.lat === 'number' ? v.lat : undefined,
    lng: typeof v.lng === 'number' ? v.lng : undefined,
    isWishlist: Boolean(v.isWishlist),
    bean: v.bean || '',
    brew: v.brew || '',
    menu: v.menu || '',
    note: v.note || '',
    photos: Array.isArray(v.photos) ? v.photos : [],
    flavors: Array.isArray(v.flavors) ? v.flavors : [],
    stickers: Array.isArray(v.stickers) ? v.stickers : [],
    scrapbookLayout: Array.isArray(v.scrapbookLayout) ? v.scrapbookLayout : [],
    ratings: v.ratings || {
      overall: v.rating || 4,
      coffee: v.rating || 4,
      place: 4,
      service: 4,
      value: 4,
    },
    sensory: v.sensory || {
      acidity: 3,
      body: 3,
      sweetness: 3,
      aftertaste: 3,
      process: 'washed',
      roast: 'medium',
      category: 'black',
    },
    place: v.place || null,
  };
}

function readLegacyIndexedDB() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('jejak-kopi', 1);
      req.onerror = () => resolve(null);
      req.onsuccess = () => {
        const legacyDb = req.result;
        if (!legacyDb.objectStoreNames.contains('kv')) {
          legacyDb.close();
          return resolve(null);
        }
        try {
          const tx = legacyDb.transaction('kv', 'readonly');
          const store = tx.objectStore('kv');
          const getReq = store.get('visits');
          getReq.onsuccess = () => {
            legacyDb.close();
            resolve(getReq.result || null);
          };
          getReq.onerror = () => {
            legacyDb.close();
            resolve(null);
          };
        } catch {
          legacyDb.close();
          resolve(null);
        }
      };
    } catch {
      resolve(null);
    }
  });
}
