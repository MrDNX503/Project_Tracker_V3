// ============================================
// Progress & Analytics Calculation Helpers
// ============================================

import type { Project, Task } from '../types';

/**
 * Calculate project progress based on completed tasks
 */
export function calculateProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'done').length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Calculate progress with weighted priorities
 */
export function calculateWeightedProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  let totalWeight = 0;
  let completedWeight = 0;

  for (const task of tasks) {
    const weight = task.priority;
    totalWeight += weight;
    if (task.status === 'done') {
      completedWeight += weight;
    }
  }

  return totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Get task completion velocity (tasks per day over last N days)
 */
export function getCompletionVelocity(
  tasks: Task[],
  daysBack: number = 7
): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);

  const completedRecently = tasks.filter(
    (t) => t.status === 'done' && t.completed_date && new Date(t.completed_date) >= cutoff
  ).length;

  return Math.round((completedRecently / daysBack) * 10) / 10;
}

/**
 * Estimate time to completion based on current velocity
 */
export function estimateCompletion(
  tasks: Task[],
  velocityDays: number = 7
): { days: number; date: string } | null {
  const remaining = tasks.filter(
    (t) => t.status !== 'done' && t.status !== 'cancelled'
  ).length;

  if (remaining === 0) {
    return { days: 0, date: new Date().toISOString().split('T')[0] };
  }

  const velocity = getCompletionVelocity(tasks, velocityDays);
  if (velocity <= 0) return null; // Can't estimate without velocity

  const daysToComplete = Math.ceil(remaining / velocity);
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysToComplete);

  return {
    days: daysToComplete,
    date: estimatedDate.toISOString().split('T')[0],
  };
}

/**
 * Get project health status
 */
export function getProjectHealth(
  project: Project,
  tasks: Task[]
): 'on-track' | 'at-risk' | 'behind' | 'completed' {
  if (project.status === 'completed') return 'completed';

  const progress = calculateProjectProgress(tasks);

  if (!project.target_date) {
    return progress >= 50 ? 'on-track' : 'at-risk';
  }

  const now = new Date();
  const target = new Date(project.target_date);
  const start = project.start_date ? new Date(project.start_date) : new Date(project.created_at);

  const totalDuration = target.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const expectedProgress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100;

  if (now > target && progress < 100) return 'behind';
  if (progress >= expectedProgress - 10) return 'on-track';
  if (progress >= expectedProgress - 25) return 'at-risk';
  return 'behind';
}

/**
 * Get summary statistics for a set of projects
 */
export function getProjectStats(projects: Project[]): {
  total: number;
  active: number;
  completed: number;
  paused: number;
  avgProgress: number;
} {
  const active = projects.filter((p) => p.status === 'active').length;
  const completed = projects.filter((p) => p.status === 'completed').length;
  const paused = projects.filter((p) => p.status === 'paused').length;

  const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
  const avgProgress = projects.length > 0 ? Math.round(totalProgress / projects.length) : 0;

  return {
    total: projects.length,
    active,
    completed,
    paused,
    avgProgress,
  };
}

/**
 * Calculate streak (consecutive days with progress logs)
 */
export function calculateStreak(
  logDates: string[] // Array of YYYY-MM-DD strings, sorted desc
): number {
  if (logDates.length === 0) return 0;

  const uniqueDates = [...new Set(logDates)].sort().reverse();
  const today = new Date().toISOString().split('T')[0];

  // Check if there's a log for today or yesterday
  if (uniqueDates[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (uniqueDates[0] !== yesterday.toISOString().split('T')[0]) {
      return 0;
    }
  }

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Group tasks by status for kanban-style views
 */
export function groupTasksByStatus(
  tasks: Task[]
): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
    cancelled: [],
  };

  for (const task of tasks) {
    if (groups[task.status]) {
      groups[task.status].push(task);
    }
  }

  return groups;
}
