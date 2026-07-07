// ============================================================
// KashFinance Project Tracker V3 — Milestone Queries
// ============================================================

import { exec, query, queryOne } from '../database';
import type {
  Milestone, CreateMilestone, UpdateMilestone, SQLiteCompatibleType,
} from '../types';

export async function createMilestone(data: CreateMilestone): Promise<Milestone> {
  const id = crypto.randomUUID().replace(/-/g, '');
  const columns = ['id', 'project_id', 'title'];
  const placeholders = ['?', '?', '?'];
  const params: SQLiteCompatibleType[] = [id, data.project_id, data.title];

  const optionalFields: (keyof CreateMilestone)[] = [
    'description', 'status', 'due_date', 'completed_date', 'sort_order',
  ];

  for (const field of optionalFields) {
    if (data[field] !== undefined) {
      columns.push(field);
      placeholders.push('?');
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  await exec(
    `INSERT INTO milestones (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    params,
  );

  const milestone = await queryOne<Milestone>(`SELECT * FROM milestones WHERE id = ?`, [id]);
  if (!milestone) throw new Error('[Milestones] Failed to retrieve created milestone');
  return milestone;
}

export async function getMilestone(id: string): Promise<Milestone | null> {
  return queryOne<Milestone>(`SELECT * FROM milestones WHERE id = ?`, [id]);
}

export async function listMilestones(projectId: string): Promise<Milestone[]> {
  return query<Milestone>(
    `SELECT * FROM milestones WHERE project_id = ? ORDER BY sort_order ASC, created_at ASC`,
    [projectId],
  );
}

export async function updateMilestone(id: string, data: UpdateMilestone): Promise<Milestone | null> {
  const setClauses: string[] = [];
  const params: SQLiteCompatibleType[] = [];

  const fields: (keyof UpdateMilestone)[] = [
    'project_id', 'title', 'description', 'status',
    'due_date', 'completed_date', 'sort_order',
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  // Auto-set completed_date when status changes to 'completed'
  if (data.status === 'completed' && data.completed_date === undefined) {
    setClauses.push(`completed_date = datetime('now')`);
  }

  if (setClauses.length === 0) return getMilestone(id);

  params.push(id);
  await exec(
    `UPDATE milestones SET ${setClauses.join(', ')} WHERE id = ?`,
    params,
  );

  return getMilestone(id);
}

export async function deleteMilestone(id: string): Promise<boolean> {
  await exec(`DELETE FROM milestones WHERE id = ?`, [id]);
  const check = await queryOne<Milestone>(`SELECT id FROM milestones WHERE id = ?`, [id]);
  return check === null;
}
