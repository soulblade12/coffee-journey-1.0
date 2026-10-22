import { ENV } from '@/config/env';

/**
 * Google Places API Integration (New API)
 * Strictly follows Google Maps Platform Terms of Service:
 * - NEVER renders Google Places markers on non-Google maps (Leaflet/Esri).
 * - Only displays places in text lists, sheets, and autocomplete drawers with "Powered by Google" branding.
 * - Stores only place_id in local storage; dynamic details are queried ephemerally.
 * - Minimal field masks to stay in lower cost tier.
 */

let sessionToken = null;

function getSessionToken() {
  if (!sessionToken) {
    sessionToken = 'session-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  return sessionToken;
}

export function resetSessionToken() {
  sessionToken = null;
}

/**
 * Autocomplete cafe search using Google Places API (New)
 * @param {string} query 
 * @param {number} [lat] 
 * @param {number} [lng] 
 * @returns {Promise<Array<{ id: string, name: string, area: string, source: string, providerName: string, placeId: string }> | null>}
 */
export async function searchCafesGoogle(query, lat, lng) {
  if (!ENV.GOOGLE_MAPS_KEY || !query || query.trim().length < 2) {
    return null;
  }

  try {
    const payload = {
      input: query,
      includedPrimaryTypes: ['cafe', 'coffee_shop'],
      sessionToken: getSessionToken(),
    };

    if (typeof lat === 'number' && typeof lng === 'number') {
      payload.locationBias = {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 5000.0, // 5km bias
        },
      };
    }

    const resp = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': ENV.GOOGLE_MAPS_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      console.warn('[Google Places] Autocomplete request failed:', resp.status);
      return null;
    }

    const data = await resp.json();
    if (!data.suggestions) return [];

    return data.suggestions
      .filter((s) => s.placePrediction)
      .map((s) => {
        const pred = s.placePrediction;
        return {
          id: `g-${pred.placeId}`,
          placeId: pred.placeId,
          name: pred.structuredFormat?.mainText?.text || pred.text?.text || '',
          area: pred.structuredFormat?.secondaryText?.text || '',
          source: 'google',
          providerName: 'Google Places',
        };
      });
  } catch (err) {
    console.warn('[Google Places] Error in autocomplete:', err);
    return null;
  }
}

/**
 * Fetch live place details (rating, open status, address) ephemerally
 * Never cached permanently to respect Google ToS
 */
export async function fetchLivePlaceDetails(placeId) {
  if (!ENV.GOOGLE_MAPS_KEY || !placeId) return null;

  try {
    const resp = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': ENV.GOOGLE_MAPS_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,regularOpeningHours,currentOpeningHours',
      },
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    return {
      placeId: data.id,
      name: data.displayName?.text,
      address: data.formattedAddress,
      rating: data.rating,
      userRatingCount: data.userRatingCount,
      isOpenNow: data.currentOpeningHours?.openNow,
      weekdayDescriptions: data.regularOpeningHours?.weekdayDescriptions || [],
      provider: 'Google',
    };
  } catch {
    return null;
  }
}
