/**
 * LocationsListScreen — shows all saved locations.
 *
 * Features:
 * - Tap a location to select it (compass will point to it)
 * - Delete locations
 * - FAB to add a new location
 * - Empty state when no locations are saved
 *
 * Data flow:
 * useLocations hook → LocationService → StorageAdapter → AsyncStorage
 * Component never touches AsyncStorage directly.
 */

import React, { useCallback } from "react";
import { FlatList, View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Button } from "../../src/components/ui/Button";
import { LocationCard } from "../../src/components/locations/LocationCard";
import { useLocations } from "../../src/hooks/useLocations";
import { useAppSettings } from "../_layout";
import { useTheme } from "../../src/theme";
import { SavedLocation } from "../../src/models/types";

export default function LocationsListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { locations, isLoading, refresh, deleteLocation } = useLocations();
  const { settings, selectLocation } = useAppSettings();

  // Refresh list when screen comes into focus (e.g. after adding a new location)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  const handleSelect = async (location: SavedLocation) => {
    await selectLocation(location.id);
  };

  const handleDelete = (location: SavedLocation) => {
    Alert.alert("Delete Location", `Remove "${location.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // If we're deleting the selected location, clear the selection
          if (settings.selectedLocationId === location.id) {
            await selectLocation(null);
          }
          await deleteLocation(location.id);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: SavedLocation }) => (
    <LocationCard
      location={item}
      isSelected={settings.selectedLocationId === item.id}
      onPress={() => handleSelect(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  if (!isLoading && locations.length === 0) {
    return (
      <ScreenWrapper>
        <EmptyState
          emoji="📍"
          title="No saved locations"
          subtitle="Add your first meaningful place to start pointing toward it."
        >
          <Button title="Add Location" onPress={() => router.push("/locations/add")} />
        </EmptyState>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating action button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/locations/add")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 12,
    paddingBottom: 80, // Space for FAB
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
