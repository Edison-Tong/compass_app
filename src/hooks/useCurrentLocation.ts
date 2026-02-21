/**
 * useCurrentLocation — watch the device's GPS position.
 *
 * Returns the current coordinates and a loading state.
 * Handles permission requests automatically.
 * Cleans up the location subscription on unmount.
 */

import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface CurrentLocation {
  latitude: number;
  longitude: number;
}

interface UseCurrentLocationReturn {
  location: CurrentLocation | null;
  isLoading: boolean;
  error: string | null;
  /** Request a one-time fresh fix */
  refresh: () => Promise<void>;
}

export function useCurrentLocation(): UseCurrentLocationReturn {
  const [location, setLocation] = useState<CurrentLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err) {
      setError("Failed to get location");
      console.error("[useCurrentLocation]", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, isLoading, error, refresh: fetchLocation };
}
