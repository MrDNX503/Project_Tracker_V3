/* ============================================================
   KashFinance Project Tracker V3 — Skeleton Component
   ============================================================ */

import type { CSSProperties } from 'react';

/* ── Types ── */

export type SkeletonVariant = 'text' | 'circle' | 'card' | 'rect';

export interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Alias for variant */
  type?: SkeletonVariant;
  /** Width (CSS value). Defaults vary by variant */
  width?: string | number;
  /** Height (CSS value). Defaults vary by variant */
  height?: string | number;
  /** Border radius override */
  borderRadius?: string;
  /** Number of text lines to render (only for variant="text") */
  lines?: number;
  /** Whether to animate the shimmer */
  animated?: boolean;
  /** Additional inline styles */
  style?: CSSProperties;
}

/* ── Styles ── */

const shimmerStyle: CSSProperties = {
  background: `linear-gradient(
    90deg,
    var(--bg-surface-raised) 0%,
    var(--border-subtle) 40%,
    var(--bg-surface-raised) 80%
  )`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.8s ease-in-out infinite',
};

const staticStyle: CSSProperties = {
  background: 'var(--bg-surface-raised)',
};

const variantDefaults: Record<
  SkeletonVariant,
  { width: string; height: string; borderRadius: string }
> = {
  text: { width: '100%', height: '0.875rem', borderRadius: 'var(--radius-sm)' },
  circle: { width: '2.5rem', height: '2.5rem', borderRadius: '50%' },
  card: { width: '100%', height: '8rem', borderRadius: 'var(--radius-xl)' },
  rect: { width: '100%', height: '2.5rem', borderRadius: 'var(--radius-md)' },
};

/* ── Component ── */

export function Skeleton({
  variant,
  type,
  width,
  height,
  borderRadius,
  lines = 1,
  animated = true,
  style,
}: SkeletonProps) {
  variant = variant ?? type ?? 'text';
  const defaults = variantDefaults[variant];
  const baseAnimation = animated ? shimmerStyle : staticStyle;

  const resolvedWidth = width
    ? typeof width === 'number'
      ? `${width}px`
      : width
    : defaults.width;
  const resolvedHeight = height
    ? typeof height === 'number'
      ? `${height}px`
      : height
    : defaults.height;

  // Multi-line text skeleton
  if (variant === 'text' && lines > 1) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          width: resolvedWidth,
          ...style,
        }}
        role="status"
        aria-label="Loading content"
      >
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            style={{
              ...baseAnimation,
              height: resolvedHeight,
              borderRadius: borderRadius || defaults.borderRadius,
              // Last line is shorter for visual variety
              width: i === lines - 1 ? '75%' : '100%',
            }}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Single skeleton element
  return (
    <div
      role="status"
      aria-label="Loading content"
      style={{
        ...baseAnimation,
        width: resolvedWidth,
        height: resolvedHeight,
        borderRadius: borderRadius || defaults.borderRadius,
        flexShrink: 0,
        ...style,
      }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/* ── Compound Skeletons ── */

/** Pre-composed skeleton for a typical card */
export function SkeletonCard({ animated = true }: { animated?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.5rem',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
      }}
      role="status"
      aria-label="Loading card"
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Skeleton variant="circle" width="2rem" height="2rem" animated={animated} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <Skeleton variant="text" width="60%" animated={animated} />
          <Skeleton variant="text" width="40%" height="0.75rem" animated={animated} />
        </div>
      </div>
      {/* Body */}
      <Skeleton variant="text" lines={3} animated={animated} />
      {/* Footer */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Skeleton variant="rect" width="4rem" height="1.5rem" borderRadius="var(--radius-full)" animated={animated} />
        <Skeleton variant="rect" width="3rem" height="1.5rem" borderRadius="var(--radius-full)" animated={animated} />
      </div>
    </div>
  );
}

/** Pre-composed skeleton for a list item */
export function SkeletonListItem({ animated = true }: { animated?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
      }}
      role="status"
      aria-label="Loading item"
    >
      <Skeleton variant="circle" width="2rem" height="2rem" animated={animated} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <Skeleton variant="text" width="70%" animated={animated} />
        <Skeleton variant="text" width="45%" height="0.75rem" animated={animated} />
      </div>
      <Skeleton variant="rect" width="3rem" height="1.5rem" borderRadius="var(--radius-full)" animated={animated} />
    </div>
  );
}

export default Skeleton;
