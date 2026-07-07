/* ============================================================
   KashFinance Project Tracker V3 — ProgressBar Component
   ============================================================ */

import { useEffect, useRef, type CSSProperties } from 'react';

/* ── Types ── */

export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  /** Progress value (0–100) */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Size variant */
  size?: ProgressBarSize;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label text (overrides percentage) */
  label?: string;
  /** Custom color override (CSS color value) */
  color?: string;
  /** Whether to animate the fill on mount */
  animated?: boolean;
  /** Optional accessible label */
  ariaLabel?: string;
}

/* ── Styles ── */

const sizeMap: Record<ProgressBarSize, { height: string; fontSize: string; borderRadius: string }> = {
  sm: { height: '0.375rem', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-full)' },
  md: { height: '0.625rem', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-full)' },
  lg: { height: '1rem', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-full)' },
};

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
  width: '100%',
};

const labelRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const trackBase: CSSProperties = {
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  background: 'var(--bg-surface-raised)',
};

const fillBase: CSSProperties = {
  height: '100%',
  borderRadius: 'inherit',
  transition: 'width 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  position: 'relative',
};

const shimmerOverlay: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 2s ease-in-out infinite',
};

/* ── Color Thresholds ── */

function getAutoColor(percent: number): string {
  if (percent >= 80) return 'var(--color-success)';
  if (percent >= 50) return 'var(--accent-cyan)';
  if (percent >= 25) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

function getGradient(color: string): string {
  return `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 70%, var(--accent-violet)))`;
}

/* ── Component ── */

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  label,
  color,
  animated = true,
  ariaLabel,
}: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const resolvedColor = color || getAutoColor(percent);
  const sizeConfig = sizeMap[size];

  // Animate from 0 on mount
  useEffect(() => {
    if (!animated || !fillRef.current) return;
    fillRef.current.style.width = '0%';
    const raf = requestAnimationFrame(() => {
      if (fillRef.current) {
        fillRef.current.style.width = `${percent}%`;
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [percent, animated]);

  return (
    <div style={containerStyle}>
      {(showLabel || label) && (
        <div style={labelRowStyle}>
          {label && (
            <span style={{ fontSize: sizeConfig.fontSize, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {label}
            </span>
          )}
          {showLabel && (
            <span
              style={{
                fontSize: sizeConfig.fontSize,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                marginLeft: 'auto',
              }}
            >
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || label || `Progress: ${Math.round(percent)}%`}
        style={{
          ...trackBase,
          height: sizeConfig.height,
          borderRadius: sizeConfig.borderRadius,
        }}
      >
        <div
          ref={fillRef}
          style={{
            ...fillBase,
            width: animated ? '0%' : `${percent}%`,
            background: getGradient(resolvedColor),
            boxShadow: percent > 5 ? `0 0 8px color-mix(in srgb, ${resolvedColor} 40%, transparent)` : 'none',
          }}
        >
          {percent > 0 && <div style={shimmerOverlay} aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
