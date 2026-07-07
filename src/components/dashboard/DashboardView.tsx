import { useEffect, useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useAppStore } from '../../store/useAppStore';
import { getProjectStats, calculateStreak } from '../../utils/analytics';
import { getTimeGreeting, getTodayISO } from '../../utils/dates';
import { StatsGrid } from './StatsGrid';
import { ProjectCard } from './ProjectCard';
import { ActivityFeed } from './ActivityFeed';
import { Button } from '../ui';
import { Calendar, Plus } from 'lucide-react';

export function DashboardView() {
  const setView = useAppStore((s) => s.setView);
  const projects = useProjectStore((s) => s.projects);
  const tasks = useProjectStore((s) => s.tasks);
  const progressLogs = useProjectStore((s) => s.progressLogs);
  const dailyPlans = usePlannerStore((s) => s.dailyPlans);
  const today = getTodayISO();

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getTimeGreeting());
  }, []);

  const stats = getProjectStats(projects);
  const todayTasksCount = dailyPlans.filter((p) => p.plan_date === today).length;
  const streak = calculateStreak(progressLogs.map((l) => l.logged_at.split('T')[0]));

  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'planning').slice(0, 4);
  const todayPlans = dailyPlans.filter((p) => p.plan_date === today).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 250px' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {greeting}, MrDNX <span role="img" aria-label="wave">👋</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            Ready to make some progress today?
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={<Calendar size={18} />} onClick={() => setView('planner')}>
            My Day
          </Button>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => {
            setView('projects');
            window.dispatchEvent(new CustomEvent('open-new-project-modal'));
          }}>
            New Project
          </Button>
        </div>
      </header>

      <StatsGrid
        activeProjects={stats.active}
        todayTasks={todayTasksCount}
        avgProgress={stats.avgProgress}
        streak={streak}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Active Projects */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Active Projects</h2>
            <Button variant="ghost" onClick={() => setView('projects')}>View All</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => {
                const projectTasks = tasks.filter((t) => t.project_id === project.id);
                return <ProjectCard key={project.id} project={project} tasks={projectTasks} />;
              })
            ) : (
              <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No active projects. Start something new!</p>
              </div>
            )}
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Today's Schedule */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Today's Plan</h2>
              <Button variant="ghost" onClick={() => setView('planner')}>Planner</Button>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todayPlans.length > 0 ? (
                todayPlans.map((plan) => (
                  <div key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-primary)' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: plan.status === 'completed' ? 'var(--color-success)' : 'var(--accent-primary)' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{plan.title}</p>
                      {plan.time_start && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{plan.time_start} {plan.time_end ? `- ${plan.time_end}` : ''}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '1rem 0' }}>No tasks planned for today.</p>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Recent Activity</h2>
            <div className="glass-card" style={{ padding: '1rem' }}>
               <ActivityFeed logs={progressLogs.slice(0, 5)} projects={projects} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
