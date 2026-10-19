import { useEffect } from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

/** Layer satelit muka bumi resolusi tinggi (Esri World Imagery) sesuai tema Inversa */
export function SatelliteTiles({ labels = true }) {
  return (
    <>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      />
      {labels && (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          opacity={0.85}
        />
      )}
    </>
  );
}

/** Layer topografi gelap alternatif */
export function TopoDarkTiles() {
  return (
    <TileLayer
      className="topo-tile"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    />
  );
}

/** Peta di dalam dialog atau tab tersembunyi perlu hitung ulang ukuran */
export function Resize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export function FlyTo({ target, zoom = 16 }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), zoom), { duration: 0.9 });
  }, [target, map, zoom]);
  return null;
}

/** Pin surveyor bernuansa Inversa: neon lime (#ebfc72), penanda instrumen lapangan */
export const pinIcon = (label = '', draft = false) => L.divIcon({
  className: 'surveyor-pin-wrap',
  html: `<div class="surveyor-pin${draft ? ' target-draft' : ''}">
    <span class="reticle"></span>
    <span class="dot"></span>
    <span class="tag-val">${label || '⌖'}</span>
  </div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 40],
  popupAnchor: [0, -38],
});
