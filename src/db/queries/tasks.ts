// ============================================================
// KashFinance Project Tracker V3 — Task Queries
// ============================================================

import { exec, query, queryOne } from '../database';
import type {
  Task, CreateTask, UpdateTask, TaskStatus,
  TaskFilters, PaginationOptions, SQLiteCompatibleType,
} from '../types';

export async function createTask(data: CreateTask): Promise<Task> {
  const id = crypto.randomUUID().replace(/-/g, '');
  const columns = ['id', 'project_id', 'title'];
  const placeholders = ['?', '?', '?'];
  const params: SQLiteCompatibleType[] = [id, data.project_id, data.title];

  const optionalFields: (keyof CreateTask)[] = [
    'milestone_id', 'description', 'status', 'priority',
    'estimated_hours', 'actual_hours', 'due_date', 'completed_date',
    'tags', 'sort_order',
  ];

  for (const field of optionalFields) {
    if (data[field] !== undefined) {
      columns.push(field);
      placeholders.push('?');
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  await exec(
    `INSERT INTO tasks (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    params,
  );

  const task = await queryOne<Task>(`SELECT * FROM tasks WHERE id = ?`, [id]);
  if (!task) throw new Error('[Tasks] Failed to retrieve created task');
  return task;
}

export async function getTask(id: string): Promise<Task | null> {
  return queryOne<Task>(`SELECT * FROM tasks WHERE id = ?`, [id]);
}

export async function listTasks(
  filters: TaskFilters = {},
  pagination: PaginationOptions = {},
): Promise<Task[]> {
  const conditions: string[] = [];
  const params: SQLiteCompatibleType[] = [];

  if (filters.project_id) {
    conditions.push('project_id = ?');
    params.push(filters.project_id);
  }
  if (filters.milestone_id) {
    conditions.push('milestone_id = ?');
    params.push(filters.milestone_id);
  }
  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters.priority !== undefined) {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }
  if (filters.search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit ?? 100;
  const offset = pagination.offset ?? 0;

  return query<Task>(
    `SELECT * FROM tasks ${where} ORDER BY sort_order ASC, priority ASC, created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
}

export async function updateTask(id: string, data: UpdateTask): Promise<Task | null> {
  const setClauses: string[] = [];
  const params: SQLiteCompatibleType[] = [];

  const fields: (keyof UpdateTask)[] = [
    'project_id', 'milestone_id', 'title', 'description', 'status',
    'priority', 'estimated_hours', 'actual_hours', 'due_date',
    'completed_date', 'tags', 'sort_order',
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  if (setClauses.length === 0) return getTask(id);

  params.push(id);
  await exec(
    `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`,
    params,
  );

  return getTask(id);
}

export async function deleteTask(id: string): Promise<boolean> {
  await exec(`DELETE FROM tasks WHERE id = ?`, [id]);
  const check = await queryOne<Task>(`SELECT id FROM tasks WHERE id = ?`, [id]);
  return check === null;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
  const completedDate = status === 'done' ? `datetime('now')` : null;

  if (status === 'done') {
    await exec(
      `UPDATE tasks SET status = ?, completed_date = datetime('now') WHERE id = ?`,
      [status, id],
    );
  } else {
    await exec(
      `UPDATE tasks SET status = ?, completed_date = ? WHERE id = ?`,
      [status, completedDate, id],
    );
  }

  return getTask(id);
}

/**
 * Reorder tasks by setting sort_order based on array index position.
 */
export async function reorderTasks(taskIds: string[]): Promise<void> {
  for (let i = 0; i < taskIds.length; i++) {
    await exec(
      `UPDATE tasks SET sort_order = ? WHERE id = ?`,
      [i, taskIds[i]],
    );
  }
}
