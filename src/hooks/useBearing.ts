/**
 * useBearing — combines device heading + GPS to compute the needle angle.
 *
 * The needle should point toward the target location. To do this:
 *   needleAngle = bearingToTarget − deviceHeading
 *
 * When needleAngle is 0 the user is facing directly toward the target.
 *
 * This hook also computes the Haversine distance so the compass screen
 * can display how far away the target is.
 *
 * Performance considerations:
 * - GPS is watched with Balanced accuracy + 10m distance filter to limit
 *   battery-draining high-frequency updates.
 * - The bearing and distance are only recalculated when either the user
 *   position or device heading actually changes (via the hook deps).
 * - All heavy math lives in src/utils/geo.ts — this hook is just wiring.
 */

import { useState, useEffect, useMemo, useRef } from "react";
import * as Location from "expo-location";
import { useCompass, CompassState } from "./useCompass";
import { calculateBearing, haversineDistance, normalizeAngle } from "../utils/geo";

interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface BearingState {
  /** Angle the needle should point (0 = straight up = toward target). */
  needleAngle: number;
  /** Bearing from user to target in absolute degrees (0 = north). */
  bearingToTarget: number;
  /** Distance to target in kilometers. */
  distanceKm: number;
  /** User's current GPS position, or null if not yet available. */
  userLocation: Coordinate | null;
  /** All compass/heading data from the device sensor. */
  compass: CompassState;
  /** True while waiting for first GPS fix. */
  isLoadingGPS: boolean;
  /** GPS error message. */
  gpsError: string | null;
}

/** Minimum distance (meters) the user must move before we update position. */
const GPS_DISTANCE_FILTER_M = 10;

export function useBearing(target: Coordinate | null): BearingState {
  const compass = useCompass();

  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Watch user's GPS position with a distance filter for battery efficiency
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const start = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setGpsError("Location permission denied");
          setIsLoadingGPS(false);
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: GPS_DISTANCE_FILTER_M,
          },
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setIsLoadingGPS(false);
          }
        );
      } catch (err) {
        console.error("[useBearing] GPS watch failed:", err);
        setGpsError("Failed to get GPS position");
        setIsLoadingGPS(false);
      }
    };

    start();

    return () => {
      subscription?.remove();
    };
  }, []);

  // Derived values — recalculated when heading or positions change
  const bearingToTarget = useMemo(() => {
    if (!userLocation || !target) return 0;
    return calculateBearing(userLocation.latitude, userLocation.longitude, target.latitude, target.longitude);
  }, [userLocation, target]);

  const distanceKm = useMemo(() => {
    if (!userLocation || !target) return 0;
    return haversineDistance(userLocation.latitude, userLocation.longitude, target.latitude, target.longitude);
  }, [userLocation, target]);

  // Needle angle: how much to rotate the needle relative to screen-up.
  // bearingToTarget is absolute (relative to north).
  // Subtracting device heading makes it relative to where the phone is pointing.
  const needleAngle = useMemo(() => {
    if (!userLocation || !target) return 0;
    return normalizeAngle(bearingToTarget - compass.heading);
  }, [bearingToTarget, compass.heading, userLocation, target]);

  return {
    needleAngle,
    bearingToTarget,
    distanceKm,
    userLocation,
    compass,
    isLoadingGPS,
    gpsError,
  };
}
