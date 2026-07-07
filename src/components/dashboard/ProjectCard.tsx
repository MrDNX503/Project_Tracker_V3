import { type Project, type Task } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { ProgressRing, Badge } from '../ui';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dates';

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
}

export function ProjectCard({ project, tasks }: ProjectCardProps) {
  const openProjectDetail = useAppStore((s) => s.openProjectDetail);
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  
  // Format deadline if exists
  let deadlineText = 'No deadline';
  let isOverdue = false;
  if (project.target_date) {
    const target = new Date(project.target_date);
    const today = new Date();
    isOverdue = target < today && project.status !== 'completed';
    deadlineText = isOverdue ? 'Overdue' : formatRelativeTime(project.target_date);
  }

  return (
    <div 
      className="glass-card glass-hover" 
      onClick={() => openProjectDetail(project.id)}
      style={{
        padding: '1.5rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        borderTop: `4px solid ${project.color || 'var(--accent-secondary)'}`,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem' }}>{project.icon}</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
              {project.name}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
              <Badge 
                text={project.status} 
                variant={project.status === 'active' ? 'success' : project.status === 'paused' ? 'warning' : 'default'} 
              />
            </div>
          </div>
        </div>
        <ProgressRing progress={project.progress} size={48} strokeWidth={4} color={project.color || 'var(--accent-secondary)'} />
      </div>

      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description || 'No description provided.'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <CheckCircle2 size={14} color="var(--color-success)" />
          <span>{completedTasks}/{tasks.length} tasks</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: isOverdue ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
          <Calendar size={14} />
          <span>{deadlineText}</span>
        </div>
      </div>
    </div>
  );
}
