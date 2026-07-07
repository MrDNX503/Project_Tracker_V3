// ============================================
// Database Connection Hook
// ============================================

import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

// We'll dynamically import the DB module to avoid SSR issues
let dbInstance: typeof import('../db') | null = null;

/**
 * Hook that provides access to the database layer
 * Handles initialization and exposes query functions
 */
export function useDatabase() {
  const dbReady = useAppStore((s) => s.dbReady);
  const setDbReady = useAppStore((s) => s.setDbReady);
  const setDbError = useAppStore((s) => s.setDbError);

  const init = useCallback(async () => {
    if (dbInstance) return;

    try {
      const db = await import('../db');
      await db.getDB();
      dbInstance = db;
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
