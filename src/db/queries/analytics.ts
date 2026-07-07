// ============================================================
// KashFinance Project Tracker V3 — Analytics Queries
// ============================================================

import { exec, query, queryOne } from '../database';
import type {
  AnalyticsSnapshot, CreateAnalyticsSnapshot, SQLiteCompatibleType,
} from '../types';

export async function createAnalyticsSnapshot(data: CreateAnalyticsSnapshot): Promise<AnalyticsSnapshot> {
  const id = crypto.randomUUID().replace(/-/g, '');
  const columns = ['id', 'snapshot_date'];
  const placeholders = ['?', '?'];
  const params: SQLiteCompatibleType[] = [id, data.snapshot_date];

  const optionalFields: (keyof CreateAnalyticsSnapshot)[] = [
    'project_id', 'tasks_total', 'tasks_completed',
    'hours_logged', 'progress', 'susan_score',
  ];

  for (const field of optionalFields) {
    if (data[field] !== undefined) {
      columns.push(field);
      placeholders.push('?');
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  await exec(
    `INSERT INTO analytics_snapshots (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    params,
  );

  const snapshot = await queryOne<AnalyticsSnapshot>(
    `SELECT * FROM analytics_snapshots WHERE id = ?`,
    [id],
  );
  if (!snapshot) throw new Error('[Analytics] Failed to retrieve created snapshot');
  return snapshot;
}

export async function listSnapshotsByDateRange(
  startDate: string,
  endDate: string,
  projectId?: string,
): Promise<AnalyticsSnapshot[]> {
  if (projectId) {
    return query<AnalyticsSnapshot>(
      `SELECT * FROM analytics_snapshots
       WHERE snapshot_date BETWEEN ? AND ? AND project_id = ?
       ORDER BY snapshot_date ASC`,
      [startDate, endDate, projectId],
    );
  }
  return query<AnalyticsSnapshot>(
    `SELECT * FROM analytics_snapshots
     WHERE snapshot_date BETWEEN ? AND ?
     ORDER BY snapshot_date ASC`,
    [startDate, endDate],
  );
}

/**
 * Get aggregate statistics across all projects (or a specific one).
 */
export async function getAggregateStats(projectId?: string): Promise<{
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalHoursLogged: number;
  averageProgress: number;
}> {
  const projectStats = await queryOne<{ total: number; avgProgress: number }>(
    projectId
      ? `SELECT COUNT(*) as total, COALESCE(AVG(progress), 0) as avgProgress FROM projects WHERE id = ?`
      : `SELECT COUNT(*) as total, COALESCE(AVG(progress), 0) as avgProgress FROM projects`,
    projectId ? [projectId] : [],
  );

  const taskStats = await queryOne<{ total: number; completed: number }>(
    projectId
      ? `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed FROM tasks WHERE project_id = ?`
      : `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed FROM tasks`,
    projectId ? [projectId] : [],
  );

  const hoursStats = await queryOne<{ total: number }>(
    projectId
      ? `SELECT COALESCE(SUM(hours_worked), 0) as total FROM progress_logs WHERE project_id = ?`
      : `SELECT COALESCE(SUM(hours_worked), 0) as total FROM progress_logs`,
    projectId ? [projectId] : [],
  );

  return {
    totalProjects: projectStats?.total ?? 0,
    totalTasks: taskStats?.total ?? 0,
    completedTasks: taskStats?.completed ?? 0,
    totalHoursLogged: hoursStats?.total ?? 0,
    averageProgress: Math.round((projectStats?.avgProgress ?? 0) * 100) / 100,
  };
}
