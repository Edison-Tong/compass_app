/**
 * MapPickerScreen — pick a location by panning the map.
 *
 * Design:
 * - The map fills the screen
 * - A fixed pin is always centered on screen (it doesn't move — the map moves under it)
 * - User can pan/zoom to find a spot
 * - "Confirm" button saves the center coordinate
 *
 * The fixed-pin-on-center pattern avoids the problem of trying to
 * precisely tap a point on a map. It's much more intuitive.
 *
 * Google Places search bar will be added in a future iteration.
 */

import React, { useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Region } from "react-native-maps";
import { Button } from "../../src/components/ui/Button";
import { useTheme } from "../../src/theme";
import { useLocations } from "../../src/hooks/useLocations";
import { useAppSettings } from "../_layout";
import { useCurrentLocation } from "../../src/hooks/useCurrentLocation";

// Default to San Francisco if GPS isn't available yet
const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function MapPickerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { name, emoji } = useLocalSearchParams<{ name: string; emoji: string }>();
  const { createLocation } = useLocations();
  const { selectLocation } = useAppSettings();
  const { location: gpsLocation } = useCurrentLocation();

  const mapRef = useRef<MapView>(null);
  const [centerCoord, setCenterCoord] = useState<{ latitude: number; longitude: number }>({
    latitude: gpsLocation?.latitude ?? DEFAULT_REGION.latitude,
    longitude: gpsLocation?.longitude ?? DEFAULT_REGION.longitude,
  });
  const [isSaving, setIsSaving] = useState(false);

  const initialRegion: Region = {
    latitude: gpsLocation?.latitude ?? DEFAULT_REGION.latitude,
    longitude: gpsLocation?.longitude ?? DEFAULT_REGION.longitude,
    latitudeDelta: DEFAULT_REGION.latitudeDelta,
    longitudeDelta: DEFAULT_REGION.longitudeDelta,
  };

  const handleRegionChange = (region: Region) => {
    setCenterCoord({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  const handleConfirm = async () => {
    try {
      setIsSaving(true);
      const saved = await createLocation({
        name: name || "Unnamed Location",
        emoji: emoji || undefined,
        latitude: centerCoord.latitude,
        longitude: centerCoord.longitude,
        source: "map",
      });
      await selectLocation(saved.id);
      // Go back twice: map-picker → add → locations list
      router.dismiss(2);
    } catch (err) {
      console.error("[MapPicker] Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation
        showsMyLocationButton
      />

      {/* Fixed center pin — overlaid on top of the map */}
      <View style={styles.pinContainer} pointerEvents="none">
        <Text style={styles.pin}>📍</Text>
      </View>

      {/* Coordinate display */}
      <View style={[styles.coordBar, { backgroundColor: colors.surface }]}>
        <Text style={[styles.coordText, { color: colors.text }]}>
          {centerCoord.latitude.toFixed(6)}, {centerCoord.longitude.toFixed(6)}
        </Text>
      </View>

      {/* Confirm button */}
      <View style={styles.buttonContainer}>
        <Button title="Confirm Location" onPress={handleConfirm} isLoading={isSaving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pinContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    fontSize: 40,
    // Offset the pin so its tip (bottom) is at the center
    marginBottom: 40,
  },
  coordBar: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coordText: {
    fontSize: 13,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
});
