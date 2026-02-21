/**
 * AddLocationScreen — choose how to add a new location.
 *
 * Two paths:
 * 1. "Use Current Location" — saves GPS coordinates immediately
 * 2. "Pick on Map" — navigates to MapPickerScreen
 *
 * After saving, the user is navigated back to the locations list.
 */

import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { Button } from "../../src/components/ui/Button";
import { useLocations } from "../../src/hooks/useLocations";
import { useCurrentLocation } from "../../src/hooks/useCurrentLocation";
import { useTheme } from "../../src/theme";
import { useAppSettings } from "../_layout";

export default function AddLocationScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { createLocation } = useLocations();
  const { selectLocation } = useAppSettings();
  const { location: gpsLocation, isLoading: gpsLoading, error: gpsError } = useCurrentLocation();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGPS = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a name for this location.");
      return;
    }
    if (!gpsLocation) {
      Alert.alert("No GPS", gpsError || "Waiting for GPS fix...");
      return;
    }

    try {
      setIsSaving(true);
      const saved = await createLocation({
        name: name.trim(),
        emoji: emoji || undefined,
        latitude: gpsLocation.latitude,
        longitude: gpsLocation.longitude,
        source: "gps",
      });
      // Auto-select the newly created location
      await selectLocation(saved.id);
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to save location.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickOnMap = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a name before picking on the map.");
      return;
    }
    // Pass name and emoji as query params to the map picker
    router.push({
      pathname: "/locations/map-picker",
      params: { name: name.trim(), emoji: emoji || "" },
    });
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Name input */}
          <Text style={[styles.label, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Mom's house, Beach spot..."
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          {/* Emoji input */}
          <Text style={[styles.label, { color: colors.text }]}>Emoji (optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.emojiInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="🏠"
            placeholderTextColor={colors.textTertiary}
            value={emoji}
            onChangeText={(text) => setEmoji(text.slice(0, 2))} // Limit to one emoji
          />

          {/* GPS location status */}
          <View style={[styles.gpsStatus, { backgroundColor: colors.surface }]}>
            <Text style={[styles.gpsLabel, { color: colors.textSecondary }]}>
              {gpsLoading
                ? "📡 Getting GPS fix..."
                : gpsError
                  ? `⚠️ ${gpsError}`
                  : `📍 ${gpsLocation?.latitude.toFixed(4)}, ${gpsLocation?.longitude.toFixed(4)}`}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.buttons}>
            <Button
              title="Use Current Location"
              onPress={handleSaveGPS}
              isLoading={isSaving}
              disabled={!name.trim() || !gpsLocation}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button title="Pick on Map" variant="secondary" onPress={handlePickOnMap} disabled={!name.trim()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  emojiInput: {
    width: 80,
    textAlign: "center",
    fontSize: 24,
  },
  gpsStatus: {
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  gpsLabel: {
    fontSize: 14,
  },
  buttons: {
    marginTop: 32,
    gap: 0,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
});
