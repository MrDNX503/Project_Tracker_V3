import { useT } from '../../i18n';
import { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { useProjectStore } from '../../store/useProjectStore';
import { Modal, Button, Input } from '../ui';
import type { Project } from '../../types';

interface ProjectFormProps {
  project?: Project;
  onClose: () => void;
}

export function ProjectForm({ project, onClose }: ProjectFormProps) {
  const t = useT();
  const { db } = useDatabase();
  const addProject = useProjectStore((s) => s.addProject);
  const updateProjectStore = useProjectStore((s) => s.updateProject);
  
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [icon, setIcon] = useState(project?.icon || '📁');
  const [color, setColor] = useState(project?.color || '#8b5cf6');
  const [status, setStatus] = useState<Project['status']>(project?.status || 'planning');
  const [priority] = useState(project?.priority || 3);
  const [targetDate, setTargetDate] = useState(project?.target_date?.split('T')[0] || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!db) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (project) {
        const updated = await db.updateProject(project.id, {
          name, description, icon, color, status, priority, 
          target_date: targetDate || undefined
        });
        if (updated) updateProjectStore(project.id, updated);
      } else {
        const created = await db.createProject({
          name, description, icon, color, status, priority,
          target_date: targetDate || undefined
        });
        addProject(created);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
  const icons = ['📁', '🚀', '💻', '📱', '🎨', '📚', '📈', '💰', '🏠', '✨'];

  return (
    <Modal title={project ? t('projects.edit') : t('projects.new')} onClose={onClose} width="500px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <Input
          label={t('projects.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Website Redesign"
          autoFocus
          required
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{t('projects.description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              outline: 'none',
              minHeight: '80px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{t('projects.status')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Project['status'])}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="planning">{t('projects.status.planning')}</option>
              <option value="active">{t('projects.status.active')}</option>
              <option value="paused">{t('projects.status.paused')}</option>
              <option value="completed">{t('projects.status.completed')}</option>
            </select>
          </div>
          
          <Input
            label={t('projects.targetdate')}
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{t('projects.iconcolor')}</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
              {icons.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  style={{
                    background: icon === i ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    border: icon === i ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    fontSize: '1.25rem',
                    padding: '0.25rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transform: icon === i ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 150ms ease'
                  }}
                  aria-pressed={icon === i}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {colors.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                  cursor: 'pointer'
                }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="ghost" onClick={onClose} type="button">{t('projects.cancel')}</Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            {project ? t('projects.save') : t('projects.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
