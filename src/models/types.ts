/**
 * Core data models for Love Compass.
 *
 * Design decisions:
 * - All entities have `id` (UUID) and timestamps for future sync/conflict resolution.
 * - `source` tracks how a location was created, useful for analytics in v2.
 * - QR payload is versioned so the wire format can evolve without breaking old codes.
 * - UserSettings is a flat object stored as a single key for simplicity.
 */

// ---------------------------------------------------------------------------
// Primary entity — a saved meaningful location
// ---------------------------------------------------------------------------
export interface SavedLocation {
  id: string; // UUID v4, generated client-side
  name: string; // User-given name ("Mom's house")
  emoji: string; // Icon/emoji for display ("🏠")
  latitude: number;
  longitude: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  source: LocationSource; // How the location was created
}

export type LocationSource = "gps" | "map" | "qr";

// ---------------------------------------------------------------------------
// User preferences
// ---------------------------------------------------------------------------
export interface UserSettings {
  distanceUnit: DistanceUnit;
  darkMode: DarkModePreference;
  selectedLocationId: string | null;
}

export type DistanceUnit = "km" | "mi";
export type DarkModePreference = "system" | "light" | "dark";

export const DEFAULT_SETTINGS: UserSettings = {
  distanceUnit: "km",
  darkMode: "system",
  selectedLocationId: null,
};

// ---------------------------------------------------------------------------
// QR payload — what gets encoded into / decoded from a QR code
// ---------------------------------------------------------------------------
export interface QRLocationPayload {
  version: 1; // Schema version for forward compatibility
  name: string;
  emoji: string;
  latitude: number;
  longitude: number;
}
