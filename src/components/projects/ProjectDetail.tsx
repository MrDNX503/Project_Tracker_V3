import { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useAppStore } from '../../store/useAppStore';
import { useDatabase } from '../../hooks/useDatabase';
import { ProgressRing, Badge, Button } from '../ui';
import { ArrowLeft, Plus, CheckCircle2, Calendar, Pencil, Trash2 } from 'lucide-react';
import { TaskList } from './TaskList';
import { ProgressLogger } from './ProgressLogger';
import { MilestoneList } from './MilestoneList';
import { ProjectForm } from './ProjectForm';
import { useT } from '../../i18n';

type Tab = 'tasks' | 'milestones' | 'logs' | 'settings';

export function ProjectDetail() {
  const t = useT();
  const { db } = useDatabase();
  const selectedProjectId = useAppStore(s => s.selectedProjectId);
  const setView = useAppStore(s => s.setView);
  const removeProject = useProjectStore(s => s.removeProject);
  const [isEditing, setIsEditing] = useState(false);

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!db) return;
    if (!window.confirm(`¿Eliminar el proyecto "${projectName}"? Se borrarán también sus tareas, objetivos y registros. Esta acción no se puede deshacer.`)) return;
    try {
      await db.deleteProject(projectId);
      removeProject(projectId);
      setView('projects');
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar el proyecto.');
    }
  };
  
  const projects = useProjectStore(s => s.projects);
  const tasks = useProjectStore(s => s.tasks);
  const milestones = useProjectStore(s => s.milestones);
  const progressLogs = useProjectStore(s => s.progressLogs);
  const setProjects = useProjectStore(s => s.setProjects);
  const setTasks = useProjectStore(s => s.setTasks);
  const setMilestones = useProjectStore(s => s.setMilestones);
  const setProgressLogs = useProjectStore(s => s.setProgressLogs);

  // Load this project's data from the database every time the view opens.
  // The stores are just an in-memory cache — SQLite is the source of truth.
  useEffect(() => {
    if (!db || !selectedProjectId) return;
    (async () => {
      try {
        const [projs, projTasks, projMilestones, projLogs] = [
          await db.listProjects(),
          await db.listTasks({ project_id: selectedProjectId }),
          await db.listMilestones(selectedProjectId),
          await db.listProgressLogsByProject(selectedProjectId),
        ];
        setProjects(projs);
        // Merge: replace this project's items, keep the rest
        setTasks([
          ...useProjectStore.getState().tasks.filter(t => t.project_id !== selectedProjectId),
          ...projTasks,
        ]);
        setMilestones([
          ...useProjectStore.getState().milestones.filter(m => m.project_id !== selectedProjectId),
          ...projMilestones,
        ]);
        setProgressLogs([
          ...useProjectStore.getState().progressLogs.filter(l => l.project_id !== selectedProjectId),
          ...projLogs,
        ]);
      } catch (err) {
        console.error('[ProjectDetail] Failed to load project data:', err);
      }
    })();
  }, [db, selectedProjectId, setProjects, setTasks, setMilestones, setProgressLogs]);

  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [isLogging, setIsLogging] = useState(false);

  const project = projects.find(p => p.id === selectedProjectId);
  const projectTasks = tasks.filter(t => t.project_id === selectedProjectId);
  const projectMilestones = milestones.filter(m => m.project_id === selectedProjectId);
  const projectLogs = progressLogs.filter(l => l.project_id === selectedProjectId);

  if (!project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{t('projects.notfound')}</p>
        <Button onClick={() => setView('projects')}>{t('projects.back')}</Button>
      </div>
    );
  }

  const completedTasks = projectTasks.filter(t => t.status === 'done').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <header className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: `4px solid ${project.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
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
          {project.description || t('projects.nodesc')}
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-default)', paddingTop: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} />
            <span>{completedTasks}/{projectTasks.length} Tasks</span>
          </div>
          {project.target_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Calendar size={16} />
              <span>{t('projects.due')}: {project.target_date.split('T')[0]}</span>
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
            {t((`projects.tab.${tab}`) as any)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        {activeTab === 'tasks' && <TaskList projectId={project.id} tasks={projectTasks} />}
        {activeTab === 'milestones' && <MilestoneList projectId={project.id} milestones={projectMilestones} />}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{t('projects.edit.section')}</h2>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t('projects.edit.desc')}
              </p>
              <Button variant="primary" icon={<Pencil size={16} />} onClick={() => setIsEditing(true)}>
                {t('projects.edit.btn')}
              </Button>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--color-danger)' }}>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--color-danger)' }}>{t('projects.danger')}</h2>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t('projects.danger.desc')}
              </p>
              <Button variant="ghost" icon={<Trash2 size={16} />} style={{ color: 'var(--color-danger)' }}
                onClick={() => handleDeleteProject(project.id, project.name)}>
                {t('projects.delete')}
              </Button>
            </div>
          </div>
        )}

        {isEditing && <ProjectForm project={project} onClose={() => setIsEditing(false)} />}

        {activeTab === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{t('logs.title')}</h2>
              <Button icon={<Plus size={16} />} onClick={() => setIsLogging(true)}>{t('logs.add')}</Button>
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
                <p style={{ color: 'var(--text-secondary)' }}>{t('logs.none')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
