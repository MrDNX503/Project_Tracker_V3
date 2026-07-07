/* ============================================================
   KashFinance Project Tracker V3 — Sidebar Component
   ============================================================ */

import { useCallback, type CSSProperties } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

/* ── Types ── */

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export interface SidebarProps {
  activeItem?: string;
  onNavigate?: (item: NavItem) => void;
  expanded?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

/* ── Navigation Config ── */

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { id: 'projects', label: 'Projects', icon: <FolderKanban size={20} />, path: '/projects' },
  { id: 'planner', label: 'Planner', icon: <CalendarDays size={20} />, path: '/planner' },
  { id: 'susan', label: 'Susan AI', icon: <Sparkles size={20} />, path: '/susan' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
];

/* ── Styles ── */

const sidebarBase: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: 'var(--z-sidebar)' as unknown as number,
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--bg-glass-heavy)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRight: '1px solid var(--border-subtle)',
  transition: 'width var(--transition-base), transform var(--transition-base)',
  overflow: 'hidden',
  userSelect: 'none',
};

const logoAreaStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  height: 'var(--header-height)',
  borderBottom: '1px solid var(--border-subtle)',
  flexShrink: 0,
};

const logoTextStyle: CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontWeight: 800,
  background: 'var(--susan-glow)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
};

const navListStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '0.75rem 0.5rem',
  overflowY: 'auto',
  overflowX: 'hidden',
};

const navItemBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 0.75rem',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  border: 'none',
  background: 'transparent',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  position: 'relative',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
};

const navItemActive: CSSProperties = {
  color: 'var(--accent-cyan)',
  background: 'rgba(0, 212, 255, 0.08)',
};

const activeGlow: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  width: '3px',
  height: '60%',
  borderRadius: '0 var(--radius-full) var(--radius-full) 0',
  background: 'var(--susan-glow)',
  boxShadow: '0 0 8px var(--accent-cyan)',
};

const bottomAreaStyle: CSSProperties = {
  borderTop: '1px solid var(--border-subtle)',
  padding: '0.75rem 0.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const susanAvatarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem',
  margin: '0.5rem',
  borderRadius: 'var(--radius-xl)',
  background: 'var(--bg-glass)',
  border: '1px solid var(--border-subtle)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
};

const avatarDotStyle: CSSProperties = {
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  background: 'var(--susan-glow)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  animation: 'pulse-glow 3s ease-in-out infinite',
  fontSize: 'var(--text-xs)',
  fontWeight: 700,
  color: '#fff',
};

const toggleButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.75rem',
  height: '1.75rem',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-surface-raised)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-tertiary)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  position: 'absolute',
  right: '-0.875rem',
  top: '5rem',
  zIndex: 1,
  boxShadow: 'var(--shadow-sm)',
};

/* ── Component ── */

export function Sidebar({
  activeItem = 'dashboard',
  onNavigate,
  expanded = false,
  onToggle,
  isMobile = false,
}: SidebarProps) {
  const handleNavClick = useCallback(
    (item: NavItem) => {
      onNavigate?.(item);
    },
    [onNavigate]
  );

  const width = isMobile ? 'var(--sidebar-width-expanded)' : expanded ? 'var(--sidebar-width-expanded)' : 'var(--sidebar-width-collapsed)';
  const transform = isMobile ? (expanded ? 'translateX(0)' : 'translateX(-100%)') : 'none';

  const renderNavItem = (item: NavItem) => {
    const isActive = activeItem === item.id;

    const button = (
      <button
        key={item.id}
        onClick={() => handleNavClick(item)}
        style={{
          ...navItemBase,
          ...(isActive ? navItemActive : {}),
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--bg-surface-raised)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
        aria-current={isActive ? 'page' : undefined}
        aria-label={item.label}
      >
        {isActive && <span style={activeGlow} aria-hidden="true" />}
        <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
        <span
          style={{
            opacity: (expanded || isMobile) ? 1 : 0,
            transition: 'opacity var(--transition-fast)',
            overflow: 'hidden',
          }}
        >
          {item.label}
        </span>
      </button>
    );

    if (!expanded && !isMobile) {
      return (
        <Tooltip key={item.id} content={item.label} position="right" delay={100}>
          {button}
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <nav
      style={{ ...sidebarBase, width, transform }}
      aria-label="Main navigation"
    >
      {/* Toggle */}
      {!isMobile && (
        <button
          style={toggleButtonStyle}
          onClick={onToggle}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-surface)';
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-surface-raised)';
            e.currentTarget.style.color = 'var(--text-tertiary)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      )}

      {/* Logo */}
      <div style={logoAreaStyle}>
        <div
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--susan-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontWeight: 800,
            color: '#fff',
            fontSize: 'var(--text-sm)',
          }}
        >
          K
        </div>
        <span
          style={{
            ...logoTextStyle,
            opacity: (expanded || isMobile) ? 1 : 0,
            transition: 'opacity var(--transition-fast)',
          }}
        >
          Kash
        </span>
      </div>

      {/* Main nav items */}
      <div style={navListStyle} role="list">
        {NAV_ITEMS.map(renderNavItem)}
      </div>

      {/* Bottom section */}
      <div style={bottomAreaStyle}>
        {BOTTOM_ITEMS.map(renderNavItem)}

        {/* Susan avatar */}
        <div
          style={susanAvatarStyle}
          onClick={() => handleNavClick({ id: 'susan', label: 'Susan AI', icon: <Sparkles size={20} />, path: '/susan' })}
          role="button"
          tabIndex={0}
          aria-label="Talk to Susan AI"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNavClick({ id: 'susan', label: 'Susan AI', icon: <Sparkles size={20} />, path: '/susan' });
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.background = 'var(--bg-surface-raised)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.background = 'var(--bg-glass)';
          }}
        >
          <div style={avatarDotStyle} aria-hidden="true">S</div>
          <div
            style={{
              opacity: (expanded || isMobile) ? 1 : 0,
              transition: 'opacity var(--transition-fast)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Susan
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>
              AI Assistant
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
