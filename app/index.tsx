/**
 * CompassScreen — the heart of Love Compass.
 *
 * Renders a real-time compass that always points toward the selected
 * saved location, with live distance display.
 *
 * Data flow:
 *   expo-location heading → useCompass (smoothing) → useBearing (needle angle)
 *   expo-location GPS     → useBearing (distance + bearing)
 *   SettingsContext        → selected location ID
 *   LocationService        → selected location coordinates
 *
 * Performance notes:
 * - Heading sensor fires ~60Hz; we throttle React state updates to ~10Hz
 *   via RENDER_INTERVAL_MS in useCompass.
 * - Needle and rose animations run on the native UI thread via Reanimated
 *   shared values — zero JS bridge traffic during animation.
 * - GPS is watched with a 10m distance filter to limit battery drain.
 * - All trig math is in src/utils/geo.ts — pure functions, easily testable.
 *
 * Offline: works fully offline. All data is local, all sensors are on-device.
 */

import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useFocusEffect } from "expo-router";
import { ScreenWrapper } from "../src/components/ui/ScreenWrapper";
import { EmptyState } from "../src/components/ui/EmptyState";
import { CompassRose } from "../src/components/compass/CompassRose";
import { CompassNeedle } from "../src/components/compass/CompassNeedle";
import { DistanceBadge } from "../src/components/compass/DistanceBadge";
import { CalibrationBanner } from "../src/components/compass/CalibrationBanner";
import { useBearing } from "../src/hooks/useBearing";
import { useTheme } from "../src/theme";
import { SavedLocation } from "../src/models/types";
import { getLocationService } from "../src/services/location-service";
import { useAppSettings } from "./_layout";

// Compass size scales to screen width with comfortable margins
const SCREEN_WIDTH = Dimensions.get("window").width;
const COMPASS_SIZE = Math.min(SCREEN_WIDTH - 64, 320);

export default function CompassScreen() {
  const { colors } = useTheme();
  const { settings } = useAppSettings();
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calibrationDismissed, setCalibrationDismissed] = useState(false);

  // Bearing hook — receives target coords, returns needle angle + distance
  const targetCoord = selectedLocation
    ? { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }
    : null;
  const { needleAngle, distanceKm, compass, isLoadingGPS } = useBearing(targetCoord);

  // Reload selected location every time screen comes into focus
  // or when the selected location ID changes
  useFocusEffect(
    useCallback(() => {
      loadSelectedLocation();
    }, [settings.selectedLocationId])
  );

  const loadSelectedLocation = async () => {
    try {
      setIsLoading(true);
      if (settings.selectedLocationId) {
        const location = await getLocationService().getById(settings.selectedLocationId);
        setSelectedLocation(location);
      } else {
        setSelectedLocation(null);
      }
    } catch (err) {
      console.error("[CompassScreen] Failed to load selected location:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Loading state ---
  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // --- No location selected ---
  if (!selectedLocation) {
    return (
      <ScreenWrapper>
        <EmptyState
          emoji="🧭"
          title="No location selected"
          subtitle="Go to the Locations tab and select a place to point toward."
        />
      </ScreenWrapper>
    );
  }

  // --- Compass heading error ---
  if (compass.error) {
    return (
      <ScreenWrapper>
        <EmptyState emoji="⚠️" title="Compass unavailable" subtitle={compass.error} />
      </ScreenWrapper>
    );
  }

  // --- Main compass view ---
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Calibration banner */}
        <CalibrationBanner
          visible={compass.needsCalibration && !calibrationDismissed}
          onDismiss={() => setCalibrationDismissed(true)}
        />

        {/* Header: selected location info */}
        <View style={styles.header}>
          <Text style={styles.locationEmoji}>{selectedLocation.emoji}</Text>
          <Text style={[styles.locationName, { color: colors.text }]}>{selectedLocation.name}</Text>
        </View>

        {/* Compass: rose + needle layered on top of each other */}
        <View style={styles.compassContainer}>
          <View style={[styles.compassWrapper, { width: COMPASS_SIZE, height: COMPASS_SIZE }]}>
            {/* Rose rotates to keep N pointing north */}
            <CompassRose heading={compass.heading} size={COMPASS_SIZE} />

            {/* Needle points toward the target location */}
            <View style={styles.needleOverlay}>
              <CompassNeedle angle={needleAngle} size={COMPASS_SIZE} />
            </View>
          </View>
        </View>

        {/* Distance badge */}
        <DistanceBadge distanceKm={distanceKm} unit={settings.distanceUnit} isLoading={isLoadingGPS} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  header: {
    alignItems: "center",
    paddingTop: 4,
  },
  locationEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  locationName: {
    fontSize: 20,
    fontWeight: "700",
  },
  compassContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  compassWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  needleOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
