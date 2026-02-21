/**
 * LocationService — business logic for managing saved locations.
 *
 * This is the layer between UI hooks and the storage adapter.
 * It handles:
 * - ID generation (UUID)
 * - Timestamp management
 * - Data validation
 * - Collection key encapsulation
 *
 * Components never call the storage adapter directly.
 * They use the useLocations hook, which calls this service.
 */

import * as Crypto from "expo-crypto";
import { SavedLocation, LocationSource } from "../models/types";
import { StorageAdapter } from "./storage";
import { getStorageAdapter } from "./storage-factory";
import { STORAGE_KEYS, DEFAULT_EMOJI } from "../constants";

// Input type for creating a new location (no id/timestamps — we generate those)
export interface CreateLocationInput {
  name: string;
  emoji?: string;
  latitude: number;
  longitude: number;
  source: LocationSource;
}

// Input type for updating an existing location
export interface UpdateLocationInput {
  name?: string;
  emoji?: string;
}

class LocationService {
  private adapter: StorageAdapter;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  /**
   * Get all saved locations, sorted by most recently created.
   */
  async getAll(): Promise<SavedLocation[]> {
    const locations = await this.adapter.getAll<SavedLocation>(STORAGE_KEYS.LOCATIONS);
    return locations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get a single location by ID.
   */
  async getById(id: string): Promise<SavedLocation | null> {
    return this.adapter.getById<SavedLocation>(STORAGE_KEYS.LOCATIONS, id);
  }

  /**
   * Create and persist a new location.
   * Generates a UUID and sets createdAt/updatedAt automatically.
   */
  async create(input: CreateLocationInput): Promise<SavedLocation> {
    const now = new Date().toISOString();
    const location: SavedLocation = {
      id: Crypto.randomUUID(),
      name: input.name.trim(),
      emoji: input.emoji || DEFAULT_EMOJI,
      latitude: input.latitude,
      longitude: input.longitude,
      source: input.source,
      createdAt: now,
      updatedAt: now,
    };

    await this.adapter.save(STORAGE_KEYS.LOCATIONS, location);
    return location;
  }

  /**
   * Update an existing location's mutable fields.
   * Only name and emoji can be changed — coordinates are immutable.
   */
  async update(id: string, input: UpdateLocationInput): Promise<SavedLocation | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated: SavedLocation = {
      ...existing,
      name: input.name?.trim() ?? existing.name,
      emoji: input.emoji ?? existing.emoji,
      updatedAt: new Date().toISOString(),
    };

    await this.adapter.save(STORAGE_KEYS.LOCATIONS, updated);
    return updated;
  }

  /**
   * Delete a location by ID.
   */
  async delete(id: string): Promise<void> {
    await this.adapter.delete(STORAGE_KEYS.LOCATIONS, id);
  }
}

// Singleton instance — all hooks share the same service
let serviceInstance: LocationService | null = null;

export function getLocationService(): LocationService {
  if (!serviceInstance) {
    serviceInstance = new LocationService(getStorageAdapter());
  }
  return serviceInstance;
}
