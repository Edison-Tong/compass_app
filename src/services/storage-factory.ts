/**
 * Storage factory — single place to choose which adapter the app uses.
 *
 * To switch from local to cloud storage in v2, change the adapter
 * instantiated here. Every service in the app uses this singleton,
 * so the swap propagates everywhere with zero UI changes.
 */

import { StorageAdapter } from "./storage";
import { LocalStorageAdapter } from "./adapters/local";
// import { CloudStorageAdapter } from './adapters/cloud'; // Uncomment in v2

// Singleton adapter instance — created once, shared across all services
let adapterInstance: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!adapterInstance) {
    // v1: local only
    adapterInstance = new LocalStorageAdapter();

    // v2: swap to cloud
    // adapterInstance = new CloudStorageAdapter();
  }
  return adapterInstance;
}
