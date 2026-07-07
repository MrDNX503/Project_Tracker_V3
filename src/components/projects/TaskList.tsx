import { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { useProjectStore } from '../../store/useProjectStore';
import { TaskItem } from './TaskItem';
import { Button, Input } from '../ui';
import { Plus } from 'lucide-react';
import type { Task } from '../../types';

interface TaskListProps {
  projectId: string;
  tasks: Task[];
}

export function TaskList({ projectId, tasks }: TaskListProps) {
  const { db } = useDatabase();
  const addTask = useProjectStore(s => s.addTask);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !db) return;

    try {
      const task = await db.createTask({
        project_id: projectId,
        title: newTaskTitle,
        status: 'todo',
        priority: 3
      });
      addTask(task);
      setNewTaskTitle('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add task', err);
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Tasks</h2>
        <Button icon={<Plus size={16} />} onClick={() => setIsAdding(true)}>Add Task</Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddTask} className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <Input 
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setIsAdding(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {todoTasks.map(task => <TaskItem key={task.id} task={task} />)}
        {todoTasks.length === 0 && !isAdding && (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No active tasks.</p>
        )}
      </div>

      {doneTasks.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Completed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.7 }}>
            {doneTasks.map(task => <TaskItem key={task.id} task={task} />)}
          </div>
        </div>
      )}
    </div>
  );
}
