// ============================================================
// KashFinance Project Tracker V3 — Progress Log Queries
// ============================================================

import { exec, query, queryOne } from '../database';
import type {
  ProgressLog, CreateProgressLog, PaginationOptions, SQLiteCompatibleType,
} from '../types';

export async function createProgressLog(data: CreateProgressLog): Promise<ProgressLog> {
  const id = crypto.randomUUID().replace(/-/g, '');
  const columns = ['id', 'project_id', 'content'];
  const placeholders = ['?', '?', '?'];
  const params: SQLiteCompatibleType[] = [id, data.project_id, data.content];

  const optionalFields: (keyof CreateProgressLog)[] = [
    'task_id', 'log_type', 'mood', 'hours_worked',
  ];

  for (const field of optionalFields) {
    if (data[field] !== undefined) {
      columns.push(field);
      placeholders.push('?');
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  await exec(
    `INSERT INTO progress_logs (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    params,
  );

  const log = await queryOne<ProgressLog>(`SELECT * FROM progress_logs WHERE id = ?`, [id]);
  if (!log) throw new Error('[ProgressLogs] Failed to retrieve created log');
  return log;
}

export async function listProgressLogsByProject(
  projectId: string,
  pagination: PaginationOptions = {},
): Promise<ProgressLog[]> {
  const limit = pagination.limit ?? 50;
  const offset = pagination.offset ?? 0;

  return query<ProgressLog>(
    `SELECT * FROM progress_logs WHERE project_id = ? ORDER BY logged_at DESC LIMIT ? OFFSET ?`,
    [projectId, limit, offset],
  );
}

/**
 * Get the most recent progress logs across all projects.
 */
export async function listRecentProgressLogs(limit: number = 20): Promise<ProgressLog[]> {
  return query<ProgressLog>(
    `SELECT * FROM progress_logs ORDER BY logged_at DESC LIMIT ?`,
    [limit],
  );
}

export async function deleteProgressLog(id: string): Promise<boolean> {
  await exec(`DELETE FROM progress_logs WHERE id = ?`, [id]);
  const check = await queryOne<ProgressLog>(`SELECT id FROM progress_logs WHERE id = ?`, [id]);
  return check === null;
}
