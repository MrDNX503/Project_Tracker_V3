/* ============================================================
   KashFinance Project Tracker V3 — Command Palette Component
   ============================================================ */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Sparkles,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
  Hash,
  CornerDownLeft,
} from 'lucide-react';

/* ── Types ── */

export type CommandItemType = 'navigation' | 'project' | 'action';

export interface CommandItem {
  id: string;
  type: CommandItemType;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string[];
  onSelect: () => void;
}

export interface CommandGroup {
  label: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  /** Whether the palette is open */
  isOpen: boolean;
  /** Callback when the palette requests to close */
  onClose: () => void;
  /** Additional command items to include */
  items?: CommandItem[];
  /** Recent projects to show */
  recentProjects?: Array<{ id: string; name: string; color: string }>;
  /** Callback for navigation commands */
  onNavigate?: (path: string) => void;
  /** Callback for creating a new project */
  onCreateProject?: () => void;
}

/* ── Default Navigation Items ── */

function getDefaultNavItems(onNavigate?: (path: string) => void): CommandItem[] {
  return [
    {
      id: 'nav-dashboard',
      type: 'navigation',
      label: 'Dashboard',
      description: 'Overview and insights',
      icon: <LayoutDashboard size={16} />,
      onSelect: () => onNavigate?.('/'),
    },
    {
      id: 'nav-projects',
      type: 'navigation',
      label: 'Projects',
      description: 'All your projects',
      icon: <FolderKanban size={16} />,
      onSelect: () => onNavigate?.('/projects'),
    },
    {
      id: 'nav-planner',
      type: 'navigation',
      label: 'Planner',
      description: 'Daily planning & time blocks',
      icon: <CalendarDays size={16} />,
      onSelect: () => onNavigate?.('/planner'),
    },
    {
      id: 'nav-susan',
      type: 'navigation',
      label: 'Susan AI',
      description: 'AI assistant',
      icon: <Sparkles size={16} />,
      onSelect: () => onNavigate?.('/susan'),
    },
    {
      id: 'nav-analytics',
      type: 'navigation',
      label: 'Analytics',
      description: 'Productivity stats',
      icon: <BarChart3 size={16} />,
      onSelect: () => onNavigate?.('/analytics'),
    },
    {
      id: 'nav-settings',
      type: 'navigation',
      label: 'Settings',
      description: 'App configuration',
      icon: <Settings size={16} />,
      onSelect: () => onNavigate?.('/settings'),
    },
  ];
}

function getDefaultActions(onCreateProject?: () => void): CommandItem[] {
  return [
    {
      id: 'action-new-project',
      type: 'action',
      label: 'New Project',
      description: 'Create a new project',
      icon: <Plus size={16} />,
      onSelect: () => onCreateProject?.(),
    },
  ];
}

/* ── Styles ── */

const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 'var(--z-command)' as unknown as number,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: '15vh',
  background: 'var(--bg-overlay)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  animation: 'backdrop-fade 150ms ease both',
};

const panelStyle: CSSProperties = {
  width: '100%',
  maxWidth: '36rem',
  background: 'var(--bg-glass-heavy)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-2xl)',
  boxShadow: 'var(--shadow-xl)',
  overflow: 'hidden',
  animation: 'scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '60vh',
};

const searchRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.875rem 1rem',
  borderBottom: '1px solid var(--border-subtle)',
};

const searchInputStyle: CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'var(--text-primary)',
  fontSize: 'var(--text-base)',
  fontFamily: 'var(--font-sans)',
};

const resultsAreaStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '0.5rem',
};

const groupLabelStyle: CSSProperties = {
  padding: '0.5rem 0.75rem 0.375rem',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const itemBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 0.75rem',
  borderRadius: 'var(--radius-lg)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  border: 'none',
  background: 'transparent',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'var(--font-sans)',
  color: 'var(--text-primary)',
};

const itemActiveStyle: CSSProperties = {
  background: 'var(--bg-surface-raised)',
};

const itemIconStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-surface)',
  color: 'var(--text-secondary)',
  flexShrink: 0,
};

const footerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.625rem 1rem',
  borderTop: '1px solid var(--border-subtle)',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-tertiary)',
};

const footerKbdStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.0625rem 0.3125rem',
  fontSize: '0.625rem',
  fontFamily: 'var(--font-mono)',
  background: 'var(--bg-surface-raised)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
};

const emptyStyle: CSSProperties = {
  padding: '2rem 1rem',
  textAlign: 'center',
  color: 'var(--text-tertiary)',
  fontSize: 'var(--text-sm)',
};

/* ── Component ── */

export function CommandPalette({
  isOpen,
  onClose,
  items: extraItems = [],
  recentProjects = [],
  onNavigate,
  onCreateProject,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build all command items
  const allItems = useMemo(() => {
    const nav = getDefaultNavItems(onNavigate);
    const actions = getDefaultActions(onCreateProject);
    const projects: CommandItem[] = recentProjects.map((p) => ({
      id: `project-${p.id}`,
      type: 'project' as CommandItemType,
      label: p.name,
      icon: (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: p.color,
          }}
        />
      ),
      onSelect: () => onNavigate?.(`/projects/${p.id}`),
    }));
    return [...nav, ...projects, ...actions, ...extraItems];
  }, [onNavigate, onCreateProject, recentProjects, extraItems]);

  // Filter based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  // Group items by type
  const groups = useMemo<CommandGroup[]>(() => {
    const map: Record<CommandItemType, CommandItem[]> = {
      navigation: [],
      project: [],
      action: [],
    };
    filteredItems.forEach((item) => {
      map[item.type].push(item);
    });
    const result: CommandGroup[] = [];
    if (map.navigation.length) result.push({ label: 'Navigation', items: map.navigation });
    if (map.project.length) result.push({ label: 'Recent Projects', items: map.project });
    if (map.action.length) result.push({ label: 'Actions', items: map.action });
    return result;
  }, [filteredItems]);

  // Flatten for keyboard navigation
  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Global Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
        // Parent should handle opening
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      item.onSelect();
      onClose();
    },
    [onClose]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % flatItems.length);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (flatItems[activeIndex]) {
            handleSelect(flatItems[activeIndex]);
          }
          break;
        }
      }
    },
    [flatItems, activeIndex, handleSelect]
  );

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div
      style={backdropStyle}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div style={searchRowStyle}>
          <Search size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            style={searchInputStyle}
            aria-label="Search commands"
            aria-activedescendant={flatItems[activeIndex]?.id}
            role="combobox"
            aria-expanded="true"
            aria-haspopup="listbox"
          />
        </div>

        {/* Results */}
        <div ref={listRef} style={resultsAreaStyle} role="listbox" id="command-results">
          {groups.length === 0 ? (
            <div style={emptyStyle}>
              <p>No results found for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} role="group" aria-label={group.label}>
                <div style={groupLabelStyle}>{group.label}</div>
                {group.items.map((item) => {
                  const currentIndex = flatIndex++;
                  const isActive = currentIndex === activeIndex;

                  return (
                    <button
                      key={item.id}
                      id={item.id}
                      data-index={currentIndex}
                      role="option"
                      aria-selected={isActive}
                      style={{
                        ...itemBase,
                        ...(isActive ? itemActiveStyle : {}),
                      }}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                    >
                      <div
                        style={{
                          ...itemIconStyle,
                          ...(isActive
                            ? { background: 'var(--bg-surface-raised)', color: 'var(--accent-cyan)' }
                            : {}),
                        }}
                      >
                        {item.icon || <Hash size={16} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 500,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          }}
                        >
                          {item.label}
                        </div>
                        {item.description && (
                          <div
                            style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--text-tertiary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.shortcut && (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {item.shortcut.map((key) => (
                            <kbd key={key} style={footerKbdStyle}>
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                      {isActive && (
                        <ArrowRight
                          size={14}
                          style={{ color: 'var(--accent-cyan)', flexShrink: 0 }}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div style={footerStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <kbd style={footerKbdStyle}>↑↓</kbd> Navigate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <kbd style={footerKbdStyle}><CornerDownLeft size={9} /></kbd> Select
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <kbd style={footerKbdStyle}>Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
