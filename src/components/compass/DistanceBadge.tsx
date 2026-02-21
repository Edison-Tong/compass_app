/**
 * DistanceBadge — shows the formatted distance to the target location.
 *
 * Automatically switches display format based on magnitude:
 * - < 1 km  → shows in meters (e.g. "450 m")
 * - >= 1 km → shows in km with one decimal (e.g. "12.3 km")
 * - Miles mode: < 0.1 mi → feet, otherwise miles
 *
 * All formatting logic lives in src/utils/format.ts.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme";
import { DistanceUnit } from "../../models/types";
import { formatDistance } from "../../utils/format";

interface DistanceBadgeProps {
  /** Distance in kilometers. */
  distanceKm: number;
  /** User's preferred distance unit. */
  unit: DistanceUnit;
  /** True when GPS hasn't gotten a fix yet. */
  isLoading?: boolean;
}

export function DistanceBadge({ distanceKm, unit, isLoading }: DistanceBadgeProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.distance, { color: colors.text }]}>
        {isLoading ? "—" : formatDistance(distanceKm, unit)}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {isLoading ? "Getting GPS fix..." : "distance"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
  },
  distance: {
    fontSize: 32,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  label: {
    fontSize: 13,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
