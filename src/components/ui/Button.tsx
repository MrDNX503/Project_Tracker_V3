/* ============================================================
   KashFinance Project Tracker V3 — Button Component
   ============================================================ */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/* ── Types ── */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

/* ── Styles ── */

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  fontFamily: 'var(--font-sans)',
  fontWeight: 'var(--font-medium)' as unknown as number,
  borderRadius: 'var(--radius-lg)',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  position: 'relative',
  overflow: 'hidden',
  textDecoration: 'none',
  lineHeight: 1,
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--susan-glow)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
  },
  secondary: {
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-default)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--color-danger-soft)',
    color: 'var(--color-danger)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: '0.375rem 0.75rem',
    fontSize: 'var(--text-sm)',
    borderRadius: 'var(--radius-md)',
    minHeight: '2rem',
  },
  md: {
    padding: '0.5rem 1rem',
    fontSize: 'var(--text-sm)',
    minHeight: '2.5rem',
  },
  lg: {
    padding: '0.75rem 1.5rem',
    fontSize: 'var(--text-base)',
    minHeight: '3rem',
  },
};

const hoverOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  opacity: 0,
  transition: 'opacity var(--transition-fast)',
  pointerEvents: 'none',
};

const hoverOverlayColors: Record<ButtonVariant, string> = {
  primary: 'rgba(255, 255, 255, 0.1)',
  secondary: 'var(--bg-surface-raised)',
  ghost: 'var(--bg-glass)',
  danger: 'var(--color-danger-soft)',
};

/* ── Component ── */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconRight,
      fullWidth = false,
      children,
      style,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const combinedStyle: React.CSSProperties = {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...(fullWidth ? { width: '100%' } : {}),
      ...(isDisabled ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' as const } : {}),
      ...style,
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      const overlay = e.currentTarget.querySelector('[data-hover-overlay]') as HTMLElement;
      if (overlay) overlay.style.opacity = '1';
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      const overlay = e.currentTarget.querySelector('[data-hover-overlay]') as HTMLElement;
      if (overlay) overlay.style.opacity = '0';
      onMouseLeave?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={combinedStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...rest}
      >
        {/* Hover overlay */}
        <span
          data-hover-overlay
          style={{
            ...hoverOverlayStyle,
            background: hoverOverlayColors[variant],
          }}
          aria-hidden="true"
        />

        {/* Content */}
        {loading ? (
          <Loader2
            size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
            style={{ animation: 'spin 1s linear infinite' }}
            aria-hidden="true"
          />
        ) : icon ? (
          <span style={{ display: 'flex', flexShrink: 0 }} aria-hidden="true">
            {icon}
          </span>
        ) : null}

        {children && (
          <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
        )}

        {iconRight && !loading && (
          <span style={{ display: 'flex', flexShrink: 0 }} aria-hidden="true">
            {iconRight}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
