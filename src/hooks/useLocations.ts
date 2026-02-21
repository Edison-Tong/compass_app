/**
 * useLocations — hook for location CRUD operations.
 *
 * This is the ONLY way components interact with location data.
 * It delegates to LocationService, which delegates to StorageAdapter.
 *
 * The hook manages loading/error state and provides a refresh function
 * so screens can re-fetch after mutations.
 */

import { useState, useEffect, useCallback } from "react";
import { SavedLocation } from "../models/types";
import { getLocationService, CreateLocationInput, UpdateLocationInput } from "../services/location-service";

interface UseLocationsReturn {
  locations: SavedLocation[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createLocation: (input: CreateLocationInput) => Promise<SavedLocation>;
  updateLocation: (id: string, input: UpdateLocationInput) => Promise<SavedLocation | null>;
  deleteLocation: (id: string) => Promise<void>;
}

export function useLocations(): UseLocationsReturn {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service = getLocationService();

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await service.getAll();
      setLocations(data);
    } catch (err) {
      setError("Failed to load locations");
      console.error("[useLocations] refresh failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createLocation = useCallback(
    async (input: CreateLocationInput) => {
      const location = await service.create(input);
      await refresh();
      return location;
    },
    [refresh]
  );

  const updateLocation = useCallback(
    async (id: string, input: UpdateLocationInput) => {
      const updated = await service.update(id, input);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const deleteLocation = useCallback(
    async (id: string) => {
      await service.delete(id);
      await refresh();
    },
    [refresh]
  );

  return {
    locations,
    isLoading,
    error,
    refresh,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}
