import { useEffect } from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

export function DarkTiles() {
  return (
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      subdomains="abcd" maxZoom={19}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    />
  );
}

/** Peta di dalam <dialog> mulai dengan ukuran 0 — paksa hitung ulang setelah dialog terbuka. */
export function Resize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export function FlyTo({ target, zoom = 16 }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), zoom), { duration: .8 }); }, [target, map, zoom]);
  return null;
}

export const pinIcon = (label = '', draft = false) => L.divIcon({
  className: 'pin-wrap',
  html: `<span class="pin${draft ? ' draft' : ''}"><i>${label}</i></span>`,
  iconSize: [34, 34], iconAnchor: [17, 40], popupAnchor: [0, -38],
});
