import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAppStore } from './store/useAppStore';
import { useSusanStore } from './store/useSusanStore';
import { useDatabase } from './hooks/useDatabase';
import { useTheme } from './hooks/useTheme';
import { initSusanAI } from './services/susanAI';
import { GOOGLE_CLIENT_ID } from './config';
import { restoreCalendarToken } from './services/auth';
import { scheduleBackup } from './services/driveBackup';
import { useProjectStore } from './store/useProjectStore';
import { t } from './i18n';
import { useLangStore } from './i18n';
import { usePlannerStore } from './store/usePlannerStore';
import { Layout } from './components/layout';
import { CommandPalette } from './components/layout/CommandPalette';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsView } from './components/projects/ProjectsView';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { PlannerView } from './components/planner/PlannerView';
import { SusanView } from './components/susan/SusanView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

function AppContent() {
  const currentView = useAppStore((s) => s.currentView);

  switch (currentView) {
    case 'dashboard':
      return <DashboardView />;
    case 'projects':
      return <ProjectsView />;
    case 'project-detail':
      return <ProjectDetail />;
    case 'planner':
      return <PlannerView />;
    case 'susan':
      return <SusanView />;
    case 'analytics':
      return <AnalyticsView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
}

export default function App() {
  const { dbReady } = useDatabase();
  const dbError = useAppStore((s) => s.dbError);
  const setCalendarConnected = useAppStore((s) => s.setCalendarConnected);
  const currentView = useAppStore((s) => s.currentView);
  const setView = useAppStore((s) => s.setView);

  const [paletteOpen, setPaletteOpen] = useState(false);
  useLangStore((s) => s.lang); // re-render on language change

  // Restore Google Calendar token from a previous session
  useEffect(() => {
    if (restoreCalendarToken()) setCalendarConnected(true);
  }, [setCalendarConnected]);

  // Auto-backup to Google Drive: any change in projects/tasks/planner
  // schedules a debounced upload that OVERWRITES the single backup file.
  useEffect(() => {
    if (!dbReady) return;
    const unsubProjects = useProjectStore.subscribe(() => scheduleBackup());
    const unsubPlanner = usePlannerStore.subscribe(() => scheduleBackup());
    return () => {
      unsubProjects();
      unsubPlanner();
    };
  }, [dbReady]);

  // Initialize theme
  useTheme();

  // Initialize Susan AI from stored key
  useEffect(() => {
    const storedKey = localStorage.getItem('kash_gemini_api_key');
    if (storedKey) {
      initSusanAI(storedKey);
      useSusanStore.getState().setAIConfigured(true);
      useSusanStore.getState().setApiKey(storedKey);
    }
  }, []);

  // Show loading while database initializes
  if (!dbReady && !dbError) {
    return (
      <div className="app-loading">
        <div className="app-loading__content">
          <div className="susan-avatar-loading">
            <svg viewBox="0 0 64 64" width="80" height="80">
              <defs>
                <linearGradient id="g-load" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#00d4ff', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <rect x="12" y="16" width="40" height="36" rx="8" fill="url(#g-load)" />
              <line x1="32" y1="16" x2="32" y2="6" stroke="url(#g-load)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="32" cy="4" r="3" fill="#00d4ff" />
              <circle cx="22" cy="32" r="5" fill="#0a0e1a" />
              <circle cx="42" cy="32" r="5" fill="#0a0e1a" />
              <circle cx="23" cy="31" r="2" fill="#fff" />
              <circle cx="43" cy="31" r="2" fill="#fff" />
              <rect x="24" y="42" width="16" height="3" rx="1.5" fill="#0a0e1a" />
              <rect x="6" y="24" width="6" height="12" rx="3" fill="url(#g-load)" opacity="0.7" />
              <rect x="52" y="24" width="6" height="12" rx="3" fill="url(#g-load)" opacity="0.7" />
            </svg>
          </div>
          <h2>Susan is waking up...</h2>
          <p>Initializing your project tracker</p>
          <div className="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (dbError) {
    return (
      <div className="app-loading app-loading--error">
        <div className="app-loading__content">
          <h2>⚠️ Database Error</h2>
          <p>{dbError}</p>
          <button
            className="btn btn--primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleCommandNavigate = (path: string) => {
    const map: Record<string, any> = {
      '/': 'dashboard',
      '/projects': 'projects',
      '/planner': 'planner',
      '/susan': 'susan',
      '/analytics': 'analytics',
      '/settings': 'settings'
    };
    const viewId = map[path];
    if (viewId) setView(viewId);
  };

  const appContent = (
    <Layout
      activeNavItem={currentView}
      onNavigate={(item) => setView(item.id as any)}
      title={t((`nav.${currentView === 'project-detail' ? 'projects' : currentView}`) as never)}
      onOpenCommandPalette={() => setPaletteOpen(true)}
      onOpenSusan={() => setView('susan')}
      notificationCount={1}
      onNotificationClick={() => alert('Notifications coming soon!')}
    >
      <AppContent />
      <CommandPalette 
        isOpen={paletteOpen} 
        onClose={() => setPaletteOpen(false)} 
        onNavigate={handleCommandNavigate}
        onCreateProject={() => {
          setView('projects');
          // Dispatch custom event to tell Projects view to open new project modal
          window.dispatchEvent(new CustomEvent('open-new-project-modal'));
        }}
      />
    </Layout>
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {appContent}
    </GoogleOAuthProvider>
  );
}
