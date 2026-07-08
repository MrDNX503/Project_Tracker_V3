// ============================================================
// KashFinance Project Tracker V3 — Database Web Worker
// ============================================================
// This worker runs wa-sqlite in a dedicated thread and exposes
// the full DatabaseAPI to the main thread via Comlink.
// ============================================================

import * as Comlink from 'comlink';
import { initDatabase, closeDatabase, exec, query } from './database';
import {
  createProject, getProject, listProjects,
  updateProject, deleteProject, updateProjectProgress,
} from './queries/projects';
import {
  createTask, getTask, listTasks,
  updateTask, deleteTask, updateTaskStatus, reorderTasks,
} from './queries/tasks';
import {
  createMilestone, getMilestone, listMilestones,
  updateMilestone, deleteMilestone,
} from './queries/milestones';
import {
  createDailyPlan, getDailyPlan, listDailyPlansByDate,
  listDailyPlansByRange, updateDailyPlan, deleteDailyPlan,
} from './queries/dailyPlans';
import {
  createReminder, getReminder, listActiveReminders,
  listUpcomingReminders, updateReminder, deleteReminder, markReminderTriggered,
} from './queries/reminders';
import {
  createProgressLog, listProgressLogsByProject,
  listRecentProgressLogs, deleteProgressLog,
} from './queries/progressLogs';
import {
  createAnalyticsSnapshot, listSnapshotsByDateRange, getAggregateStats,
} from './queries/analytics';
import {
  saveSusanMessage, getSusanHistory, clearSusanHistory,
} from './queries/susan';
import {
  getSetting, setSetting, getAllSettings,
} from './queries/settings';

import type { DatabaseAPI } from './types';

// ----- Worker API implementation -----

const api: DatabaseAPI = {
  // Initialization
  async init() {
    const vfs = await initDatabase();
    console.info(`[Worker] Database ready (VFS: ${vfs})`);
  },
  close: closeDatabase,

  // Backup / restore
  async exportAllData() {
    const tables = [
      'projects', 'milestones', 'tasks', 'progress_logs', 'daily_plans',
      'reminders', 'susan_conversations', 'settings', 'analytics_snapshots',
    ];
    const out: Record<string, unknown[]> = {};
    for (const t of tables) {
      out[t] = await query(`SELECT * FROM ${t}`);
    }
    return out;
  },

  async importAllData(data) {
    // Children first so FK constraints never complain
    const deleteOrder = [
      'analytics_snapshots', 'susan_conversations', 'reminders', 'daily_plans',
      'progress_logs', 'tasks', 'milestones', 'projects', 'settings',
    ];
    const insertOrder = [...deleteOrder].reverse();

    await exec('PRAGMA foreign_keys = OFF');
    try {
      for (const t of deleteOrder) {
        await exec(`DELETE FROM ${t}`);
      }
      const SAFE_COL = /^[a-z0-9_]+$/i;
      for (const t of insertOrder) {
        const rows = (data[t] ?? []) as Record<string, unknown>[];
        for (const row of rows) {
          // Column names come from the backup file — validate them to
          // prevent SQL injection via a crafted/tampered backup.
          const cols = Object.keys(row).filter((c) => SAFE_COL.test(c));
          if (cols.length === 0) continue;
          const placeholders = cols.map(() => '?').join(', ');
          await exec(
            `INSERT INTO ${t} (${cols.join(', ')}) VALUES (${placeholders})`,
            cols.map((c) => row[c] as never),
          );
        }
      }
    } finally {
      await exec('PRAGMA foreign_keys = ON');
    }
  },

  // Projects
  createProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
  updateProjectProgress,

  // Tasks
  createTask,
  getTask,
  listTasks,
  updateTask,
  deleteTask,
  updateTaskStatus,
  reorderTasks,

  // Milestones
  createMilestone,
  getMilestone,
  listMilestones,
  updateMilestone,
  deleteMilestone,

  // Daily Plans
  createDailyPlan,
  getDailyPlan,
  listDailyPlansByDate,
  listDailyPlans: listDailyPlansByDate,
  listDailyPlansByRange,
  updateDailyPlan,
  deleteDailyPlan,

  // Reminders
  createReminder,
  getReminder,
  listActiveReminders,
  listUpcomingReminders,
  updateReminder,
  deleteReminder,
  markReminderTriggered,

  // Progress Logs
  createProgressLog,
  listProgressLogsByProject,
  listRecentProgressLogs,
  deleteProgressLog,

  // Analytics
  createAnalyticsSnapshot,
  listSnapshotsByDateRange,
  getAggregateStats,

  // Susan
  saveSusanMessage,
  getSusanHistory,
  clearSusanHistory,

  // Settings
  getSetting,
  setSetting,
  getAllSettings,
};

// Expose the full API to the main thread
Comlink.expose(api);
