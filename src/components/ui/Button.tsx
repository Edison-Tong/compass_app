/**
 * Button — primary action button with loading state.
 *
 * Variants:
 * - 'primary': filled accent color
 * - 'secondary': outlined
 * - 'danger': red for destructive actions
 */

import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "../../theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors } = useTheme();

  const buttonStyles: ViewStyle[] = [styles.base];
  const textStyles: TextStyle[] = [styles.text];

  switch (variant) {
    case "primary":
      buttonStyles.push({ backgroundColor: colors.primary });
      textStyles.push({ color: "#FFFFFF" });
      break;
    case "secondary":
      buttonStyles.push({
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: colors.primary,
      });
      textStyles.push({ color: colors.primary });
      break;
    case "danger":
      buttonStyles.push({ backgroundColor: colors.danger });
      textStyles.push({ color: "#FFFFFF" });
      break;
  }

  if (disabled || isLoading) {
    buttonStyles.push({ opacity: 0.5 });
  }

  return (
    <TouchableOpacity
      style={[...buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "secondary" ? colors.primary : "#FFFFFF"} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
