// ============================================================
// KashFinance Project Tracker V3 — Settings Queries
// ============================================================

import { exec, query, queryOne } from '../database';
import type { Setting } from '../types';

/**
 * Get a single setting value by key. Returns null if not found.
 */
export async function getSetting(key: string): Promise<string | null> {
  const row = await queryOne<Setting>(
    `SELECT value FROM settings WHERE key = ?`,
    [key],
  );
  return row ? row.value : null;
}

/**
 * Set a setting value (upsert — creates if missing, updates if exists).
 */
export async function setSetting(key: string, value: string): Promise<void> {
  await exec(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, value],
  );
}

/**
 * Get all settings as an array of {key, value, updated_at} objects.
 */
export async function getAllSettings(): Promise<Setting[]> {
  return query<Setting>(`SELECT * FROM settings ORDER BY key ASC`);
}
