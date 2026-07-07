// ============================================================
// KashFinance Project Tracker V3 — Database Web Worker
// ============================================================
// This worker runs wa-sqlite in a dedicated thread and exposes
// the full DatabaseAPI to the main thread via Comlink.
// ============================================================

import * as Comlink from 'comlink';
import { initDatabase, closeDatabase } from './database';
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
