/**
 * Free OpenStreetMap Places Provider:
 * 1. Overpass API for nearby cafes (amenity=cafe)
 * 2. Photon API (Komoot) for fast type-ahead cafe search
 * 3. Nominatim for reverse geocoding
 * 
 * Free to use, complies with OpenStreetMap ODbL attribution.
 */

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

/**
 * Fetch nearby cafes around lat, lng using Overpass API
 * Protected by 2500ms timeout so it never blocks UI.
 * @param {number} lat 
 * @param {number} lng 
 * @param {number} radiusMeters (default 350m)
 * @returns {Promise<Array<{ id: string, name: string, area: string, lat: number, lng: number, source: string }>>}
 */
export async function getNearbyCafesOSM(lat, lng, radiusMeters = 350) {
  const query = `[out:json][timeout:3];(node["amenity"="cafe"](around:${radiusMeters},${lat},${lng});node["shop"="coffee"](around:${radiusMeters},${lat},${lng}););out body 12;`;
  
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    try {
      const resp = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) continue;
      const json = await resp.json();
      if (!json.elements) continue;

      return json.elements
        .filter((el) => el.tags && (el.tags.name || el.tags['name:id']))
        .map((el) => {
          const tags = el.tags || {};
          const name = tags.name || tags['name:id'] || 'Kedai Kopi';
          const street = tags['addr:street'] || tags['addr:suburb'] || '';
          const city = tags['addr:city'] || '';
          const area = [street, city].filter(Boolean).join(', ');

          return {
            id: `osm-${el.id}`,
            name,
            area,
            lat: el.lat,
            lng: el.lon,
            source: 'osm',
            providerName: 'OpenStreetMap',
            type: tags.cuisine === 'coffee_shop' ? 'slowbar' : 'cafe',
          };
        });
    } catch {
      clearTimeout(timeout);
      // try next endpoint or fallback
    }
  }

  return [];
}

/**
 * Search cafes using Komoot Photon autocomplete API
 * @param {string} query 
 * @param {number} [lat] 
 * @param {number} [lng] 
 */
export async function searchCafesPhoton(query, lat, lng) {
  if (!query || query.trim().length < 2) return [];

  let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`;
  if (typeof lat === 'number' && typeof lng === 'number') {
    url += `&lat=${lat}&lon=${lng}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!data.features) return [];

    return data.features
      .filter((f) => {
        const p = f.properties || {};
        return (
          p.name &&
          (p.osm_value === 'cafe' ||
            p.osm_value === 'coffee_shop' ||
            p.osm_key === 'amenity' ||
            query.toLowerCase().includes('kopi') ||
            p.name.toLowerCase().includes('kopi') ||
            p.name.toLowerCase().includes('coffee'))
        );
      })
      .map((f) => {
        const p = f.properties || {};
        const coords = f.geometry?.coordinates || [];
        const area = [p.district || p.locality, p.city || p.county].filter(Boolean).join(', ');
        return {
          id: `photon-${p.osm_id || Math.random()}`,
          name: p.name,
          area: area || p.country || '',
          lat: coords[1],
          lng: coords[0],
          source: 'osm',
          providerName: 'Photon / OSM',
        };
      });
  } catch {
    clearTimeout(timeout);
    return [];
  }
}
