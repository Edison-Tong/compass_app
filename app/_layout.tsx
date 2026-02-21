/**
 * Root layout — sets up providers and tab navigation.
 *
 * Architecture:
 * - SettingsContext is created at root level so every screen can read/update settings
 * - ThemeProvider wraps tabs and reacts to darkMode changes in real time
 * - Each tab can have its own stack for sub-screens
 *
 * We use a React Context for settings so the ThemeProvider re-renders
 * immediately when the user changes appearance in the Settings screen.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "../src/theme";
import { UserSettings, DEFAULT_SETTINGS } from "../src/models/types";
import { getSettingsService } from "../src/services/settings-service";

// ---------------------------------------------------------------------------
// Settings Context — shared across the entire app
// ---------------------------------------------------------------------------
interface SettingsContextValue {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  selectLocation: (id: string | null) => Promise<void>;
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  selectLocation: async () => {},
  reload: async () => {},
});

/** Hook for screens to access the global settings */
export function useAppSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}

// ---------------------------------------------------------------------------
// Tab layout — has access to theme
// ---------------------------------------------------------------------------
function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.iconActive,
          tabBarInactiveTintColor: colors.icon,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Compass",
            tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="locations"
          options={{
            title: "Locations",
            tabBarIcon: ({ color, size }) => <Ionicons name="location-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

// ---------------------------------------------------------------------------
// Root layout — loads settings, provides context, wraps with ThemeProvider
// ---------------------------------------------------------------------------
export default function RootLayout() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const service = getSettingsService();

  const reload = useCallback(async () => {
    const data = await service.get();
    setSettings(data);
  }, []);

  useEffect(() => {
    reload().catch(() => setSettings(DEFAULT_SETTINGS));
  }, [reload]);

  const updateSettings = useCallback(async (partial: Partial<UserSettings>) => {
    const updated = await service.update(partial);
    setSettings(updated);
  }, []);

  const selectLocation = useCallback(async (id: string | null) => {
    await service.setSelectedLocationId(id);
    setSettings((prev) => (prev ? { ...prev, selectedLocationId: id } : prev));
  }, []);

  // Show loading spinner until settings are loaded
  if (!settings) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, selectLocation, reload }}>
      <ThemeProvider darkModePreference={settings.darkMode}>
        <TabLayout />
      </ThemeProvider>
    </SettingsContext.Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
