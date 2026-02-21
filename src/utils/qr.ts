/**
 * QR code encoding/decoding utilities.
 *
 * The QR payload is versioned so we can change the format in future
 * without breaking existing QR codes in the wild.
 *
 * Placeholder for now — will be fully implemented when QR feature is built.
 */

import { QRLocationPayload, SavedLocation } from "../models/types";

/**
 * Encode a saved location into a QR-ready JSON string.
 * Strips internal fields (id, timestamps) — receiver generates their own.
 */
export function encodeLocationToQR(location: SavedLocation): string {
  const payload: QRLocationPayload = {
    version: 1,
    name: location.name,
    emoji: location.emoji,
    latitude: location.latitude,
    longitude: location.longitude,
  };
  return JSON.stringify(payload);
}

/**
 * Decode a QR string back into a location payload.
 * Returns null if the data is invalid or version is unsupported.
 */
export function decodeQRToLocation(data: string): QRLocationPayload | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.version !== 1) return null;
    if (typeof parsed.name !== "string") return null;
    if (typeof parsed.latitude !== "number") return null;
    if (typeof parsed.longitude !== "number") return null;
    return parsed as QRLocationPayload;
  } catch {
    return null;
  }
}
