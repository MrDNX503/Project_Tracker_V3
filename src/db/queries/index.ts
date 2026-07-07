// ============================================================
// KashFinance Project Tracker V3 — Queries Barrel Export
// ============================================================

export {
  createProject, getProject, listProjects,
  updateProject, deleteProject, updateProjectProgress,
} from './projects';

export {
  createTask, getTask, listTasks,
  updateTask, deleteTask, updateTaskStatus, reorderTasks,
} from './tasks';

export {
  createMilestone, getMilestone, listMilestones,
  updateMilestone, deleteMilestone,
} from './milestones';

export {
  createDailyPlan, getDailyPlan, listDailyPlansByDate,
  listDailyPlansByDate as listDailyPlans,
  listDailyPlansByRange, updateDailyPlan, deleteDailyPlan,
} from './dailyPlans';

export {
  createReminder, getReminder, listActiveReminders,
  listUpcomingReminders, updateReminder, deleteReminder, markReminderTriggered,
} from './reminders';

export {
  createProgressLog, listProgressLogsByProject,
  listRecentProgressLogs, deleteProgressLog,
} from './progressLogs';

export {
  createAnalyticsSnapshot, listSnapshotsByDateRange, getAggregateStats,
} from './analytics';

export {
  saveSusanMessage, getSusanHistory, clearSusanHistory,
} from './susan';

export {
  getSetting, setSetting, getAllSettings,
} from './settings';
