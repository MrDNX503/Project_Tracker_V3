// ============================================================
// KashFinance Project Tracker V3 — Susan Conversation Queries
// ============================================================

import { exec, query, queryOne } from '../database';
import type { SusanConversation, CreateSusanMessage, SQLiteCompatibleType } from '../types';

export async function saveSusanMessage(data: CreateSusanMessage): Promise<SusanConversation> {
  const id = crypto.randomUUID().replace(/-/g, '');
  const columns = ['id', 'role', 'content'];
  const placeholders = ['?', '?', '?'];
  const params: SQLiteCompatibleType[] = [id, data.role, data.content];

  if (data.context !== undefined) {
    columns.push('context');
    placeholders.push('?');
    params.push(data.context);
  }

  await exec(
    `INSERT INTO susan_conversations (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    params,
  );

  const msg = await queryOne<SusanConversation>(
    `SELECT * FROM susan_conversations WHERE id = ?`,
    [id],
  );
  if (!msg) throw new Error('[Susan] Failed to retrieve saved message');
  return msg;
}

/**
 * Get conversation history, most recent first.
 * Default limit is 50 messages.
 */
export async function getSusanHistory(limit: number = 50): Promise<SusanConversation[]> {
  // We query DESC to get the most recent, then reverse so the caller
  // receives messages in chronological order (oldest first).
  const rows = await query<SusanConversation>(
    `SELECT * FROM susan_conversations ORDER BY created_at DESC LIMIT ?`,
    [limit],
  );
  return rows.reverse();
}

/**
 * Delete all conversation history.
 */
export async function clearSusanHistory(): Promise<void> {
  await exec(`DELETE FROM susan_conversations`);
}
