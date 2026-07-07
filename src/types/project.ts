/* ============================================================
   KashFinance Project Tracker V3 — Project Types
   ============================================================ */

/** Project lifecycle status */
export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived';

/** Task completion status */
export type TaskStatus =
  | 'todo'
  | 'in-progress'
  | 'in-review'
  | 'completed'
  | 'blocked';

/** Priority level (1 = critical, 5 = low) */
export type PriorityLevel = 1 | 2 | 3 | 4 | 5;

/** Priority labels mapped to levels */
export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
  5: 'Minimal',
} as const;

/** Status display configuration */
export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  planning: { label: 'Planning', color: 'var(--color-info)' },
  active: { label: 'Active', color: 'var(--color-success)' },
  paused: { label: 'Paused', color: 'var(--color-warning)' },
  completed: { label: 'Completed', color: 'var(--accent-cyan)' },
  archived: { label: 'Archived', color: 'var(--text-tertiary)' },
} as const;

/** Task status display configuration */
export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  'todo': { label: 'To Do', color: 'var(--text-secondary)' },
  'in-progress': { label: 'In Progress', color: 'var(--accent-cyan)' },
  'in-review': { label: 'In Review', color: 'var(--accent-violet)' },
  'completed': { label: 'Completed', color: 'var(--color-success)' },
  'blocked': { label: 'Blocked', color: 'var(--color-danger)' },
} as const;

/** Tag/label for categorization */
export interface Tag {
  id: string;
  name: string;
  color: string;
}

/** A single task within a milestone */
export interface Task {
  id: string;
  projectId: string;
  milestoneId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  tags: Tag[];
  assignee: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  dueDate: string | null;
  completedAt: string | null;
  dependencies: string[];
  subtasks: Subtask[];
  notes: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight subtask within a task */
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

/** A milestone grouping tasks */
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  targetDate: string | null;
  completedAt: string | null;
  tasks: Task[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Project entity */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  color: string;
  icon: string;
  tags: Tag[];
  milestones: Milestone[];
  unassignedTasks: Task[];
  startDate: string | null;
  targetDate: string | null;
  completedAt: string | null;
  repository: string | null;
  liveUrl: string | null;
  budget: ProjectBudget | null;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

/** Budget tracking for a project */
export interface ProjectBudget {
  estimated: number;
  spent: number;
  currency: string;
}

/** Progress log entry for tracking work over time */
export interface ProgressLog {
  id: string;
  projectId: string;
  taskId: string | null;
  date: string;
  hoursWorked: number;
  description: string;
  mood: ProgressMood;
  blockers: string[];
  createdAt: string;
}

/** Daily mood/sentiment for progress tracking */
export type ProgressMood = 'great' | 'good' | 'neutral' | 'struggling' | 'blocked';

/** Summary stats for a project */
export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  totalHoursEstimated: number;
  totalHoursActual: number;
  milestonesCompleted: number;
  milestonesTotal: number;
  daysRemaining: number | null;
  velocityPerDay: number;
}

/* ── Form Input Types ── */

/** Create/edit project form */
export interface ProjectFormInput {
  name: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  color: string;
  icon: string;
  tags: string[];
  startDate: string;
  targetDate: string;
  repository: string;
  liveUrl: string;
  budgetEstimated: number | null;
  budgetCurrency: string;
}

/** Create/edit task form */
export interface TaskFormInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  milestoneId: string;
  tags: string[];
  assignee: string;
  estimatedHours: number | null;
  dueDate: string;
  dependencies: string[];
  notes: string;
}

/** Create/edit milestone form */
export interface MilestoneFormInput {
  title: string;
  description: string;
  targetDate: string;
}

/** Filters for project list views */
export interface ProjectFilters {
  status: ProjectStatus[];
  priority: PriorityLevel[];
  tags: string[];
  search: string;
  sortBy: 'name' | 'updatedAt' | 'createdAt' | 'priority' | 'progress';
  sortDirection: 'asc' | 'desc';
}

/** Filters for task list views */
export interface TaskFilters {
  status: TaskStatus[];
  priority: PriorityLevel[];
  tags: string[];
  assignee: string | null;
  search: string;
  sortBy: 'title' | 'priority' | 'dueDate' | 'status' | 'updatedAt';
  sortDirection: 'asc' | 'desc';
}
