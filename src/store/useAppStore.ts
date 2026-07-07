// ============================================
// Global App State (Zustand)
// ============================================

import { create } from 'zustand';

export type AppView = 'dashboard' | 'projects' | 'project-detail' | 'planner' | 'susan' | 'analytics' | 'settings';

// --- Session navigation persistence -------------------------------
// sessionStorage survives minimizing / switching apps (PWA included)
// but is cleared when the app/tab is fully closed — exactly the
// "resume where I left off unless I quit" behavior we want.
const NAV_VIEW_KEY = 'kash_nav_view';
const NAV_PROJECT_KEY = 'kash_nav_project';

function getInitialView(): AppView {
  const v = sessionStorage.getItem(NAV_VIEW_KEY) as AppView | null;
  const valid: AppView[] = ['dashboard', 'projects', 'project-detail', 'planner', 'susan', 'analytics', 'settings'];
  return v && valid.includes(v) ? v : 'dashboard';
}

function getInitialProject(): string | null {
  return sessionStorage.getItem(NAV_PROJECT_KEY);
}

function persistNav(view: AppView, projectId: string | null): void {
  sessionStorage.setItem(NAV_VIEW_KEY, view);
  if (projectId) sessionStorage.setItem(NAV_PROJECT_KEY, projectId);
  else sessionStorage.removeItem(NAV_PROJECT_KEY);
}

interface AppState {
  // Navigation
  currentView: AppView;
  selectedProjectId: string | null;
  sidebarExpanded: boolean;
  commandPaletteOpen: boolean;

  // Database
  dbReady: boolean;
  dbError: string | null;

  // Integrations
  googleClientId: string | null;
  calendarConnected: boolean;

  // Online status
  isOnline: boolean;

  // Actions
  setView: (view: AppView) => void;
  selectProject: (projectId: string | null) => void;
  openProjectDetail: (projectId: string) => void;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setDbReady: (ready: boolean) => void;
  setDbError: (error: string | null) => void;
  setOnline: (online: boolean) => void;
  setGoogleClientId: (id: string | null) => void;
  setCalendarConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  currentView: getInitialView(),
  selectedProjectId: getInitialProject(),
  sidebarExpanded: false,
  commandPaletteOpen: false,
  dbReady: false,
  dbError: null,
  isOnline: navigator.onLine,
  googleClientId: localStorage.getItem('kash_google_client_id'),
  calendarConnected: !!localStorage.getItem('kash_google_token'),

  // Actions
  setView: (view) => {
    persistNav(view, null);
    set({ currentView: view, selectedProjectId: null });
  },
  selectProject: (projectId) => {
    if (projectId) sessionStorage.setItem(NAV_PROJECT_KEY, projectId);
    set({ selectedProjectId: projectId });
  },
  openProjectDetail: (projectId) => {
    persistNav('project-detail', projectId);
    set({ currentView: 'project-detail', selectedProjectId: projectId });
  },
  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setDbReady: (ready) => set({ dbReady: ready }),
  setDbError: (error) => set({ dbError: error }),
  setOnline: (online) => set({ isOnline: online }),
  setGoogleClientId: (id) => {
    if (id) localStorage.setItem('kash_google_client_id', id);
    else localStorage.removeItem('kash_google_client_id');
    set({ googleClientId: id });
  },
  setCalendarConnected: (connected) => set({ calendarConnected: connected }),
}));
