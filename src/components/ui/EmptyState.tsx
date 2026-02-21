/**
 * EmptyState — shown when a list has no items.
 * Provides a friendly message and optional action button.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme";

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function EmptyState({ emoji, title, subtitle, children }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      {children && <View style={styles.action}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  action: {
    marginTop: 24,
  },
});
