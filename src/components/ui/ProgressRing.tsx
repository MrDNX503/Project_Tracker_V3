/* ============================================================
   KashFinance Project Tracker V3 — ProgressRing Component
   ============================================================ */

import { useEffect, useRef, type CSSProperties } from 'react';

/* ── Types ── */

export interface ProgressRingProps {
  /** Progress value (0–100) */
  value?: number;
  /** Alias for value (0–100) */
  progress?: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Ring stroke width in pixels */
  strokeWidth?: number;
  /** Custom color for the progress arc */
  color?: string;
  /** Custom color for the track */
  trackColor?: string;
  /** Center label text (overrides default percentage) */
  label?: string;
  /** Whether to show the center label */
  showLabel?: boolean;
  /** Label font size override */
  labelSize?: string;
  /** Whether to animate the fill on mount */
  animated?: boolean;
  /** Optional accessible label */
  ariaLabel?: string;
}

/* ── Color Thresholds ── */

function getAutoColor(percent: number): string {
  if (percent >= 80) return 'var(--color-success)';
  if (percent >= 50) return 'var(--accent-cyan)';
  if (percent >= 25) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

/* ── Component ── */

export function ProgressRing({
  value,
  progress,
  size = 64,
  strokeWidth = 5,
  color,
  trackColor,
  label,
  showLabel = true,
  labelSize,
  animated = true,
  ariaLabel,
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const percent = Math.min(100, Math.max(0, value ?? progress ?? 0));
  const resolvedColor = color || getAutoColor(percent);

  // SVG calculations
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  // Unique gradient ID
  const gradientId = `progress-ring-gradient-${size}-${percent}`;

  // Animate on mount
  useEffect(() => {
    if (!animated || !circleRef.current) return;
    const circle = circleRef.current;
    circle.style.strokeDashoffset = `${circumference}`;

    const raf = requestAnimationFrame(() => {
      circle.style.transition = 'stroke-dashoffset 800ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      circle.style.strokeDashoffset = `${offset}`;
    });

    return () => cancelAnimationFrame(raf);
  }, [circumference, offset, animated]);

  // Compute font size based on ring size
  const computedLabelSize = labelSize || `${Math.max(10, size * 0.22)}px`;
  const subLabelSize = `${Math.max(8, size * 0.14)}px`;

  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
  };

  return (
    <div
      style={containerStyle}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || `Progress: ${Math.round(percent)}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', position: 'absolute' }}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={resolvedColor} />
            <stop offset="100%" stopColor="var(--accent-violet)" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor || 'var(--bg-surface-raised)'}
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : offset}
          style={{
            transition: animated ? 'none' : 'stroke-dashoffset 600ms ease',
            filter: percent > 0 ? `drop-shadow(0 0 4px ${resolvedColor})` : 'none',
          }}
        />
      </svg>

      {/* Center label */}
      {showLabel && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: computedLabelSize,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            {label || `${Math.round(percent)}`}
          </span>
          {!label && (
            <span
              style={{
                fontSize: subLabelSize,
                color: 'var(--text-tertiary)',
                lineHeight: 1,
                marginTop: '1px',
              }}
            >
              %
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProgressRing;
