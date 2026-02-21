/**
 * ThemeProvider — supplies colors based on user's dark mode preference.
 *
 * Supports three modes:
 * - 'system': follows device appearance
 * - 'light': forced light
 * - 'dark': forced dark
 *
 * Every component uses useTheme() to get colors — never imports
 * lightColors/darkColors directly.
 */

import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { lightColors, darkColors, AppColors } from "./colors";
import { DarkModePreference } from "../models/types";

interface ThemeContextValue {
  colors: AppColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
});

interface ThemeProviderProps {
  darkModePreference: DarkModePreference;
  children: React.ReactNode;
}

export function ThemeProvider({ darkModePreference, children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (darkModePreference === "dark") return true;
    if (darkModePreference === "light") return false;
    return systemScheme === "dark";
  }, [darkModePreference, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access the current theme colors.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
