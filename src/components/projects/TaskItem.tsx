import { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { useProjectStore } from '../../store/useProjectStore';
import { Badge } from '../ui';
import { Calendar, Trash2 } from 'lucide-react';
import type { Task } from '../../types';

export function TaskItem({ task }: { task: Task }) {
  const { db } = useDatabase();
  const updateTask = useProjectStore(s => s.updateTask);
  const removeTask = useProjectStore(s => s.removeTask);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleStatus = async () => {
    if (!db) return;
    setIsUpdating(true);
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const updated = await db.updateTask(task.id, { status: newStatus });
      if (updated) updateTask(task.id, updated);
      
      // Also update project progress in store manually to reflect immediately
      // A better architecture would fetch the updated project, but this works for now
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!db || !window.confirm('Delete this task?')) return;
    try {
      await db.deleteTask(task.id);
      removeTask(task.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card glass-hover" style={{ 
      padding: '0.75rem 1rem', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem',
      opacity: isUpdating ? 0.5 : 1,
      transition: 'all 0.2s'
    }}>
      <input 
        type="checkbox" 
        checked={task.status === 'done'}
        onChange={toggleStatus}
        style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: 'var(--color-success)' }}
      />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ 
          fontSize: '0.95rem', 
          color: task.status === 'done' ? 'var(--text-secondary)' : 'var(--text-primary)',
          textDecoration: task.status === 'done' ? 'line-through' : 'none'
        }}>
          {task.title}
        </span>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', alignItems: 'center' }}>
          {task.priority && (
            <Badge 
              text={`P${task.priority}`} 
              variant={task.priority > 3 ? 'warning' : 'default'} 
            />
          )}
          {task.due_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <Calendar size={12} /> {task.due_date}
            </span>
          )}
        </div>
      </div>
      
      <button 
        onClick={handleDelete}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
        className="hover:text-danger"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
