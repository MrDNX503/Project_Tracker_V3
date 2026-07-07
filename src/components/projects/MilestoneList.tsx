import { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { useProjectStore } from '../../store/useProjectStore';
import { Button, Input } from '../ui';
import type { Milestone } from '../../types';
import { Plus } from 'lucide-react';

export function MilestoneList({ projectId, milestones }: { projectId: string; milestones: Milestone[] }) {
  const { db } = useDatabase();
  const addMilestone = useProjectStore(s => s.addMilestone);
  
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Milestones</h2>
        <Button icon={<Plus size={16} />} onClick={() => setIsAdding(true)}>Add Milestone</Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Milestone title" autoFocus />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setIsAdding(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {milestones.length > 0 ? (
          milestones.map(m => (
            <div key={m.id} className="glass-card" style={{ padding: '1rem', borderLeft: `4px solid var(--accent-primary)` }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{m.title}</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status: {m.status}</p>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No milestones created.</p>
        )}
      </div>
    </div>
  );
}
