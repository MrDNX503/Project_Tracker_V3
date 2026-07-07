// ============================================================
// KashFinance Project Tracker V3 — Schema Migrations
// ============================================================
// Simple forward-only migration system.
// Each migration has a version number and a list of SQL statements.
// Current version is tracked in the `settings` table under key 'schema_version'.
// ============================================================

import type { SQLiteCompatibleType } from './types';

// Injected database helpers so migrations don't create circular deps
export interface MigrationContext {
  exec(sql: string, params?: SQLiteCompatibleType[]): Promise<void>;
  execMulti(sql: string): Promise<void>;
  query<T extends Record<string, unknown>>(sql: string, params?: SQLiteCompatibleType[]): Promise<T[]>;
  queryOne<T extends Record<string, unknown>>(sql: string, params?: SQLiteCompatibleType[]): Promise<T | null>;
}

interface Migration {
  version: number;
  description: string;
  up: string[];
}

// -------------------------------------------------------------------
// Migration registry — add new migrations at the end of this array.
// The base schema (schema.sql) is version 1 and is applied separately.
// Start migration versions from 2.
// -------------------------------------------------------------------
const MIGRATIONS: Migration[] = [
  // Example migration for future use:
  // {
  //   version: 2,
  //   description: 'Add notes column to projects',
  //   up: [
  //     `ALTER TABLE projects ADD COLUMN notes TEXT;`,
  //   ],
  // },
];

// Current latest version equals the base schema (1) + number of migrations applied.
export const LATEST_VERSION = MIGRATIONS.length > 0
  ? MIGRATIONS[MIGRATIONS.length - 1].version
  : 1; // base schema

/**
 * Read the current schema version from the settings table.
 * Returns 0 if the table doesn't exist yet (fresh database).
 */
async function getCurrentVersion(ctx: MigrationContext): Promise<number> {
  try {
    const row = await ctx.queryOne<{ value: string }>(
      `SELECT value FROM settings WHERE key = ?`,
      ['schema_version'],
    );
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    // settings table might not exist on a completely fresh DB
    return 0;
  }
}

/**
 * Persist the new schema version.
 */
async function setVersion(ctx: MigrationContext, version: number): Promise<void> {
  await ctx.exec(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))`,
    ['schema_version', String(version)],
  );
}

/**
 * Run all pending migrations in order.
 * Called automatically during database initialization.
 */
export async function runMigrations(ctx: MigrationContext): Promise<number> {
  const currentVersion = await getCurrentVersion(ctx);

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion);
  if (pending.length === 0) {
    console.info(`[Migrations] Schema is up-to-date at version ${currentVersion}`);
    return currentVersion;
  }

  console.info(
    `[Migrations] Running ${pending.length} migration(s): v${currentVersion} → v${pending[pending.length - 1].version}`,
  );

  for (const migration of pending) {
    console.info(`[Migrations] Applying v${migration.version}: ${migration.description}`);
    for (const sql of migration.up) {
      await ctx.exec(sql);
    }
    await setVersion(ctx, migration.version);
  }

  const finalVersion = pending[pending.length - 1].version;
  console.info(`[Migrations] Complete — now at version ${finalVersion}`);
  return finalVersion;
}
