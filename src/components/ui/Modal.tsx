/* ============================================================
   KashFinance Project Tracker V3 — Modal Component
   ============================================================ */

import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { X } from 'lucide-react';

/* ── Types ── */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /** Whether the modal is open (defaults to true for imperatively-mounted modals) */
  isOpen?: boolean;
  /** Explicit width override (CSS value) */
  width?: string;
  /** Callback when the modal requests to close */
  onClose: () => void;
  /** Modal title displayed in the header */
  title?: string;
  /** Optional description below the title */
  description?: string;
  /** Modal size variant */
  size?: ModalSize;
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Whether to show the close button */
  showClose?: boolean;
  /** Footer content (typically action buttons) */
  footer?: ReactNode;
  /** Modal body content */
  children: ReactNode;
}

/* ── Styles ── */

const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 'var(--z-modal)' as unknown as number,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  background: 'var(--bg-overlay)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  animation: 'backdrop-fade 200ms ease both',
};

const sizeWidths: Record<ModalSize, string> = {
  sm: '24rem',
  md: '32rem',
  lg: '42rem',
  xl: '56rem',
  full: 'calc(100vw - 2rem)',
};

const panelBase: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'calc(100vh - 2rem)',
  background: 'var(--bg-glass-heavy)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-2xl)',
  boxShadow: 'var(--shadow-xl)',
  animation: 'modal-enter 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
  overflow: 'hidden',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '1.5rem 1.5rem 0 1.5rem',
};

const titleStyle: CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontWeight: 'var(--font-semibold)' as unknown as number,
  color: 'var(--text-primary)',
  lineHeight: 'var(--leading-tight)',
};

const descriptionStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--text-secondary)',
  marginTop: '0.25rem',
  lineHeight: 'var(--leading-normal)',
};

const closeButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-tertiary)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  flexShrink: 0,
};

const bodyStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.5rem',
};

const footerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  padding: '1rem 1.5rem',
  borderTop: '1px solid var(--border-subtle)',
};

/* ── Focus Trap Utility ── */

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ── Component ── */

export function Modal({
  isOpen = true,
  width,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showClose = true,
  footer,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store previously focused element and restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the panel after animation
      const timer = setTimeout(() => {
        if (panelRef.current) {
          const firstFocusable = panelRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
          firstFocusable?.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  if (!isOpen) return null;

  return (
    <div
      style={backdropStyle}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        style={{
          ...panelBase,
          width: '100%',
          maxWidth: width ?? sizeWidths[size],
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        {(title || showClose) && (
          <div style={headerStyle}>
            <div>
              {title && (
                <h2 id="modal-title" style={titleStyle}>
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" style={descriptionStyle}>
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                style={closeButtonStyle}
                aria-label="Close modal"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-surface-raised)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={bodyStyle}>{children}</div>

        {/* Footer */}
        {footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
