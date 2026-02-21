/**
 * CloudStorageAdapter — placeholder for v2.
 *
 * This file exists so the architecture is visible from day one.
 * When you're ready to add a backend (Supabase, Firebase, custom API),
 * implement each method here and switch the factory.
 *
 * A real v2 might also create a SyncAdapter that composes local + cloud
 * for true offline-first with background sync.
 */

import { StorageAdapter } from "../storage";

export class CloudStorageAdapter implements StorageAdapter {
  async getAll<T>(_collection: string): Promise<T[]> {
    throw new Error("CloudStorageAdapter is not implemented yet. Coming in v2.");
  }

  async getById<T extends { id: string }>(_collection: string, _id: string): Promise<T | null> {
    throw new Error("CloudStorageAdapter is not implemented yet. Coming in v2.");
  }

  async save<T extends { id: string }>(_collection: string, _item: T): Promise<void> {
    throw new Error("CloudStorageAdapter is not implemented yet. Coming in v2.");
  }

  async delete(_collection: string, _id: string): Promise<void> {
    throw new Error("CloudStorageAdapter is not implemented yet. Coming in v2.");
  }

  async getValue<T>(_key: string): Promise<T | null> {
    throw new Error("CloudStorageAdapter is not implemented yet. Coming in v2.");
  }

  async setValue<T>(_key: string, _value: T): Promise<void> {
    throw new Error("CloudStorageAdapter is not implemented yet. Coming in v2.");
  }
}
