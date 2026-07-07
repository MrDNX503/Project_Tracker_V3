// ============================================================
// KashFinance Project Tracker V3 — Project Queries
// ============================================================

import { exec, query, queryOne } from '../database';
import type {
  Project, CreateProject, UpdateProject,
  ProjectFilters, PaginationOptions, SQLiteCompatibleType,
} from '../types';

export async function createProject(data: CreateProject): Promise<Project> {
  const id = crypto.randomUUID().replace(/-/g, '');
  const columns = ['id', 'name'];
  const placeholders = ['?', '?'];
  const params: SQLiteCompatibleType[] = [id, data.name];

  const optionalFields: (keyof CreateProject)[] = [
    'description', 'icon', 'color', 'status', 'priority',
    'progress', 'start_date', 'target_date', 'completed_date', 'tags',
  ];

  for (const field of optionalFields) {
    if (data[field] !== undefined) {
      columns.push(field);
      placeholders.push('?');
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  await exec(
    `INSERT INTO projects (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    params,
  );

  const project = await queryOne<Project>(`SELECT * FROM projects WHERE id = ?`, [id]);
  if (!project) throw new Error('[Projects] Failed to retrieve created project');
  return project;
}

export async function getProject(id: string): Promise<Project | null> {
  return queryOne<Project>(`SELECT * FROM projects WHERE id = ?`, [id]);
}

export async function listProjects(
  filters: ProjectFilters = {},
  pagination: PaginationOptions = {},
): Promise<Project[]> {
  const conditions: string[] = [];
  const params: SQLiteCompatibleType[] = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters.priority !== undefined) {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }
  if (filters.search) {
    conditions.push('(name LIKE ? OR description LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term);
  }
  if (filters.tags && filters.tags.length > 0) {
    // Match any of the provided tags (tags stored as JSON array text)
    const tagConditions = filters.tags.map(() => 'tags LIKE ?');
    conditions.push(`(${tagConditions.join(' OR ')})`);
    for (const tag of filters.tags) {
      params.push(`%${tag}%`);
    }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit ?? 50;
  const offset = pagination.offset ?? 0;

  return query<Project>(
    `SELECT * FROM projects ${where} ORDER BY priority ASC, updated_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
}

export async function updateProject(id: string, data: UpdateProject): Promise<Project | null> {
  const setClauses: string[] = [];
  const params: SQLiteCompatibleType[] = [];

  const fields: (keyof UpdateProject)[] = [
    'name', 'description', 'icon', 'color', 'status', 'priority',
    'progress', 'start_date', 'target_date', 'completed_date', 'tags',
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  if (setClauses.length === 0) return getProject(id);

  params.push(id);
  await exec(
    `UPDATE projects SET ${setClauses.join(', ')} WHERE id = ?`,
    params,
  );

  return getProject(id);
}

export async function deleteProject(id: string): Promise<boolean> {
  await exec(`DELETE FROM projects WHERE id = ?`, [id]);
  // We check if the project still exists; if not, deletion was successful
  const check = await queryOne<Project>(`SELECT id FROM projects WHERE id = ?`, [id]);
  return check === null;
}

/**
 * Recalculate project progress based on completed tasks ratio.
 */
export async function updateProjectProgress(id: string): Promise<Project | null> {
  const stats = await queryOne<{ total: number; completed: number }>(
    `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
     FROM tasks WHERE project_id = ?`,
    [id],
  );

  const progress = stats && stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100 * 100) / 100
    : 0;

  await exec(`UPDATE projects SET progress = ? WHERE id = ?`, [progress, id]);

  // Auto-update status when all tasks are done
  if (progress === 100 && stats && stats.total > 0) {
    await exec(
      `UPDATE projects SET status = 'completed', completed_date = datetime('now') WHERE id = ? AND status != 'completed'`,
      [id],
    );
  }

  return getProject(id);
}
