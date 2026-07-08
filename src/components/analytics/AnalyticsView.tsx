import { useT } from '../../i18n';
import { useProjectStore } from '../../store/useProjectStore';
import { getProjectStats } from '../../utils/analytics';
import { ProgressChart } from './ProgressChart';
import { ProductivityHeatmap } from './ProductivityHeatmap';
import { Briefcase, CheckCircle, Clock, Target } from 'lucide-react';

export function AnalyticsView() {
  const t = useT();
  const projects = useProjectStore(s => s.projects);
  const tasks = useProjectStore(s => s.tasks);
  const progressLogs = useProjectStore(s => s.progressLogs);

  const stats = getProjectStats(projects);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  
  const totalHours = progressLogs.reduce((acc, log) => acc + (log.hours_worked || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{t('analytics.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>{t('analytics.subtitle')}</p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <StatCard title={t('analytics.totalprojects')} value={projects.length} icon={<Briefcase size={24} color="var(--accent-primary)" />} />
        <StatCard title={t('analytics.completedtasks')} value={completedTasks} icon={<CheckCircle size={24} color="var(--color-success)" />} />
        <StatCard title={t('analytics.hours')} value={`${totalHours.toFixed(1)}h`} icon={<Clock size={24} color="var(--accent-violet)" />} />
        <StatCard title={t('dash.avgprogress')} value={`${stats.avgProgress}%`} icon={<Target size={24} color="var(--color-warning)" />} />
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Project Progress Chart */}
        <div className="glass-card" style={{ flex: '1 1 400px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>{t('analytics.progress')}</h2>
          <ProgressChart projects={projects} />
        </div>

        {/* Contribution Heatmap */}
        <div className="glass-card" style={{ flex: '1 1 400px', padding: '1.5rem', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>{t('analytics.heatmap')}</h2>
          <ProductivityHeatmap logs={progressLogs} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-primary)' }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{title}</p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}
