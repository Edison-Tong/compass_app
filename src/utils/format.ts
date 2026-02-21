/**
 * Formatting utilities for display values.
 */

import { DistanceUnit } from "../models/types";
import { kmToMiles } from "./geo";

/**
 * Format a distance in km to a human-readable string with the appropriate unit.
 * Automatically switches between m/km or ft/mi for small distances.
 */
export function formatDistance(distanceKm: number, unit: DistanceUnit): string {
  if (unit === "mi") {
    const miles = kmToMiles(distanceKm);
    if (miles < 0.1) {
      const feet = Math.round(miles * 5280);
      return `${feet} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  }

  // Metric
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
