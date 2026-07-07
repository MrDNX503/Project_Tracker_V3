// ============================================================
// KashFinance Project Tracker V3 — Database Module Barrel Export
// ============================================================
// This is the MAIN entry point for the rest of the app.
// It creates a Comlink-wrapped proxy to the database worker.
// ============================================================

import * as Comlink from 'comlink';
import type { DatabaseAPI } from './types';

export type * from './types';

let dbProxy: Comlink.Remote<DatabaseAPI> | null = null;
let worker: Worker | null = null;

/**
 * Get (or create) the database proxy.
 * The first call spins up the Web Worker and initializes the DB.
 * Subsequent calls return the same proxy.
 */
export async function getDB(): Promise<Comlink.Remote<DatabaseAPI>> {
  if (dbProxy) return dbProxy;

  worker = new Worker(
    new URL('./db.worker.ts', import.meta.url),
    { type: 'module', name: 'kashfinance-db' },
  );

  dbProxy = Comlink.wrap<DatabaseAPI>(worker);

  // Initialize the database inside the worker
  await dbProxy.init();

  return dbProxy;
}

/**
 * Shut down the database worker cleanly.
 */
export async function closeDB(): Promise<void> {
  if (dbProxy) {
    await dbProxy.close();
    dbProxy = null;
  }
  if (worker) {
    worker.terminate();
    worker = null;
  }
}

/**
 * Check if the database is currently available.
 */
export function isDBReady(): boolean {
  return dbProxy !== null;
}
