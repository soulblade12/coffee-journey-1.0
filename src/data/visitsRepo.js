import { db, runLegacyMigration } from './db';

/**
 * Repository layer for Visits and Wishlist items
 */

export async function getAllVisits() {
  await runLegacyMigration();
  const visits = await db.visits.toArray();
  // Sort by date descending, then created descending
  return visits.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.created || 0) - (a.created || 0));
}

export async function getVisitById(id) {
  await runLegacyMigration();
  return db.visits.get(id);
}

export async function putVisit(visit) {
  await runLegacyMigration();
  await db.visits.put(visit);
  return visit;
}

export async function patchVisit(id, patch) {
  await runLegacyMigration();
  await db.visits.update(id, patch);
  return db.visits.get(id);
}

export async function deleteVisit(id) {
  await runLegacyMigration();
  await db.visits.delete(id);
  // Also delete associated media
  await db.media.where('visitId').equals(id).delete();
  return true;
}

export async function bulkPutVisits(visitsList) {
  await runLegacyMigration();
  await db.visits.bulkPut(visitsList);
  return true;
}

export async function clearAllVisits() {
  await db.visits.clear();
  await db.media.clear();
  return true;
}
