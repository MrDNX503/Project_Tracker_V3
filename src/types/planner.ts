/* ============================================================
   KashFinance Project Tracker V3 — Planner Types
   ============================================================ */

import type { PriorityLevel, TaskStatus } from './project';

/** Time block category for color-coding */
export type TimeBlockCategory =
  | 'deep-work'
  | 'meetings'
  | 'admin'
  | 'break'
  | 'learning'
  | 'review'
  | 'planning'
  | 'personal';

/** Category display configuration */
export const TIME_BLOCK_CATEGORY_CONFIG: Record<TimeBlockCategory, { label: string; color: string; icon: string }> = {
  'deep-work': { label: 'Deep Work', color: 'var(--accent-cyan)', icon: 'Code2' },
  'meetings': { label: 'Meetings', color: 'var(--accent-violet)', icon: 'Users' },
  'admin': { label: 'Admin', color: 'var(--color-warning)', icon: 'ClipboardList' },
  'break': { label: 'Break', color: 'var(--color-success)', icon: 'Coffee' },
  'learning': { label: 'Learning', color: 'var(--color-info)', icon: 'BookOpen' },
  'review': { label: 'Review', color: 'var(--accent-indigo)', icon: 'Eye' },
  'planning': { label: 'Planning', color: 'var(--text-secondary)', icon: 'Map' },
  'personal': { label: 'Personal', color: 'var(--color-danger)', icon: 'Heart' },
} as const;

/** A time block within a daily plan */
export interface TimeBlock {
  id: string;
  dailyPlanId: string;
  title: string;
  description: string;
  category: TimeBlockCategory;
  startTime: string;
  endTime: string;
  linkedTaskId: string | null;
  linkedProjectId: string | null;
  completed: boolean;
  order: number;
}

/** A planned task for the day (may or may not be a time block) */
export interface PlannedTask {
  id: string;
  dailyPlanId: string;
  taskId: string;
  projectId: string;
  projectName: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  priority: PriorityLevel;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  completed: boolean;
  notes: string;
  order: number;
}

/** Daily plan containing time blocks and tasks */
export interface DailyPlan {
  id: string;
  date: string;
  dayGoal: string;
  reflection: string;
  energyLevel: EnergyLevel | null;
  moodRating: number | null;
  timeBlocks: TimeBlock[];
  plannedTasks: PlannedTask[];
  accomplishments: string[];
  blockers: string[];
  tomorrowPriorities: string[];
  createdAt: string;
  updatedAt: string;
}

/** Energy level for daily planning */
export type EnergyLevel = 'high' | 'medium' | 'low';

/** Weekly plan overview */
export interface WeeklyOverview {
  weekStartDate: string;
  weekEndDate: string;
  dailyPlans: DailyPlan[];
  weeklyGoals: string[];
  totalPlannedHours: number;
  totalActualHours: number;
  tasksCompleted: number;
  tasksPlanned: number;
}

/* ── Calendar Sync Types ── */

/** External calendar event source */
export type CalendarSource = 'google' | 'outlook' | 'apple' | 'manual';

/** Synced calendar event */
export interface CalendarEvent {
  id: string;
  externalId: string | null;
  source: CalendarSource;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location: string | null;
  meetingUrl: string | null;
  attendees: string[];
  color: string | null;
  linkedTimeBlockId: string | null;
  synced: boolean;
}

/** Calendar sync configuration */
export interface CalendarSyncConfig {
  source: CalendarSource;
  enabled: boolean;
  calendarId: string;
  lastSyncedAt: string | null;
  syncIntervalMinutes: number;
  autoCreateTimeBlocks: boolean;
}

/* ── Form Input Types ── */

/** Create/edit time block form */
export interface TimeBlockFormInput {
  title: string;
  description: string;
  category: TimeBlockCategory;
  startTime: string;
  endTime: string;
  linkedTaskId: string;
  linkedProjectId: string;
}

/** Create/edit daily plan form */
export interface DailyPlanFormInput {
  date: string;
  dayGoal: string;
  energyLevel: EnergyLevel | null;
}

/** Planner view mode */
export type PlannerViewMode = 'day' | 'week' | 'timeline';

/** Planner navigation state */
export interface PlannerNavState {
  selectedDate: string;
  viewMode: PlannerViewMode;
  showCompletedTasks: boolean;
  showCalendarEvents: boolean;
}
