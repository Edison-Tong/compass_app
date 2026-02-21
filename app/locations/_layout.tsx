/**
 * Locations stack layout.
 *
 * Uses Expo Router's Stack to enable push navigation
 * within the Locations tab. Screens:
 * - index: saved locations list
 * - add: add a new location (GPS or map)
 * - map-picker: full-screen map for picking a coordinate
 */

import { Stack } from "expo-router";
import { useTheme } from "../../src/theme";

export default function LocationsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Saved Locations" }} />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Location",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="map-picker"
        options={{
          title: "Pick on Map",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
