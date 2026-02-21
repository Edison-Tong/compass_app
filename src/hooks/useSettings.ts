/**
 * useSettings — hook for reading and updating user preferences.
 *
 * Provides the current settings and an update function.
 * The ThemeProvider reads darkMode from here to set the correct palette.
 */

import { useState, useEffect, useCallback } from "react";
import { UserSettings, DEFAULT_SETTINGS } from "../models/types";
import { getSettingsService } from "../services/settings-service";

interface UseSettingsReturn {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  selectLocation: (id: string | null) => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const service = getSettingsService();

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await service.get();
      setSettings(data);
    } catch (err) {
      console.error("[useSettings] load failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (partial: Partial<UserSettings>) => {
    const updated = await service.update(partial);
    setSettings(updated);
  }, []);

  const selectLocation = useCallback(async (id: string | null) => {
    await service.setSelectedLocationId(id);
    setSettings((prev) => ({ ...prev, selectedLocationId: id }));
  }, []);

  return { settings, isLoading, updateSettings, selectLocation };
}
