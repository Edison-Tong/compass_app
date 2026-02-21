/**
 * LocalStorageAdapter — AsyncStorage implementation of StorageAdapter.
 *
 * This is the ONLY file in the entire project that imports AsyncStorage.
 * All other code accesses storage through the StorageAdapter interface.
 *
 * Collections are stored as JSON arrays under a single key.
 * This is simple and works well for small datasets (< 1000 items).
 * For v2, a cloud adapter would replace array-in-a-key with proper DB calls.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageAdapter } from "../storage";

export class LocalStorageAdapter implements StorageAdapter {
  async getAll<T>(collection: string): Promise<T[]> {
    try {
      const raw = await AsyncStorage.getItem(collection);
      if (!raw) return [];
      return JSON.parse(raw) as T[];
    } catch (error) {
      console.error(`[LocalStorage] getAll("${collection}") failed:`, error);
      return [];
    }
  }

  async getById<T extends { id: string }>(collection: string, id: string): Promise<T | null> {
    const items = await this.getAll<T>(collection);
    return items.find((item) => item.id === id) ?? null;
  }

  async save<T extends { id: string }>(collection: string, item: T): Promise<void> {
    const items = await this.getAll<T>(collection);
    const index = items.findIndex((existing) => existing.id === item.id);

    if (index >= 0) {
      // Update existing
      items[index] = item;
    } else {
      // Insert new
      items.push(item);
    }

    await AsyncStorage.setItem(collection, JSON.stringify(items));
  }

  async delete(collection: string, id: string): Promise<void> {
    const items = await this.getAll<{ id: string }>(collection);
    const filtered = items.filter((item) => item.id !== id);
    await AsyncStorage.setItem(collection, JSON.stringify(filtered));
  }

  async getValue<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`[LocalStorage] getValue("${key}") failed:`, error);
      return null;
    }
  }

  async setValue<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }
}
