/**
 * Application environment configuration & feature flags
 */
export const ENV = {
  GOOGLE_MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  HAS_GOOGLE_PLACES: Boolean(import.meta.env.VITE_GOOGLE_MAPS_KEY),
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
};
