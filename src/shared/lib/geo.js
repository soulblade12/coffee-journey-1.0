export const DEFAULT_CENTER = [-6.2088, 106.8456]; // Jakarta

export const locate = () => new Promise((res, rej) => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return rej(new Error('Geolokasi tidak didukung browser ini'));
  }
  navigator.geolocation.getCurrentPosition(
    p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
    e => rej(e),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

/**
 * Calculate distance in meters between two coordinates (Haversine formula)
 */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const NOM = 'https://nominatim.openstreetmap.org';
const reverseCache = new Map();

/**
 * Best-effort: nama tempat (jika POI) dan area dari koordinat dengan cache memory
 */
export async function reverse(lat, lng) {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (reverseCache.has(key)) return reverseCache.get(key);

  try {
    const r = await fetch(`${NOM}/reverse?format=jsonv2&zoom=18&accept-language=id&lat=${lat}&lon=${lng}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!r.ok) throw new Error('reverse failed');
    const d = await r.json();
    const a = d.address || {};
    const area = [a.suburb || a.village || a.neighbourhood, a.city || a.town || a.county || a.state].filter(Boolean).join(', ');
    const poi = ['amenity', 'shop', 'tourism'].includes(d.category);
    const result = { name: poi ? (d.name || '') : '', area };
    reverseCache.set(key, result);
    return result;
  } catch {
    return { name: '', area: '' };
  }
}
