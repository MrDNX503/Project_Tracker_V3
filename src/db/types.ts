// ============================================================
// KashFinance Project Tracker V3 — Database Types
// ============================================================
// These types mirror the SQLite schema exactly.
// All fields are typed to match their SQL column definitions.

// wa-sqlite compatible bind-parameter type
export type SQLiteCompatibleType = number | string | null | Uint8Array;

// ----- Enums as union types -----

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type LogType = 'update' | 'note' | 'blocker' | 'achievement';
export type Mood = 'focused' | 'productive' | 'struggling' | 'procrastinating' | 'neutral';
export type DailyPlanStatus = 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled';
export type ConversationRole = 'user' | 'susan' | 'system';

// ----- Entity interfaces -----

export interface Project {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  status: ProjectStatus;
  priority: number;
  progress: number;
  start_date: string | null;
  target_date: string | null;
  completed_date: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  due_date: string | null;
  completed_date: string | null;
  sort_order: number;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  milestone_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  estimated_hours: number | null;
  actual_hours: number | null;
  due_date: string | null;
  completed_date: string | null;
  tags: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProgressLog {
  id: string;
  project_id: string;
  task_id: string | null;
  log_type: LogType;
  content: string;
  mood: Mood | null;
  hours_worked: number | null;
  logged_at: string;
}

export interface DailyPlan {
  id: string;
  plan_date: string;
  task_id: string | null;
  title: string;
  description: string | null;
  time_start: string | null;
  time_end: string | null;
  is_calendar_event: number;
  calendar_event_id: string | null;
  status: DailyPlanStatus;
  sort_order: number;
  created_at: string;
}

export interface Reminder {
  id: string;
  project_id: string | null;
  task_id: string | null;
  title: string;
  message: string | null;
  remind_at: string;
  repeat_rule: string | null;
  is_active: number;
  last_triggered: string | null;
  created_at: string;
}

export interface SusanConversation {
  id: string;
  role: ConversationRole;
  content: string;
  context: string | null;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

export interface AnalyticsSnapshot {
  id: string;
  snapshot_date: string;
  project_id: string | null;
  tasks_total: number;
  tasks_completed: number;
  hours_logged: number;
  progress: number;
  susan_score: number | null;
  created_at: string;
}

// ----- Create/Update DTOs (omit auto-generated fields) -----

export type CreateProject = Pick<Project, 'name'> &
  Partial<Omit<Project, 'id' | 'name' | 'created_at' | 'updated_at'>>;

export type UpdateProject = Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;

export type CreateTask = Pick<Task, 'project_id' | 'title'> &
  Partial<Omit<Task, 'id' | 'project_id' | 'title' | 'created_at' | 'updated_at'>>;

export type UpdateTask = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;

export type CreateMilestone = Pick<Milestone, 'project_id' | 'title'> &
  Partial<Omit<Milestone, 'id' | 'project_id' | 'title' | 'created_at'>>;

export type UpdateMilestone = Partial<Omit<Milestone, 'id' | 'created_at'>>;

export type CreateDailyPlan = Pick<DailyPlan, 'plan_date' | 'title'> &
  Partial<Omit<DailyPlan, 'id' | 'plan_date' | 'title' | 'created_at'>>;

export type UpdateDailyPlan = Partial<Omit<DailyPlan, 'id' | 'created_at'>>;

export type CreateReminder = Pick<Reminder, 'title' | 'remind_at'> &
  Partial<Omit<Reminder, 'id' | 'title' | 'remind_at' | 'created_at'>>;

export type UpdateReminder = Partial<Omit<Reminder, 'id' | 'created_at'>>;

export type CreateProgressLog = Pick<ProgressLog, 'project_id' | 'content'> &
  Partial<Omit<ProgressLog, 'id' | 'project_id' | 'content' | 'logged_at'>>;

export type CreateSusanMessage = Pick<SusanConversation, 'role' | 'content'> &
  Partial<Pick<SusanConversation, 'context'>>;

export type CreateAnalyticsSnapshot = Pick<AnalyticsSnapshot, 'snapshot_date'> &
  Partial<Omit<AnalyticsSnapshot, 'id' | 'snapshot_date' | 'created_at'>>;

// ----- Filter / query helpers -----

export interface ProjectFilters {
  status?: ProjectStatus;
  priority?: number;
  search?: string;
  tags?: string[];
}

export interface TaskFilters {
  project_id?: string;
  milestone_id?: string;
  status?: TaskStatus;
  priority?: number;
  search?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

// ----- Database API surface (exposed via Comlink) -----

export interface DatabaseAPI {
  // Initialization
  init(): Promise<void>;
  close(): Promise<void>;

  // Projects
  createProject(data: CreateProject): Promise<Project>;
  getProject(id: string): Promise<Project | null>;
  listProjects(filters?: ProjectFilters, pagination?: PaginationOptions): Promise<Project[]>;
  updateProject(id: string, data: UpdateProject): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;
  updateProjectProgress(id: string): Promise<Project | null>;

  // Tasks
  createTask(data: CreateTask): Promise<Task>;
  getTask(id: string): Promise<Task | null>;
  listTasks(filters?: TaskFilters, pagination?: PaginationOptions): Promise<Task[]>;
  updateTask(id: string, data: UpdateTask): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null>;
  reorderTasks(taskIds: string[]): Promise<void>;

  // Milestones
  createMilestone(data: CreateMilestone): Promise<Milestone>;
  getMilestone(id: string): Promise<Milestone | null>;
  listMilestones(projectId: string): Promise<Milestone[]>;
  updateMilestone(id: string, data: UpdateMilestone): Promise<Milestone | null>;
  deleteMilestone(id: string): Promise<boolean>;

  // Daily Plans
  createDailyPlan(data: CreateDailyPlan): Promise<DailyPlan>;
  getDailyPlan(id: string): Promise<DailyPlan | null>;
  listDailyPlansByDate(date: string): Promise<DailyPlan[]>;
  listDailyPlansByRange(startDate: string, endDate: string): Promise<DailyPlan[]>;
  updateDailyPlan(id: string, data: UpdateDailyPlan): Promise<DailyPlan | null>;
  deleteDailyPlan(id: string): Promise<boolean>;

  // Reminders
  createReminder(data: CreateReminder): Promise<Reminder>;
  getReminder(id: string): Promise<Reminder | null>;
  listActiveReminders(): Promise<Reminder[]>;
  listUpcomingReminders(withinMinutes?: number): Promise<Reminder[]>;
  updateReminder(id: string, data: UpdateReminder): Promise<Reminder | null>;
  deleteReminder(id: string): Promise<boolean>;
  markReminderTriggered(id: string): Promise<void>;

  // Progress Logs
  createProgressLog(data: CreateProgressLog): Promise<ProgressLog>;
  listProgressLogsByProject(projectId: string, pagination?: PaginationOptions): Promise<ProgressLog[]>;
  listRecentProgressLogs(limit?: number): Promise<ProgressLog[]>;
  deleteProgressLog(id: string): Promise<boolean>;

  // Analytics
  createAnalyticsSnapshot(data: CreateAnalyticsSnapshot): Promise<AnalyticsSnapshot>;
  listSnapshotsByDateRange(startDate: string, endDate: string, projectId?: string): Promise<AnalyticsSnapshot[]>;
  getAggregateStats(projectId?: string): Promise<{
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    totalHoursLogged: number;
    averageProgress: number;
  }>;

  // Susan Conversations
  saveSusanMessage(data: CreateSusanMessage): Promise<SusanConversation>;
  getSusanHistory(limit?: number): Promise<SusanConversation[]>;
  clearSusanHistory(): Promise<void>;

  // Settings
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  getAllSettings(): Promise<Setting[]>;
}
