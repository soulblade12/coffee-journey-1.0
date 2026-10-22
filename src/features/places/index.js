import { getNearbyCafesOSM, searchCafesPhoton } from './osmPlaces';
import { searchCafesGoogle, fetchLivePlaceDetails, resetSessionToken } from './googlePlaces';
import { reverse } from '@/shared/lib/geo';

/**
 * Unified Places Search & Discovery
 */

/**
 * Search cafes by query: tries Google Places first if configured, falls back to Photon (OSM)
 */
export async function searchCafes(query, lat, lng) {
  // 1. Try Google Places if configured
  const googleResults = await searchCafesGoogle(query, lat, lng);
  if (Array.isArray(googleResults) && googleResults.length > 0) {
    return {
      results: googleResults,
      source: 'google',
      attribution: 'Powered by Google',
    };
  }

  // 2. Fall back to OSM Photon
  const osmResults = await searchCafesPhoton(query, lat, lng);
  return {
    results: osmResults,
    source: 'osm',
    attribution: '© OpenStreetMap contributors',
  };
}

/**
 * Get nearby cafes around a tapped coordinate using Overpass API
 */
export async function getNearbyCafes(lat, lng, radius = 350) {
  const list = await getNearbyCafesOSM(lat, lng, radius);
  return {
    results: list,
    source: 'osm',
    attribution: '© OpenStreetMap contributors',
  };
}

/**
 * Reverse geocode area name from coordinates
 */
export async function getAreaFromCoords(lat, lng) {
  return reverse(lat, lng);
}

export { fetchLivePlaceDetails, resetSessionToken };
