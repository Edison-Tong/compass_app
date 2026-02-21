/**
 * StorageAdapter — the abstraction boundary between business logic and persistence.
 *
 * Architecture decision:
 * Every piece of data in the app flows through this interface. Components and hooks
 * never import AsyncStorage (or any future cloud SDK) directly. This means:
 *
 * 1. The LocalAdapter (v1) can be swapped for a CloudAdapter (v2) by changing one
 *    line in the factory — zero UI changes required.
 * 2. A SyncAdapter could compose both local + cloud for offline-first with sync.
 * 3. Unit tests can use an InMemoryAdapter without mocking AsyncStorage.
 *
 * The adapter operates on opaque JSON-serialisable values keyed by collection name.
 * The business-logic services (LocationService, SettingsService) handle typing.
 */

export interface StorageAdapter {
  /**
   * Retrieve all items from a named collection.
   * Returns an empty array if the collection doesn't exist yet.
   */
  getAll<T>(collection: string): Promise<T[]>;

  /**
   * Retrieve a single item by id from a collection.
   * Returns null if not found.
   */
  getById<T extends { id: string }>(collection: string, id: string): Promise<T | null>;

  /**
   * Insert or update an item in a collection.
   * If an item with the same `id` exists, it is replaced.
   */
  save<T extends { id: string }>(collection: string, item: T): Promise<void>;

  /**
   * Remove an item by id from a collection.
   * No-op if the item doesn't exist.
   */
  delete(collection: string, id: string): Promise<void>;

  /**
   * Read a single value by key (for non-collection data like settings).
   */
  getValue<T>(key: string): Promise<T | null>;

  /**
   * Write a single value by key.
   */
  setValue<T>(key: string, value: T): Promise<void>;
}
