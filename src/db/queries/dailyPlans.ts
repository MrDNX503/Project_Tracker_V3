// ============================================================
// KashFinance Project Tracker V3 — Daily Plan Queries
// ============================================================

import { exec, query, queryOne } from '../database';
import type {
  DailyPlan, CreateDailyPlan, UpdateDailyPlan, SQLiteCompatibleType,
} from '../types';

export async function createDailyPlan(data: CreateDailyPlan): Promise<DailyPlan> {
  const id = crypto.randomUUID().replace(/-/g, '');
  const columns = ['id', 'plan_date', 'title'];
  const placeholders = ['?', '?', '?'];
  const params: SQLiteCompatibleType[] = [id, data.plan_date, data.title];

  const optionalFields: (keyof CreateDailyPlan)[] = [
    'task_id', 'description', 'time_start', 'time_end',
    'is_calendar_event', 'calendar_event_id', 'status', 'sort_order',
  ];

  for (const field of optionalFields) {
    if (data[field] !== undefined) {
      columns.push(field);
      placeholders.push('?');
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  await exec(
    `INSERT INTO daily_plans (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    params,
  );

  const plan = await queryOne<DailyPlan>(`SELECT * FROM daily_plans WHERE id = ?`, [id]);
  if (!plan) throw new Error('[DailyPlans] Failed to retrieve created plan');
  return plan;
}

export async function getDailyPlan(id: string): Promise<DailyPlan | null> {
  return queryOne<DailyPlan>(`SELECT * FROM daily_plans WHERE id = ?`, [id]);
}

export async function listDailyPlansByDate(date: string): Promise<DailyPlan[]> {
  return query<DailyPlan>(
    `SELECT * FROM daily_plans WHERE plan_date = ? ORDER BY sort_order ASC, time_start ASC`,
    [date],
  );
}

export async function listDailyPlansByRange(startDate: string, endDate: string): Promise<DailyPlan[]> {
  return query<DailyPlan>(
    `SELECT * FROM daily_plans WHERE plan_date BETWEEN ? AND ? ORDER BY plan_date ASC, sort_order ASC, time_start ASC`,
    [startDate, endDate],
  );
}

export async function updateDailyPlan(id: string, data: UpdateDailyPlan): Promise<DailyPlan | null> {
  const setClauses: string[] = [];
  const params: SQLiteCompatibleType[] = [];

  const fields: (keyof UpdateDailyPlan)[] = [
    'plan_date', 'task_id', 'title', 'description',
    'time_start', 'time_end', 'is_calendar_event',
    'calendar_event_id', 'status', 'sort_order',
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  if (setClauses.length === 0) return getDailyPlan(id);

  params.push(id);
  await exec(
    `UPDATE daily_plans SET ${setClauses.join(', ')} WHERE id = ?`,
    params,
  );

  return getDailyPlan(id);
}

export async function deleteDailyPlan(id: string): Promise<boolean> {
  await exec(`DELETE FROM daily_plans WHERE id = ?`, [id]);
  const check = await queryOne<DailyPlan>(`SELECT id FROM daily_plans WHERE id = ?`, [id]);
  return check === null;
}
