import { type ProgressLog, type Project } from '../../types';
import { formatRelativeTime } from '../../utils/dates';
import { MessageSquare, Flame, AlertCircle, Trophy } from 'lucide-react';

interface ActivityFeedProps {
  logs: ProgressLog[];
  projects: Project[];
}

export function ActivityFeed({ logs, projects }: ActivityFeedProps) {
  if (logs.length === 0) {
    return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>No recent activity.</p>;
  }

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'achievement': return <Trophy size={16} color="var(--color-warning)" />;
      case 'blocker': return <AlertCircle size={16} color="var(--color-danger)" />;
      case 'update': return <Flame size={16} color="var(--color-success)" />;
      default: return <MessageSquare size={16} color="var(--accent-primary)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {logs.map(log => {
        const project = projects.find(p => p.id === log.project_id);
        
        return (
          <div key={log.id} style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ 
              marginTop: '0.25rem',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-default)'
            }}>
              {getLogIcon(log.log_type)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {project?.name || 'Unknown Project'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {formatRelativeTime(log.logged_at)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {log.content}
              </p>
              {log.hours_worked && (
                <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '1rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                  {log.hours_worked}h logged
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
