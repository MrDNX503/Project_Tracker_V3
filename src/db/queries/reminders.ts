// ============================================================
// KashFinance Project Tracker V3 — Reminder Queries
// ============================================================

import { exec, query, queryOne } from '../database';
import type {
  Reminder, CreateReminder, UpdateReminder, SQLiteCompatibleType,
} from '../types';

export async function createReminder(data: CreateReminder): Promise<Reminder> {
  const id = crypto.randomUUID().replace(/-/g, '');
  const columns = ['id', 'title', 'remind_at'];
  const placeholders = ['?', '?', '?'];
  const params: SQLiteCompatibleType[] = [id, data.title, data.remind_at];

  const optionalFields: (keyof CreateReminder)[] = [
    'project_id', 'task_id', 'message', 'repeat_rule', 'is_active',
  ];

  for (const field of optionalFields) {
    if (data[field] !== undefined) {
      columns.push(field);
      placeholders.push('?');
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  await exec(
    `INSERT INTO reminders (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    params,
  );

  const reminder = await queryOne<Reminder>(`SELECT * FROM reminders WHERE id = ?`, [id]);
  if (!reminder) throw new Error('[Reminders] Failed to retrieve created reminder');
  return reminder;
}

export async function getReminder(id: string): Promise<Reminder | null> {
  return queryOne<Reminder>(`SELECT * FROM reminders WHERE id = ?`, [id]);
}

export async function listActiveReminders(): Promise<Reminder[]> {
  return query<Reminder>(
    `SELECT * FROM reminders WHERE is_active = 1 ORDER BY remind_at ASC`,
  );
}

/**
 * Get reminders due within the next N minutes (default: 60).
 */
export async function listUpcomingReminders(withinMinutes: number = 60): Promise<Reminder[]> {
  return query<Reminder>(
    `SELECT * FROM reminders
     WHERE is_active = 1
       AND remind_at <= datetime('now', '+' || ? || ' minutes')
       AND (last_triggered IS NULL OR last_triggered < remind_at)
     ORDER BY remind_at ASC`,
    [withinMinutes],
  );
}

export async function updateReminder(id: string, data: UpdateReminder): Promise<Reminder | null> {
  const setClauses: string[] = [];
  const params: SQLiteCompatibleType[] = [];

  const fields: (keyof UpdateReminder)[] = [
    'project_id', 'task_id', 'title', 'message',
    'remind_at', 'repeat_rule', 'is_active', 'last_triggered',
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      params.push(data[field] as SQLiteCompatibleType);
    }
  }

  if (setClauses.length === 0) return getReminder(id);

  params.push(id);
  await exec(
    `UPDATE reminders SET ${setClauses.join(', ')} WHERE id = ?`,
    params,
  );

  return getReminder(id);
}

export async function deleteReminder(id: string): Promise<boolean> {
  await exec(`DELETE FROM reminders WHERE id = ?`, [id]);
  const check = await queryOne<Reminder>(`SELECT id FROM reminders WHERE id = ?`, [id]);
  return check === null;
}

/**
 * Mark a reminder as triggered (sets last_triggered to now).
 * For non-repeating reminders, also deactivates them.
 */
export async function markReminderTriggered(id: string): Promise<void> {
  await exec(
    `UPDATE reminders
     SET last_triggered = datetime('now'),
         is_active = CASE WHEN repeat_rule IS NULL THEN 0 ELSE is_active END
     WHERE id = ?`,
    [id],
  );
}
