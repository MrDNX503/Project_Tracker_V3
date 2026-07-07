/* ============================================================
   KashFinance Project Tracker V3 — Badge Component
   ============================================================ */

import type { ReactNode, CSSProperties } from 'react';
import type { ProjectStatus, TaskStatus, PriorityLevel } from '../../types/project';

/* ── Types ── */

export type BadgeVariant = 'status' | 'priority' | 'default' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Display text */
  children?: ReactNode;
  /** Alternate display text (used when no children provided) */
  text?: ReactNode;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Custom color override */
  color?: string;
  /** Optional icon before text */
  icon?: ReactNode;
  /** Whether to show a pulsing dot indicator */
  dot?: boolean;
}

export interface StatusBadgeProps {
  status: ProjectStatus | TaskStatus;
  size?: BadgeSize;
}

export interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: BadgeSize;
}

/* ── Color Maps ── */

const statusColors: Record<ProjectStatus | TaskStatus, { bg: string; text: string; dot: string }> = {
  planning: { bg: 'var(--color-info-soft)', text: 'var(--color-info)', dot: 'var(--color-info)' },
  active: { bg: 'var(--color-success-soft)', text: 'var(--color-success)', dot: 'var(--color-success)' },
  paused: { bg: 'var(--color-warning-soft)', text: 'var(--color-warning)', dot: 'var(--color-warning)' },
  completed: { bg: 'rgba(0, 212, 255, 0.12)', text: 'var(--accent-cyan)', dot: 'var(--accent-cyan)' },
  archived: { bg: 'rgba(100, 116, 139, 0.12)', text: 'var(--text-tertiary)', dot: 'var(--text-tertiary)' },
  'todo': { bg: 'rgba(148, 163, 184, 0.12)', text: 'var(--text-secondary)', dot: 'var(--text-secondary)' },
  'in-progress': { bg: 'rgba(0, 212, 255, 0.12)', text: 'var(--accent-cyan)', dot: 'var(--accent-cyan)' },
  'in-review': { bg: 'rgba(139, 92, 246, 0.12)', text: 'var(--accent-violet)', dot: 'var(--accent-violet)' },
  'blocked': { bg: 'var(--color-danger-soft)', text: 'var(--color-danger)', dot: 'var(--color-danger)' },
};

const statusLabels: Record<ProjectStatus | TaskStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  'blocked': 'Blocked',
};

const priorityColors: Record<PriorityLevel, { bg: string; text: string }> = {
  1: { bg: 'var(--color-danger-soft)', text: 'var(--color-danger)' },
  2: { bg: 'var(--color-warning-soft)', text: 'var(--color-warning)' },
  3: { bg: 'var(--color-info-soft)', text: 'var(--color-info)' },
  4: { bg: 'var(--color-success-soft)', text: 'var(--color-success)' },
  5: { bg: 'rgba(148, 163, 184, 0.12)', text: 'var(--text-secondary)' },
};

const priorityLabels: Record<PriorityLevel, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
  5: 'Minimal',
};

/* ── Styles ── */

const sizeMap: Record<BadgeSize, CSSProperties> = {
  sm: {
    padding: '0.125rem 0.5rem',
    fontSize: 'var(--text-xs)',
    gap: '0.25rem',
  },
  md: {
    padding: '0.25rem 0.625rem',
    fontSize: 'var(--text-sm)',
    gap: '0.375rem',
  },
};

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 'var(--radius-full)',
  fontWeight: 'var(--font-medium)' as unknown as number,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  userSelect: 'none',
  transition: 'all var(--transition-fast)',
};

const dotStyle: CSSProperties = {
  width: '0.375rem',
  height: '0.375rem',
  borderRadius: '50%',
  flexShrink: 0,
};

/* ── Components ── */

/** Generic badge with custom color */
const variantColors: Partial<Record<BadgeVariant, string>> = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
};

export function Badge({
  children,
  text,
  variant = 'default',
  size = 'sm',
  color,
  icon,
  dot,
}: BadgeProps) {
  color = color ?? variantColors[variant];
  const bgColor = color
    ? `color-mix(in srgb, ${color} 15%, transparent)`
    : 'var(--bg-surface-raised)';
  const textColor = color || 'var(--text-secondary)';

  return (
    <span
      style={{
        ...baseStyle,
        ...sizeMap[size],
        background: bgColor,
        color: textColor,
      }}
    >
      {dot && <span style={{ ...dotStyle, background: textColor }} />}
      {icon && <span style={{ display: 'flex', flexShrink: 0 }} aria-hidden="true">{icon}</span>}
      {children ?? text}
    </span>
  );
}

/** Pre-configured badge for project/task status */
export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colors = statusColors[status];
  const label = statusLabels[status];

  return (
    <span
      style={{
        ...baseStyle,
        ...sizeMap[size],
        background: colors.bg,
        color: colors.text,
      }}
      role="status"
      aria-label={`Status: ${label}`}
    >
      <span style={{ ...dotStyle, background: colors.dot }} />
      {label}
    </span>
  );
}

/** Pre-configured badge for priority level */
export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const colors = priorityColors[priority];
  const label = priorityLabels[priority];

  return (
    <span
      style={{
        ...baseStyle,
        ...sizeMap[size],
        background: colors.bg,
        color: colors.text,
      }}
      aria-label={`Priority: ${label}`}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>P{priority}</span>
      <span>{label}</span>
    </span>
  );
}

export default Badge;
