import { Briefcase, ListTodo, Target, Flame } from 'lucide-react';

interface StatsGridProps {
  activeProjects: number;
  todayTasks: number;
  avgProgress: number;
  streak: number;
}

export function StatsGrid({ activeProjects, todayTasks, avgProgress, streak }: StatsGridProps) {
  const stats = [
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: <Briefcase size={24} color="var(--accent-cyan, #00d4ff)" />,
      color: 'var(--accent-cyan, #00d4ff)'
    },
    {
      label: 'Tasks Today',
      value: todayTasks,
      icon: <ListTodo size={24} color="var(--accent-violet, #8b5cf6)" />,
      color: 'var(--accent-violet, #8b5cf6)'
    },
    {
      label: 'Avg Progress',
      value: `${avgProgress}%`,
      icon: <Target size={24} color="var(--color-success, #10b981)" />,
      color: 'var(--color-success, #10b981)'
    },
    {
      label: 'Current Streak',
      value: `${streak} Days`,
      icon: <Flame size={24} color="var(--color-warning, #f59e0b)" />,
      color: 'var(--color-warning, #f59e0b)'
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      {stats.map((stat, i) => (
        <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            padding: '1rem', 
            borderRadius: '12px', 
            backgroundColor: 'var(--bg-primary)', 
            boxShadow: `0 0 15px -5px ${stat.color}`
          }}>
            {stat.icon}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stat.label}</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
