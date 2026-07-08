import { useT } from '../../i18n';
import { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { useProjectStore } from '../../store/useProjectStore';
import { Button, Input } from '../ui';
import type { Milestone } from '../../types';
import { Plus, Check, Trash2 } from 'lucide-react';

/**
 * Objetivos del proyecto. Al marcar/desmarcar un objetivo como
 * completado, el % de progreso del proyecto se recalcula
 * proporcionalmente (completados / total).
 */
export function MilestoneList({ projectId, milestones }: { projectId: string; milestones: Milestone[] }) {
  const t = useT();
  const { db } = useDatabase();
  const addMilestone = useProjectStore(s => s.addMilestone);
  const updateMilestone = useProjectStore(s => s.updateMilestone);
  const removeMilestone = useProjectStore(s => s.removeMilestone);
  const updateProjectStore = useProjectStore(s => s.updateProject);

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  /** Recalcula el progreso del proyecto según objetivos completados */
  const recalcProgress = async (updated: Milestone[]) => {
    if (!db) return;
    const total = updated.length;
    const done = updated.filter(m => m.status === 'completed').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    const proj = await db.updateProject(projectId, {
      progress,
      status: progress === 100 ? 'completed' : undefined,
    });
    if (proj) updateProjectStore(projectId, proj);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !db) return;
    try {
      const m = await db.createMilestone({
        project_id: projectId,
        title,
        status: 'pending'
      });
      addMilestone(m);
      setTitle('');
      setIsAdding(false);
      await recalcProgress([...milestones, m]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (m: Milestone) => {
    if (!db || busyId) return;
    setBusyId(m.id);
    try {
      const newStatus = m.status === 'completed' ? 'pending' : 'completed';
      const updated = await db.updateMilestone(m.id, { status: newStatus });
      if (updated) {
        updateMilestone(m.id, updated);
        await recalcProgress(milestones.map(x => (x.id === m.id ? updated : x)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (m: Milestone) => {
    if (!db || busyId) return;
    if (!window.confirm(`¿Eliminar el objetivo "${m.title}"?`)) return;
    setBusyId(m.id);
    try {
      await db.deleteMilestone(m.id);
      removeMilestone(m.id);
      await recalcProgress(milestones.filter(x => x.id !== m.id));
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const done = milestones.filter(m => m.status === 'completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
          {t('milestones.title')} {milestones.length > 0 && (
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              — {done}/{milestones.length} {t('milestones.completed')}
            </span>
          )}
        </h2>
        <Button icon={<Plus size={16} />} onClick={() => setIsAdding(true)}>{t('milestones.add')}</Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('milestones.placeholder')} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setIsAdding(false)} type="button">{t('common.cancel')}</Button>
            <Button variant="primary" type="submit">{t('common.save')}</Button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {milestones.length > 0 ? (
          milestones.map(m => {
            const completed = m.status === 'completed';
            return (
              <div key={m.id} className="glass-card" style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderLeft: `4px solid ${completed ? 'var(--color-success)' : 'var(--accent-primary)'}`,
                opacity: busyId === m.id ? 0.6 : 1,
              }}>
                <button
                  onClick={() => handleToggle(m)}
                  aria-label={completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                  style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${completed ? 'var(--color-success)' : 'var(--border-default)'}`,
                    background: completed ? 'var(--color-success)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {completed && <Check size={16} color="#fff" />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    margin: 0, color: 'var(--text-primary)',
                    textDecoration: completed ? 'line-through' : 'none',
                    opacity: completed ? 0.7 : 1,
                  }}>{m.title}</h4>
                </div>
                <button
                  onClick={() => handleDelete(m)}
                  aria-label="Eliminar objetivo"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '0.25rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('milestones.empty')}
          </p>
        )}
      </div>
    </div>
  );
}
