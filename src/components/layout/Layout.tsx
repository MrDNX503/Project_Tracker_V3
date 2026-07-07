/* ============================================================
   KashFinance Project Tracker V3 — Layout Component
   ============================================================ */

import { useState, type ReactNode, type CSSProperties } from 'react';
import { Sidebar, type NavItem } from './Sidebar';
import { Header } from './Header';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/* ── Types ── */

export interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  activeNavItem?: string;
  onNavigate?: (item: NavItem) => void;
  onOpenCommandPalette?: () => void;
  onOpenSusan?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

/* ── Styles ── */

const layoutRoot: CSSProperties = {
  display: 'flex',
  height: '100dvh',
  minHeight: '100dvh',
  overflow: 'hidden',
  background: 'var(--bg-primary)',
  position: 'relative',
};

const mainAreaBase: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
  transition: 'margin-left var(--transition-base)',
  minWidth: 0,
};

const contentStyle: CSSProperties = {
  flex: 1,
  padding: '1.5rem',
  overflowY: 'auto',
  animation: 'fadeIn 300ms ease both',
};

/* ── Component ── */

export function Layout({
  children,
  title,
  subtitle,
  activeNavItem = 'dashboard',
  onNavigate,
  onOpenCommandPalette,
  onOpenSusan,
  notificationCount,
  onNotificationClick,
}: LayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const sidebarWidth = isMobile
    ? '0px'
    : sidebarExpanded
    ? 'var(--sidebar-width-expanded)'
    : 'var(--sidebar-width-collapsed)';

  return (
    <div style={layoutRoot}>
      {/* Mobile overlay */}
      {isMobile && sidebarExpanded && (
        <div 
          onClick={() => setSidebarExpanded(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-overlay)',
            zIndex: 250,
            animation: 'fadeIn 200ms ease',
          }}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeItem={activeNavItem}
        onNavigate={(item) => {
          if (isMobile) setSidebarExpanded(false);
          onNavigate?.(item);
        }}
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <div
        style={{
          ...mainAreaBase,
          marginLeft: sidebarWidth,
        }}
      >
        <Header
          title={title}
          subtitle={subtitle}
          onOpenCommandPalette={onOpenCommandPalette}
          onOpenSusan={onOpenSusan}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
          onMenuToggle={isMobile ? () => setSidebarExpanded(true) : undefined}
        />

        <main style={{
          ...contentStyle,
          padding: isMobile ? '1rem' : '1.5rem',
        }} id="main-content" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
