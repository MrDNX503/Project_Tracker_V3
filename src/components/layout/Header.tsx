import { useT } from '../../i18n';
import { useState, type CSSProperties } from 'react';
import {
  Search,
  Sun,
  Moon,
  Monitor,
  Bell,
  Sparkles,
  Command,
  Menu,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Tooltip } from '../ui/Tooltip';
import { Button } from '../ui/Button';

/* ── Types ── */

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
  onOpenCommandPalette?: () => void;
  onOpenSusan?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onMenuToggle?: () => void;
}

/* ── Styles ── */

const headerBase: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 'var(--z-header)' as unknown as number,
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  height: 'var(--header-height)',
  padding: '0 1rem',
  background: 'var(--bg-glass)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid var(--border-subtle)',
};

const titleGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.0625rem',
  minWidth: 0,
};

const titleStyle: CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontWeight: 700,
  color: 'var(--text-primary)',
  lineHeight: 'var(--leading-tight)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const subtitleStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--text-tertiary)',
  lineHeight: 1,
};

const searchContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flex: '0 1 20rem',
  padding: '0.375rem 0.75rem',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-lg)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  marginLeft: 'auto',
};

const searchInputStyle: CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'var(--text-primary)',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)',
  minWidth: 0,
};

const kbdStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.125rem 0.375rem',
  fontSize: '0.625rem',
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  background: 'var(--bg-surface-raised)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  lineHeight: 1,
  gap: '0.125rem',
};

const actionsGroupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  marginLeft: 'auto',
};

const iconButtonBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.25rem',
  height: '2.25rem',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-secondary)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  position: 'relative',
};

const notifBadgeStyle: CSSProperties = {
  position: 'absolute',
  top: '0.25rem',
  right: '0.25rem',
  width: '0.75rem',
  height: '0.75rem',
  borderRadius: '50%',
  background: 'var(--color-danger)',
  border: '2px solid var(--bg-glass-heavy)',
  fontSize: '0',
};

/* ── Component ── */

export function Header({
  title = 'Dashboard',
  subtitle,
  onOpenCommandPalette,
  onOpenSusan,
  notificationCount = 0,
  onNotificationClick,
  onMenuToggle,
}: HeaderProps) {
  const t = useT();
  const { themeMode, cycleTheme } = useTheme();
  const [searchFocused] = useState(false);

  const themeIcon = themeMode === 'dark' ? <Moon size={18} /> : themeMode === 'light' ? <Sun size={18} /> : <Monitor size={18} />;
  const themeLabel = themeMode === 'dark' ? 'Dark mode' : themeMode === 'light' ? 'Light mode' : 'System theme';

  return (
    <header style={headerBase}>
      {/* Mobile Menu Toggle */}
      {onMenuToggle && (
        <button
          style={{ ...iconButtonBase, marginRight: '0.5rem' }}
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Title (hidden on very small screens if needed, but flex-shrink helps) */}
      <div style={{ ...titleGroupStyle, flexShrink: 0 }}>
        <h1 style={titleStyle}>{title}</h1>
        {subtitle && <span style={subtitleStyle}>{subtitle}</span>}
      </div>

      {/* Search / Command Palette trigger */}
      {!onMenuToggle && (
        <div
          style={{
            ...searchContainerStyle,
            ...(searchFocused
              ? {
                  borderColor: 'var(--accent-cyan)',
                  boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
                }
              : {}),
          }}
          onClick={() => onOpenCommandPalette?.()}
          role="button"
          tabIndex={0}
          aria-label="Open search (Ctrl+K)"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenCommandPalette?.();
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.background = 'var(--bg-surface-raised)';
          }}
          onMouseLeave={(e) => {
            if (!searchFocused) {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'var(--bg-surface)';
            }
          }}
        >
          <Search size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} aria-hidden="true" />
          <span style={{ ...searchInputStyle, color: 'var(--text-tertiary)' }}>
            {t('header.search')}
          </span>
          <kbd style={kbdStyle}>
            <Command size={10} /> K
          </kbd>
        </div>
      )}

      {/* Action buttons */}
      <div style={actionsGroupStyle}>
        {onMenuToggle && (
          <button
            style={iconButtonBase}
            onClick={() => onOpenCommandPalette?.()}
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        )}
      
        {/* Theme toggle */}
        <Tooltip content={`Theme: ${themeLabel} (click to toggle)`} position="bottom">
          <button
            style={iconButtonBase}
            onClick={cycleTheme}
            aria-label={`Switch theme. Currently: ${themeLabel}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface-raised)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {themeIcon}
          </button>
        </Tooltip>

        {/* Notifications */}
        <Tooltip content="Notifications" position="bottom">
          <button
            style={iconButtonBase}
            onClick={onNotificationClick}
            aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface-raised)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Bell size={18} />
            {notificationCount > 0 && <span style={notifBadgeStyle} aria-hidden="true" />}
          </button>
        </Tooltip>

        {/* Talk to Susan */}
        <Button
          variant="primary"
          size="sm"
          icon={<Sparkles size={14} />}
          onClick={onOpenSusan}
          aria-label="Talk to Susan AI"
          style={{ marginLeft: '0.25rem' }}
        >
          <span style={{ display: onMenuToggle ? 'none' : 'inline' }}>Susan</span>
        </Button>
      </div>
    </header>
  );
}

export default Header;
