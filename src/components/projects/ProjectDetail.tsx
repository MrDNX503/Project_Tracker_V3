import { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useAppStore } from '../../store/useAppStore';
import { ProgressRing, Badge, Button } from '../ui';
import { ArrowLeft, Plus, CheckCircle2, Calendar } from 'lucide-react';
import { TaskList } from './TaskList';
import { ProgressLogger } from './ProgressLogger';
import { MilestoneList } from './MilestoneList';

type Tab = 'tasks' | 'milestones' | 'logs' | 'settings';

export function ProjectDetail() {
  const selectedProjectId = useAppStore(s => s.selectedProjectId);
  const setView = useAppStore(s => s.setView);
  
  const projects = useProjectStore(s => s.projects);
  const tasks = useProjectStore(s => s.tasks);
  const milestones = useProjectStore(s => s.milestones);
  const progressLogs = useProjectStore(s => s.progressLogs);

  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [isLogging, setIsLogging] = useState(false);

  const project = projects.find(p => p.id === selectedProjectId);
  const projectTasks = tasks.filter(t => t.project_id === selectedProjectId);
  const projectMilestones = milestones.filter(m => m.project_id === selectedProjectId);
  const projectLogs = progressLogs.filter(l => l.project_id === selectedProjectId);

  if (!project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Project not found.</p>
        <Button onClick={() => setView('projects')}>Back to Projects</Button>
      </div>
    );
  }

  const completedTasks = projectTasks.filter(t => t.status === 'done').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <header className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: `4px solid ${project.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={() => setView('projects')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}
              className="hover:bg-primary"
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ fontSize: '2rem' }}>{project.icon}</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{project.name}</h1>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Badge text={project.status} variant={project.status === 'active' ? 'success' : 'default'} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ProgressRing progress={project.progress} size={60} strokeWidth={5} color={project.color} />
          </div>
        </div>

        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          {project.description || 'No description provided.'}
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} />
            <span>{completedTasks}/{projectTasks.length} Tasks</span>
          </div>
          {project.target_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Calendar size={16} />
              <span>Due: {project.target_date.split('T')[0]}</span>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-default)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        {(['tasks', 'milestones', 'logs', 'settings'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 1rem',
              color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 600 : 400,
              borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        {activeTab === 'tasks' && <TaskList projectId={project.id} tasks={projectTasks} />}
        {activeTab === 'milestones' && <MilestoneList projectId={project.id} milestones={projectMilestones} />}
        {activeTab === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Progress Logs</h2>
              <Button icon={<Plus size={16} />} onClick={() => setIsLogging(true)}>Log Progress</Button>
            </div>
            
            {isLogging && (
              <ProgressLogger projectId={project.id} onClose={() => setIsLogging(false)} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projectLogs.length > 0 ? (
                projectLogs.map(log => (
                  <div key={log.id} className="glass-card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.log_type}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(log.logged_at).toLocaleString()}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{log.content}</p>
                    {(log.mood || log.hours_worked) && (
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem' }}>
                        {log.mood && <Badge text={log.mood} variant="default" />}
                        {log.hours_worked && <span style={{ color: 'var(--text-secondary)' }}>⏱️ {log.hours_worked}h</span>}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No progress logged yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
