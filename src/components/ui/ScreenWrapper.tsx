/**
 * ScreenWrapper — consistent screen layout with safe area handling.
 *
 * Every screen wraps its content in this component so we get
 * consistent padding, background color, and safe area insets.
 */

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** If true, adds horizontal padding. Default: true */
  padded?: boolean;
}

export function ScreenWrapper({ children, style, padded = true }: ScreenWrapperProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 20,
  },
});
