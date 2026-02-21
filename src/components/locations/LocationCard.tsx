/**
 * LocationCard — list item for a saved location.
 *
 * Shows emoji, name, coordinates, and a selected indicator.
 * Tapping selects the location; long-press or swipe could delete (future).
 */

import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SavedLocation } from "../../models/types";
import { useTheme } from "../../theme";

interface LocationCardProps {
  location: SavedLocation;
  isSelected: boolean;
  onPress: () => void;
  onDelete: () => void;
  onShare?: () => void;
}

export function LocationCard({ location, isSelected, onPress, onDelete, onShare }: LocationCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <Text style={styles.emoji}>{location.emoji}</Text>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {location.name}
          </Text>
          <Text style={[styles.coords, { color: colors.textSecondary }]}>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        {isSelected && <Ionicons name="heart" size={20} color={colors.primary} style={styles.selectedIcon} />}
        {onShare && (
          <TouchableOpacity onPress={onShare} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="qr-code-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="trash-outline" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  emoji: {
    fontSize: 28,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  coords: {
    fontSize: 13,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectedIcon: {
    marginRight: 4,
  },
});
