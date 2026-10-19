export const DEFAULT_CENTER = [-6.2088, 106.8456]; // Jakarta

export const locate = () => new Promise((res, rej) => {
  if (!navigator.geolocation) return rej(new Error('Geolokasi tidak didukung browser ini'));
  navigator.geolocation.getCurrentPosition(
    p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
    e => rej(e), { enableHighAccuracy: true, timeout: 10000 });
});

const NOM = 'https://nominatim.openstreetmap.org';

/** Best-effort: nama tempat (jika POI) dan area dari koordinat. */
export async function reverse(lat, lng) {
  const r = await fetch(`${NOM}/reverse?format=jsonv2&zoom=18&accept-language=id&lat=${lat}&lon=${lng}`);
  if (!r.ok) throw new Error('reverse failed');
  const d = await r.json(), a = d.address || {};
  const area = [a.suburb || a.village || a.neighbourhood, a.city || a.town || a.county || a.state].filter(Boolean).join(', ');
  const poi = ['amenity', 'shop', 'tourism'].includes(d.category);
  return { name: poi ? (d.name || '') : '', area };
}

export async function search(q) {
  const r = await fetch(`${NOM}/search?format=jsonv2&limit=5&accept-language=id&q=${encodeURIComponent(q)}`);
  if (!r.ok) throw new Error('search failed');
  return (await r.json()).map(x => ({ label: x.display_name, lat: +x.lat, lng: +x.lon }));
}
