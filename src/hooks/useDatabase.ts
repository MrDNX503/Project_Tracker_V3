// ============================================
// Database Connection Hook
// ============================================
// IMPORTANT: all queries run inside the Web Worker (via Comlink).
// This hook exposes the worker PROXY — never call the query
// functions from src/db/queries on the main thread.

import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { getDB } from '../db';

type WorkerDB = Awaited<ReturnType<typeof getDB>>;

let dbInstance: WorkerDB | null = null;

/**
 * Hook that provides access to the database layer (worker proxy)
 */
export function useDatabase() {
  const dbReady = useAppStore((s) => s.dbReady);
  const setDbReady = useAppStore((s) => s.setDbReady);
  const setDbError = useAppStore((s) => s.setDbError);

  const init = useCallback(async () => {
    if (dbInstance) return;

    try {
      const mod = await import('../db');
      dbInstance = await mod.getDB();
      setDbReady(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown DB error';
      console.error('Database initialization failed:', msg);
      setDbError(msg);
    }
  }, [setDbReady, setDbError]);

  useEffect(() => {
    init();
  }, [init]);

  return {
    dbReady,
    db: dbInstance,
  };
}
