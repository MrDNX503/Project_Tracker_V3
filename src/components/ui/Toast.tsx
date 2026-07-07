/* ============================================================
   KashFinance Project Tracker V3 — Toast Component
   ============================================================ */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ── Types ── */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface ToastOptions {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
}

interface ToastContextValue {
  toasts: ToastData[];
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/* ── Context ── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

/* ── Provider ── */

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((options: ToastOptions): string => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const newToast: ToastData = {
      id,
      type: options.type || 'info',
      title: options.title,
      description: options.description,
      duration: options.duration ?? 5000,
      dismissible: options.dismissible ?? true,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ── Toast Container ── */

const containerStyle: CSSProperties = {
  position: 'fixed',
  top: '1rem',
  right: '1rem',
  zIndex: 'var(--z-toast)' as unknown as number,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  pointerEvents: 'none',
  maxWidth: '24rem',
  width: '100%',
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div style={containerStyle} aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* ── Toast Item ── */

const iconMap: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const typeColors: Record<ToastType, { icon: string; border: string; bg: string }> = {
  success: {
    icon: 'var(--color-success)',
    border: 'rgba(16, 185, 129, 0.3)',
    bg: 'var(--color-success-soft)',
  },
  error: {
    icon: 'var(--color-danger)',
    border: 'rgba(239, 68, 68, 0.3)',
    bg: 'var(--color-danger-soft)',
  },
  warning: {
    icon: 'var(--color-warning)',
    border: 'rgba(245, 158, 11, 0.3)',
    bg: 'var(--color-warning-soft)',
  },
  info: {
    icon: 'var(--color-info)',
    border: 'rgba(59, 130, 246, 0.3)',
    bg: 'var(--color-info-soft)',
  },
};

const toastItemBase: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  padding: '0.875rem 1rem',
  borderRadius: 'var(--radius-xl)',
  background: 'var(--bg-glass-heavy)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: 'var(--shadow-lg)',
  pointerEvents: 'auto',
  animation: 'toast-enter 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
  position: 'relative',
  overflow: 'hidden',
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colors = typeColors[t.type];

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(t.id), 250);
  }, [onDismiss, t.id]);

  // Auto-dismiss timer
  useEffect(() => {
    if (t.duration && t.duration > 0) {
      timerRef.current = setTimeout(handleDismiss, t.duration);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [t.duration, handleDismiss]);

  // Pause timer on hover
  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (t.duration && t.duration > 0) {
      timerRef.current = setTimeout(handleDismiss, 2000);
    }
  };

  return (
    <div
      role="alert"
      style={{
        ...toastItemBase,
        borderLeft: `3px solid ${colors.icon}`,
        border: `1px solid ${colors.border}`,
        ...(exiting
          ? { animation: 'toast-exit 250ms ease both' }
          : {}),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon */}
      <span style={{ color: colors.icon, flexShrink: 0, marginTop: '0.0625rem' }} aria-hidden="true">
        {iconMap[t.type]}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)' as unknown as number,
            color: 'var(--text-primary)',
            lineHeight: 'var(--leading-tight)',
          }}
        >
          {t.title}
        </div>
        {t.description && (
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            {t.description}
          </div>
        )}
      </div>

      {/* Close */}
      {t.dismissible && (
        <button
          onClick={handleDismiss}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-tertiary)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all var(--transition-fast)',
          }}
          aria-label="Dismiss notification"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.background = 'var(--bg-surface-raised)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-tertiary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={14} />
        </button>
      )}

      {/* Auto-dismiss progress indicator */}
      {t.duration && t.duration > 0 && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2px',
            background: colors.icon,
            opacity: 0.4,
            animation: `progress-fill ${t.duration}ms linear both`,
            transformOrigin: 'left',
            width: '100%',
          }}
        />
      )}
    </div>
  );
}

export default ToastProvider;
