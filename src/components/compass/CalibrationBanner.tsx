/**
 * CalibrationBanner — shown when the magnetometer needs calibration.
 *
 * On both iOS and Android, magnetometer accuracy degrades near
 * metal objects or after significant temperature changes.
 * The standard fix is to move the phone in a figure-8 motion.
 *
 * This banner is intentionally non-blocking — it sits at the top
 * of the compass screen and can be dismissed.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme";

interface CalibrationBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

export function CalibrationBanner({ visible, onDismiss }: CalibrationBannerProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryLight }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔄</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Calibrate compass</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Move your phone in a figure-8 motion
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
