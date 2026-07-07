/* ============================================================
   KashFinance Project Tracker V3 — Settings Types
   ============================================================ */

import type { SusanPreferences } from './susan';
import type { CalendarSource } from './planner';

/** Theme mode options */
export type ThemeMode = 'dark' | 'light' | 'system';

/** AI provider options */
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'local' | 'none';

/** AI model configuration */
export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl: string | null;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
}

/** Date format preferences */
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

/** Time format preferences */
export type TimeFormat = '12h' | '24h';

/** Start of week preference */
export type WeekStart = 'sunday' | 'monday';

/** Notification settings */
export interface NotificationConfig {
  enabled: boolean;
  desktop: boolean;
  sound: boolean;
  deadlineReminders: boolean;
  deadlineReminderHours: number[];
  dailyPlanReminder: boolean;
  dailyPlanReminderTime: string;
  weeklyReviewReminder: boolean;
  weeklyReviewDay: number;
  susanInsights: boolean;
  taskCompletionSound: boolean;
}

/** Calendar integration settings */
export interface CalendarConfig {
  enabled: boolean;
  source: CalendarSource;
  calendarId: string;
  syncEnabled: boolean;
  syncIntervalMinutes: number;
  autoCreateTimeBlocks: boolean;
  showInPlanner: boolean;
  defaultEventDuration: number;
}

/** Data export/import settings */
export interface DataConfig {
  autoBackup: boolean;
  backupIntervalDays: number;
  lastBackupAt: string | null;
  exportFormat: 'json' | 'csv';
  storageProvider: 'local' | 'supabase' | 'firebase';
}

/** Appearance settings beyond theme */
export interface AppearanceConfig {
  theme: ThemeMode;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  animationsEnabled: boolean;
  sidebarPosition: 'left' | 'right';
  showProjectIcons: boolean;
  showProgressBars: boolean;
}

/** Planner-specific settings */
export interface PlannerConfig {
  defaultView: 'day' | 'week' | 'timeline';
  workingHoursStart: string;
  workingHoursEnd: string;
  timeBlockDurationMinutes: number;
  weekStart: WeekStart;
  showWeekends: boolean;
  autoSchedule: boolean;
}

/** Keyboard shortcut definition */
export interface KeyboardShortcut {
  id: string;
  label: string;
  keys: string[];
  category: 'navigation' | 'actions' | 'editing' | 'views';
  customizable: boolean;
}

/** Complete application settings */
export interface AppSettings {
  appearance: AppearanceConfig;
  notifications: NotificationConfig;
  calendar: CalendarConfig;
  ai: AIModelConfig;
  susan: SusanPreferences;
  planner: PlannerConfig;
  data: DataConfig;
  locale: {
    dateFormat: DateFormat;
    timeFormat: TimeFormat;
    timezone: string;
    language: string;
  };
  shortcuts: KeyboardShortcut[];
  version: string;
  lastModified: string;
}

/** Settings section for navigation */
export type SettingsSection =
  | 'appearance'
  | 'notifications'
  | 'calendar'
  | 'ai'
  | 'susan'
  | 'planner'
  | 'data'
  | 'shortcuts'
  | 'about';

/** Settings section metadata */
export const SETTINGS_SECTIONS: Record<SettingsSection, { label: string; icon: string; description: string }> = {
  appearance: { label: 'Appearance', icon: 'Palette', description: 'Theme, colors, and display preferences' },
  notifications: { label: 'Notifications', icon: 'Bell', description: 'Alerts, reminders, and sounds' },
  calendar: { label: 'Calendar', icon: 'Calendar', description: 'Calendar integration and sync' },
  ai: { label: 'AI Provider', icon: 'Brain', description: 'AI model and API configuration' },
  susan: { label: 'Susan AI', icon: 'Sparkles', description: 'Susan personality and behavior' },
  planner: { label: 'Planner', icon: 'LayoutGrid', description: 'Daily planner and scheduling' },
  data: { label: 'Data', icon: 'Database', description: 'Backup, export, and storage' },
  shortcuts: { label: 'Shortcuts', icon: 'Keyboard', description: 'Keyboard shortcuts' },
  about: { label: 'About', icon: 'Info', description: 'Version info and credits' },
} as const;
