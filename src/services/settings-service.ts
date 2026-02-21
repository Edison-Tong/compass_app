/**
 * SettingsService — manages user preferences.
 *
 * Settings are stored as a single JSON object under one key.
 * This keeps reads/writes atomic and avoids partial state.
 *
 * The service merges defaults with stored values so new settings
 * added in future versions get sensible defaults automatically.
 */

import { UserSettings, DEFAULT_SETTINGS } from "../models/types";
import { StorageAdapter } from "./storage";
import { getStorageAdapter } from "./storage-factory";
import { STORAGE_KEYS } from "../constants";

class SettingsService {
  private adapter: StorageAdapter;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  /**
   * Load settings, merging stored values with defaults.
   * This ensures new settings keys added in app updates
   * always have a valid default value.
   */
  async get(): Promise<UserSettings> {
    const stored = await this.adapter.getValue<Partial<UserSettings>>(STORAGE_KEYS.SETTINGS);
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  /**
   * Persist a partial settings update.
   * Merges with existing settings so callers don't need to send everything.
   */
  async update(partial: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.get();
    const updated = { ...current, ...partial };
    await this.adapter.setValue(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  /**
   * Convenience: get/set the currently selected location ID.
   */
  async getSelectedLocationId(): Promise<string | null> {
    const settings = await this.get();
    return settings.selectedLocationId;
  }

  async setSelectedLocationId(id: string | null): Promise<void> {
    await this.update({ selectedLocationId: id });
  }
}

// Singleton
let serviceInstance: SettingsService | null = null;

export function getSettingsService(): SettingsService {
  if (!serviceInstance) {
    serviceInstance = new SettingsService(getStorageAdapter());
  }
  return serviceInstance;
}
