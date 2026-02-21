/**
 * Color palettes for light and dark themes.
 *
 * Every color used in the app comes from here — no hardcoded
 * hex values in component styles. This makes dark mode consistent
 * and future theme changes a single-file edit.
 */

export const lightColors = {
  background: "#FFFFFF",
  surface: "#F5F5F7",
  surfacePressed: "#E8E8ED",
  text: "#1C1C1E",
  textSecondary: "#8E8E93",
  textTertiary: "#AEAEB2",
  primary: "#E85D75", // Rose / love-themed accent
  primaryLight: "#FDEEF1",
  danger: "#FF3B30",
  dangerLight: "#FFF0EF",
  border: "#E5E5EA",
  cardBackground: "#FFFFFF",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E5E5EA",
  icon: "#8E8E93",
  iconActive: "#E85D75",
  compass: {
    face: "#FFFFFF",
    ring: "#E5E5EA",
    needle: "#E85D75",
    needleSecondary: "#C4C4C6",
    text: "#1C1C1E",
  },
};

export const darkColors = {
  background: "#000000",
  surface: "#1C1C1E",
  surfacePressed: "#2C2C2E",
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#636366",
  primary: "#E85D75",
  primaryLight: "#3A1A22",
  danger: "#FF453A",
  dangerLight: "#3A1515",
  border: "#38383A",
  cardBackground: "#1C1C1E",
  tabBar: "#1C1C1E",
  tabBarBorder: "#38383A",
  icon: "#8E8E93",
  iconActive: "#E85D75",
  compass: {
    face: "#1C1C1E",
    ring: "#38383A",
    needle: "#E85D75",
    needleSecondary: "#636366",
    text: "#FFFFFF",
  },
};

export type AppColors = typeof lightColors;
