import { useEffect } from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Satellite imagery layer with clear readable labels
 */
export function SatelliteTiles({ labels = true }) {
  return (
    <>
      <TileLayer
        className="satellite-darkroom-tile"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
        attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
      />
      {labels && (
        <TileLayer
          className="labels-darkroom-tile"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          opacity={0.8}
        />
      )}
    </>
  );
}

/**
 * Standard street tiles layer (OSM)
 */
export function StreetsTiles() {
  return (
    <TileLayer
      className="streets-tile"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
  );
}

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
    if (target) {
      map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), zoom), { duration: 0.9 });
    }
  }, [target, map, zoom]);
  return null;
}

/**
 * Active draft / picker marker — eye-catching pulsing surveyor reticle
 */
export const draftPinIcon = (label = '+') =>
  L.divIcon({
    className: 'oryzo-pin-wrap',
    html: `
      <div class="oryzo-pin target-draft">
        <span class="reticle"></span>
        <span class="dot"></span>
        <span class="tag-val">${label || '⌖'}</span>
      </div>
    `,
    iconSize: [38, 46],
    iconAnchor: [19, 42],
    popupAnchor: [0, -40],
  });

/**
 * Visited cafe pin: Warm Cream and Bark Brown with coffee icon & visit count badge
 */
export const visitedPinIcon = (visitCount = 1, rating = 0) =>
  L.divIcon({
    className: 'oryzo-pin-wrap',
    html: `
      <div class="oryzo-pin">
        <span class="reticle" style="background-color: #382416; border-color: #ffedd7;">
          <span style="font-size: 11px;">☕</span>
        </span>
        <span class="dot" style="display: none;"></span>
        <span class="tag-val" style="background-color: #100904; border-color: #40372e; color: #ffedd7;">
          ${visitCount > 1 ? `${visitCount}x Mampir` : `★ ${(rating || 4).toFixed(1)}`}
        </span>
      </div>
    `,
    iconSize: [44, 46],
    iconAnchor: [22, 42],
    popupAnchor: [0, -40],
  });

/**
 * Wishlist cafe pin: Glowing Amber Star with dashed border
 */
export const wishlistPinIcon = () =>
  L.divIcon({
    className: 'oryzo-pin-wrap',
    html: `
      <div class="oryzo-pin target-draft">
        <span class="reticle" style="background-color: #2b1a0a; border: 2px dashed #f59e0b;">
          <span style="font-size: 11px; color: #fbbf24;">★</span>
        </span>
        <span class="dot" style="background-color: #f59e0b;"></span>
        <span class="tag-val" style="background-color: #2b1a0a; color: #fde68a; border-color: #d97706;">
          WISHLIST
        </span>
      </div>
    `,
    iconSize: [48, 46],
    iconAnchor: [24, 42],
    popupAnchor: [0, -40],
  });

/**
 * Nearby ghost cafe pin from OpenStreetMap
 */
export const ghostCafePinIcon = () =>
  L.divIcon({
    className: 'oryzo-pin-wrap',
    html: `
      <div class="oryzo-pin" style="opacity: 0.75;">
        <span class="reticle" style="background-color: #180f08; border-color: #6c5f51; width: 18px; height: 18px;">
          <span style="font-size: 9px;">☕</span>
        </span>
      </div>
    `,
    iconSize: [24, 30],
    iconAnchor: [12, 28],
    popupAnchor: [0, -26],
  });
