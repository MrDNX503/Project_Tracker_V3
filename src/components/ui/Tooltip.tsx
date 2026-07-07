/* ============================================================
   KashFinance Project Tracker V3 — Tooltip Component
   ============================================================ */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from 'react';

/* ── Types ── */

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Tooltip text content */
  content: string;
  /** Preferred position (auto-adjusts if clipped) */
  position?: TooltipPosition;
  /** Delay before showing (ms) */
  delay?: number;
  /** Element that triggers the tooltip */
  children: ReactNode;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
}

/* ── Styles ── */

const wrapperStyle: CSSProperties = {
  display: 'inline-flex',
  position: 'relative',
};

const tooltipBase: CSSProperties = {
  position: 'absolute',
  zIndex: 'var(--z-tooltip)' as unknown as number,
  padding: '0.375rem 0.625rem',
  fontSize: 'var(--text-xs)',
  fontWeight: 500,
  color: 'var(--text-primary)',
  background: 'var(--bg-glass-heavy)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-md)',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  animation: 'fadeIn 150ms ease both',
  lineHeight: 1.4,
};

const arrowBase: CSSProperties = {
  position: 'absolute',
  width: '0.5rem',
  height: '0.5rem',
  background: 'var(--bg-glass-heavy)',
  border: '1px solid var(--border-default)',
  transform: 'rotate(45deg)',
};

const positionStyles: Record<
  TooltipPosition,
  { tooltip: CSSProperties; arrow: CSSProperties }
> = {
  top: {
    tooltip: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: '0.5rem',
    },
    arrow: {
      bottom: '-0.3rem',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
      borderTop: 'none',
      borderLeft: 'none',
    },
  },
  bottom: {
    tooltip: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '0.5rem',
    },
    arrow: {
      top: '-0.3rem',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
      borderBottom: 'none',
      borderRight: 'none',
    },
  },
  left: {
    tooltip: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: '0.5rem',
    },
    arrow: {
      right: '-0.3rem',
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
      borderBottom: 'none',
      borderLeft: 'none',
    },
  },
  right: {
    tooltip: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '0.5rem',
    },
    arrow: {
      left: '-0.3rem',
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
      borderTop: 'none',
      borderRight: 'none',
    },
  },
};

/* ── Component ── */

export function Tooltip({
  content,
  position = 'top',
  delay = 300,
  children,
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (disabled) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay, disabled]);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const posStyle = positionStyles[position];

  return (
    <div
      ref={wrapperRef}
      style={wrapperStyle}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && content && (
        <div
          role="tooltip"
          style={{ ...tooltipBase, ...posStyle.tooltip }}
        >
          {content}
          <span style={{ ...arrowBase, ...posStyle.arrow }} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
