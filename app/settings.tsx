/**
 * SettingsScreen — user preferences.
 *
 * v1 settings:
 * - Distance unit toggle (km / mi)
 * - Dark mode preference (system / light / dark)
 *
 * All settings go through the SettingsService → StorageAdapter pipeline.
 * The dark mode change triggers a re-render of the ThemeProvider at the root.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWrapper } from "../src/components/ui/ScreenWrapper";
import { useAppSettings } from "./_layout";
import { useTheme } from "../src/theme";
import { DistanceUnit, DarkModePreference } from "../src/models/types";

type SegmentOption<T extends string> = { label: string; value: T };

function SegmentControl<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: SegmentOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.segmentContainer, { backgroundColor: colors.surface }]}>
      {options.map((option) => {
        const isActive = option.value === selected;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.segmentOption,
              isActive && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentText, { color: isActive ? "#FFFFFF" : colors.textSecondary }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const distanceOptions: SegmentOption<DistanceUnit>[] = [
  { label: "Kilometers", value: "km" },
  { label: "Miles", value: "mi" },
];

const darkModeOptions: SegmentOption<DarkModePreference>[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useAppSettings();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={[styles.heading, { color: colors.text }]}>Settings</Text>

        {/* Distance unit */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Distance Unit</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Choose how distances are displayed on the compass.
          </Text>
          <SegmentControl
            options={distanceOptions}
            selected={settings.distanceUnit}
            onSelect={(value) => updateSettings({ distanceUnit: value })}
          />
        </View>

        {/* Dark mode */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Choose your preferred color scheme.
          </Text>
          <SegmentControl
            options={darkModeOptions}
            selected={settings.darkMode}
            onSelect={(value) => updateSettings({ darkMode: value })}
          />
        </View>

        {/* App info */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>Love Compass v1.0.0</Text>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>Made with ❤️</Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 14,
  },
  segmentContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
  },
  segmentOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingBottom: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
  },
});
