// ============================================================
// KashFinance Project Tracker V3 — Main Database Module
// ============================================================
// Initializes wa-sqlite with OPFS VFS (primary) or IDB fallback.
// Runs inside a Web Worker — never import this from the main thread.
// ============================================================

import * as SQLite from 'wa-sqlite';
import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite-async.mjs';
import { OriginPrivateFileSystemVFS as OPFSCoopSyncVFS } from 'wa-sqlite/src/examples/OriginPrivateFileSystemVFS.js';
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js';
import { runMigrations } from './migrations';
import type { SQLiteCompatibleType } from './types';
import SCHEMA_SQL from './schema.sql?raw';

const DB_NAME = 'kashfinance_tracker_v3';

let sqlite3: SQLiteAPI | null = null;
let db: number | null = null;
let vfsName: string = '';

// wa-sqlite type alias
type SQLiteAPI = ReturnType<typeof SQLite.Factory>;

// ----- Serialization queue -----
// The Asyncify build of wa-sqlite is NOT reentrant: two statements
// running concurrently corrupt WASM memory ("memory access out of
// bounds"). Every DB operation must go through this queue.
let opQueue: Promise<unknown> = Promise.resolve();

function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const run = opQueue.then(fn, fn);
  opQueue = run.then(() => undefined, () => undefined);
  return run;
}

// ----- Helpers -----

function ensureDb(): { sqlite3: SQLiteAPI; db: number } {
  if (!sqlite3 || db === null) {
    throw new Error('[DB] Database not initialized. Call init() first.');
  }
  return { sqlite3, db };
}

/**
 * Execute a SQL statement that returns no rows (INSERT / UPDATE / DELETE / DDL).
 */
export function exec(sql: string, params: SQLiteCompatibleType[] = []): Promise<void> {
  return serialize(() => execUnsafe(sql, params));
}

async function execUnsafe(sql: string, params: SQLiteCompatibleType[] = []): Promise<void> {
  const { sqlite3: api, db: dbHandle } = ensureDb();
  const str = api.str_new(dbHandle, sql);
  try {
    const prepared = await api.prepare_v2(dbHandle, api.str_value(str));
    if (!prepared) throw new Error(`[DB] Failed to prepare: ${sql}`);
    const stmt = prepared.stmt;
    try {
      if (params.length > 0) {
        api.bind_collection(stmt, params);
      }
      await api.step(stmt);
    } finally {
      api.finalize(stmt);
    }
  } finally {
    api.str_finish(str);
  }
}

/**
 * Execute multiple SQL statements separated by semicolons (used for schema init).
 */
export function execMulti(sql: string): Promise<void> {
  return serialize(() => execMultiUnsafe(sql));
}

async function execMultiUnsafe(sql: string): Promise<void> {
  const { sqlite3: api, db: dbHandle } = ensureDb();
  const str = api.str_new(dbHandle, sql);
  try {
    let pStr = api.str_value(str);
    while (true) {
      const prepared = await api.prepare_v2(dbHandle, pStr);
      if (!prepared) break;
      const { stmt, sql: nextSql } = prepared;
      try {
        await api.step(stmt);
      } finally {
        api.finalize(stmt);
      }
      pStr = nextSql;
    }
  } finally {
    api.str_finish(str);
  }
}

/**
 * Execute a SQL query and return rows as an array of objects.
 */
export function query<T = Record<string, unknown>>(
  sql: string,
  params: SQLiteCompatibleType[] = [],
): Promise<T[]> {
  return serialize(() => queryUnsafe<T>(sql, params));
}

async function queryUnsafe<T = Record<string, unknown>>(
  sql: string,
  params: SQLiteCompatibleType[] = [],
): Promise<T[]> {
  const { sqlite3: api, db: dbHandle } = ensureDb();
  const rows: T[] = [];
  const str = api.str_new(dbHandle, sql);
  try {
    const prepared = await api.prepare_v2(dbHandle, api.str_value(str));
    if (!prepared) return rows;
    const stmt = prepared.stmt;
    try {
      if (params.length > 0) {
        api.bind_collection(stmt, params);
      }
      const columnCount = api.column_count(stmt);
      const columns: string[] = [];
      for (let i = 0; i < columnCount; i++) {
        columns.push(api.column_name(stmt, i));
      }
      while ((await api.step(stmt)) === SQLite.SQLITE_ROW) {
        const row: Record<string, unknown> = {};
        for (let i = 0; i < columnCount; i++) {
          row[columns[i]] = api.column(stmt, i);
        }
        rows.push(row as T);
      }
    } finally {
      api.finalize(stmt);
    }
  } finally {
    api.str_finish(str);
  }
  return rows;
}

/**
 * Execute a SQL query and return the first row, or null.
 */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: SQLiteCompatibleType[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get the value returned by last_insert_rowid() — not very useful with TEXT PKs
 * but kept for completeness.
 */
export function lastInsertId(): number {
  const { sqlite3: api, db: dbHandle } = ensureDb();
  return api.changes(dbHandle);
}

// ----- Initialization -----

export async function initDatabase(): Promise<string> {
  if (sqlite3 && db !== null) {
    return vfsName; // already initialized
  }

  const module = await SQLiteESMFactory();
  const api = SQLite.Factory(module);
  sqlite3 = api;

  // Try OPFS first, fall back to IndexedDB
  try {
    const vfs = new OPFSCoopSyncVFS();
    api.vfs_register(vfs, true);
    vfsName = vfs.name;
    console.info('[DB] Using OPFS VFS:', vfsName);
  } catch (opfsError) {
    console.warn('[DB] OPFS unavailable, falling back to IDB', opfsError);
    try {
      const vfs = new IDBBatchAtomicVFS(DB_NAME);
      api.vfs_register(vfs, true);
      vfsName = vfs.name;
      console.info('[DB] Using IDB VFS:', vfsName);
    } catch (idbError) {
      console.error('[DB] Both VFS options failed', idbError);
      throw new Error('[DB] No suitable VFS available');
    }
  }

  db = await api.open_v2(DB_NAME, SQLite.SQLITE_OPEN_READWRITE | SQLite.SQLITE_OPEN_CREATE, vfsName);

  // Apply base schema (IF NOT EXISTS keeps it idempotent)
  await execMulti(SCHEMA_SQL);

  // Run any pending migrations
  await runMigrations({ exec, execMulti, query, queryOne });

  console.info('[DB] Database initialized successfully');
  return vfsName;
}

export async function closeDatabase(): Promise<void> {
  if (sqlite3 && db !== null) {
    await sqlite3.close(db);
    db = null;
    console.info('[DB] Database closed');
  }
}

export function isReady(): boolean {
  return sqlite3 !== null && db !== null;
}

export function getVfsName(): string {
  return vfsName;
}
