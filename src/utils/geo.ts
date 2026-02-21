/**
 * Geographic utility functions.
 *
 * Haversine formula for distance and initial bearing calculation.
 * These are pure functions with no side effects — easy to test.
 */

import { EARTH_RADIUS_KM, KM_TO_MI } from "../constants";

/**
 * Calculate the great-circle distance between two points using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate the initial bearing from point 1 to point 2.
 * Returns bearing in degrees (0-360, where 0 = north).
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Convert km to miles.
 */
export function kmToMiles(km: number): number {
  return km * KM_TO_MI;
}

// ---------------------------------------------------------------------------
// Angular math helpers — used by compass smoothing
// ---------------------------------------------------------------------------

/**
 * Normalise any angle to the range [0, 360).
 */
export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Compute the shortest signed angular difference from `from` to `to`.
 * Result is in the range (-180, 180].
 *
 * Positive = clockwise, negative = counter-clockwise.
 * This prevents the needle from spinning the long way around
 * when crossing the 0°/360° boundary.
 */
export function shortestAngleDelta(from: number, to: number): number {
  const diff = normalizeAngle(to) - normalizeAngle(from);
  if (diff > 180) return diff - 360;
  if (diff <= -180) return diff + 360;
  return diff;
}

/**
 * Low-pass (exponential moving average) filter for heading values.
 * `alpha` controls smoothing: 0 = ignore new value, 1 = no smoothing.
 * Operates in angular space to handle the 0°/360° wraparound correctly.
 */
export function smoothHeading(current: number, target: number, alpha: number): number {
  const delta = shortestAngleDelta(current, target);
  return normalizeAngle(current + delta * alpha);
}
