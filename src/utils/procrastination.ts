// ============================================
// Procrastination Detection Engine
// ============================================

import type { Project, Task, ProgressLog } from '../types';
import { getTodayISO, daysBetween } from './dates';

export interface ProcrastinationReport {
  overallScore: number; // 0-100, higher = more procrastination
  level: 'none' | 'mild' | 'moderate' | 'severe';
  indicators: ProcrastinationIndicator[];
  suggestions: string[];
}

export interface ProcrastinationIndicator {
  type: 'idle_days' | 'overdue_tasks' | 'low_velocity' | 'mood_decline' | 'skipped_plans';
  label: string;
  severity: 'low' | 'medium' | 'high';
  value: number;
  description: string;
}

/**
 * Analyze procrastination patterns from project data
 */
export function detectProcrastination(
  projects: Project[],
  tasks: Task[],
  logs: ProgressLog[],
  options: {
    daysSinceLastLog?: number;
    overdueTaskCount?: number;
    completedTasksLast7Days?: number;
    skippedPlansCount?: number;
  } = {}
): ProcrastinationReport {
  const indicators: ProcrastinationIndicator[] = [];
  const today = getTodayISO();

  // 1. Days since last progress log
  const daysSinceLog = options.daysSinceLastLog ?? calculateDaysSinceLastLog(logs);
  if (daysSinceLog > 0) {
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (daysSinceLog > 7) severity = 'high';
    else if (daysSinceLog > 3) severity = 'medium';

    indicators.push({
      type: 'idle_days',
      label: 'Idle Days',
      severity,
      value: daysSinceLog,
      description: daysSinceLog === 1
        ? 'No progress logged yesterday'
        : `No progress logged in ${daysSinceLog} days`,
    });
  }

  // 2. Overdue tasks
  const overdueTasks = options.overdueTaskCount ?? countOverdueTasks(tasks, today);
  if (overdueTasks > 0) {
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (overdueTasks > 5) severity = 'high';
    else if (overdueTasks > 2) severity = 'medium';

    indicators.push({
      type: 'overdue_tasks',
      label: 'Overdue Tasks',
      severity,
      value: overdueTasks,
      description: `${overdueTasks} task${overdueTasks === 1 ? '' : 's'} past due date`,
    });
  }

  // 3. Task completion velocity (declining)
  const completedLast7 = options.completedTasksLast7Days ?? countRecentCompletions(tasks, 7);
  const totalActive = tasks.filter(
    (t) => t.status === 'todo' || t.status === 'in_progress'
  ).length;

  if (totalActive > 0 && completedLast7 === 0) {
    indicators.push({
      type: 'low_velocity',
      label: 'Zero Velocity',
      severity: 'high',
      value: 0,
      description: 'No tasks completed in the last 7 days',
    });
  } else if (totalActive > 5 && completedLast7 < 2) {
    indicators.push({
      type: 'low_velocity',
      label: 'Low Velocity',
      severity: 'medium',
      value: completedLast7,
      description: `Only ${completedLast7} task${completedLast7 === 1 ? '' : 's'} completed in 7 days with ${totalActive} remaining`,
    });
  }

  // 4. Mood trends (if logs have mood data)
  const recentMoods = logs
    .filter((l) => l.mood)
    .slice(0, 10)
    .map((l) => l.mood);

  const negativeMoods = recentMoods.filter(
    (m) => m === 'procrastinating' || m === 'struggling'
  ).length;

  if (recentMoods.length >= 3 && negativeMoods > recentMoods.length / 2) {
    indicators.push({
      type: 'mood_decline',
      label: 'Mood Declining',
      severity: 'medium',
      value: Math.round((negativeMoods / recentMoods.length) * 100),
      description: `${negativeMoods} of last ${recentMoods.length} logs report struggling/procrastinating`,
    });
  }

  // 5. Skipped planned items
  const skippedPlans = options.skippedPlansCount ?? 0;
  if (skippedPlans > 2) {
    indicators.push({
      type: 'skipped_plans',
      label: 'Skipped Plans',
      severity: skippedPlans > 5 ? 'high' : 'medium',
      value: skippedPlans,
      description: `${skippedPlans} planned items were skipped recently`,
    });
  }

  // Calculate overall score
  const overallScore = calculateOverallScore(indicators);
  const level = getLevel(overallScore);

  // Generate suggestions
  const suggestions = generateSuggestions(indicators, projects, tasks);

  return {
    overallScore,
    level,
    indicators,
    suggestions,
  };
}

function calculateDaysSinceLastLog(logs: ProgressLog[]): number {
  if (logs.length === 0) return 0;
  const lastLog = logs[0]; // Assumes sorted desc
  if (!lastLog.logged_at) return 0;
  return Math.max(0, daysBetween(lastLog.logged_at.split('T')[0], getTodayISO()));
}

function countOverdueTasks(tasks: Task[], today: string): number {
  return tasks.filter(
    (t) =>
      (t.status === 'todo' || t.status === 'in_progress') &&
      t.due_date &&
      t.due_date < today
  ).length;
}

function countRecentCompletions(tasks: Task[], days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();

  return tasks.filter(
    (t) => t.status === 'done' && t.completed_date && t.completed_date >= cutoffStr
  ).length;
}

function calculateOverallScore(indicators: ProcrastinationIndicator[]): number {
  if (indicators.length === 0) return 0;

  let score = 0;
  for (const ind of indicators) {
    const severityWeight = ind.severity === 'high' ? 30 : ind.severity === 'medium' ? 20 : 10;
    score += severityWeight;
  }

  return Math.min(100, score);
}

function getLevel(score: number): ProcrastinationReport['level'] {
  if (score === 0) return 'none';
  if (score <= 25) return 'mild';
  if (score <= 60) return 'moderate';
  return 'severe';
}

function generateSuggestions(
  indicators: ProcrastinationIndicator[],
  _projects: Project[],
  tasks: Task[]
): string[] {
  const suggestions: string[] = [];

  for (const ind of indicators) {
    switch (ind.type) {
      case 'idle_days':
        suggestions.push('Log at least one progress update today — even a small note counts!');
        break;
      case 'overdue_tasks': {
        const overdueTask = tasks.find(
          (t) => (t.status === 'todo' || t.status === 'in_progress') && t.due_date && t.due_date < getTodayISO()
        );
        if (overdueTask) {
          suggestions.push(`Tackle "${overdueTask.title}" first — it's overdue and blocking progress.`);
        }
        break;
      }
      case 'low_velocity':
        suggestions.push('Break larger tasks into smaller, 15-minute chunks to build momentum.');
        break;
      case 'mood_decline':
        suggestions.push('Consider taking a short break or switching to a different project to reset.');
        break;
      case 'skipped_plans':
        suggestions.push('Review your daily plan — are you overcommitting? Try planning fewer, more realistic tasks.');
        break;
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('You\'re doing great! Keep up the momentum, MrDNX! 🚀');
  }

  return suggestions;
}
