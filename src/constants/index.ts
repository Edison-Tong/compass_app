/**
 * Constants used throughout the app.
 *
 * Centralising keys and defaults here prevents typos and makes it easy
 * to find every storage key in the project.
 */

// AsyncStorage keys (used only inside adapters — never in components)
export const STORAGE_KEYS = {
  LOCATIONS: "@love_compass/locations",
  SETTINGS: "@love_compass/settings",
} as const;

// Default emoji for new locations when user doesn't pick one
export const DEFAULT_EMOJI = "📍";

// Earth radius in km (for Haversine distance calculations)
export const EARTH_RADIUS_KM = 6371;

// Conversion factor
export const KM_TO_MI = 0.621371;
