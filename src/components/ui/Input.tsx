/* ============================================================
   KashFinance Project Tracker V3 — Input Component
   ============================================================ */

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';

/* ── Types ── */

export type InputVariant = 'default' | 'glass';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Hint text displayed below the input (hidden when error is shown) */
  hint?: string;
  /** Icon rendered at the start of the input */
  icon?: ReactNode;
  /** Content rendered at the end of the input */
  suffix?: ReactNode;
  /** Visual variant */
  variant?: InputVariant;
  /** Full width */
  fullWidth?: boolean;
}

/* ── Styles ── */

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)' as unknown as number,
  color: 'var(--text-secondary)',
  userSelect: 'none',
};

const inputContainerBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderRadius: 'var(--radius-lg)',
  transition: 'all var(--transition-fast)',
  cursor: 'text',
  minHeight: '2.5rem',
};

const variantContainerStyles: Record<InputVariant, React.CSSProperties> = {
  default: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    padding: '0.5rem 0.75rem',
  },
  glass: {
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--border-subtle)',
    padding: '0.5rem 0.75rem',
  },
};

const inputBase: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'var(--text-primary)',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)',
  lineHeight: 'var(--leading-normal)',
  width: '100%',
  minWidth: 0,
};

const iconStyle: React.CSSProperties = {
  display: 'flex',
  flexShrink: 0,
  color: 'var(--text-tertiary)',
  transition: 'color var(--transition-fast)',
};

const helperBase: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  lineHeight: 'var(--leading-normal)',
};

/* ── Component ── */

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      suffix,
      variant = 'default',
      fullWidth = true,
      disabled,
      id,
      style,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint && !error ? `${inputId}-hint` : undefined;

    const containerStyle: React.CSSProperties = {
      ...inputContainerBase,
      ...variantContainerStyles[variant],
      ...(focused
        ? {
            borderColor: error ? 'var(--color-danger)' : 'var(--accent-cyan)',
            boxShadow: error
              ? '0 0 0 3px var(--color-danger-soft)'
              : '0 0 0 3px rgba(0, 212, 255, 0.15)',
          }
        : {}),
      ...(error && !focused
        ? {
            borderColor: 'var(--color-danger)',
          }
        : {}),
      ...(disabled
        ? {
            opacity: 0.5,
            cursor: 'not-allowed',
          }
        : {}),
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    return (
      <div style={{ ...wrapperStyle, ...(fullWidth ? { width: '100%' } : {}), ...style }}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}

        <div
          style={containerStyle}
          onClick={() => {
            const input = document.getElementById(inputId || '');
            input?.focus();
          }}
        >
          {icon && (
            <span
              style={{
                ...iconStyle,
                ...(focused ? { color: error ? 'var(--color-danger)' : 'var(--accent-cyan)' } : {}),
              }}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            style={inputBase}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={!!error}
            aria-describedby={errorId || hintId}
            {...rest}
          />

          {suffix && (
            <span style={iconStyle} aria-hidden="true">
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <span id={errorId} style={{ ...helperBase, color: 'var(--color-danger)' }} role="alert">
            {error}
          </span>
        )}

        {hint && !error && (
          <span id={hintId} style={{ ...helperBase, color: 'var(--text-tertiary)' }}>
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
