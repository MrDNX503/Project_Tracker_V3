import { useState } from 'react';
import type { DailyPlan } from '../../types';
import { useDatabase } from '../../hooks/useDatabase';
import { usePlannerStore } from '../../store/usePlannerStore';
import { formatTime12h } from '../../utils/dates';
import { Check } from 'lucide-react';

interface TimeBlockProps {
  plan: DailyPlan;
  style?: React.CSSProperties;
}

export function TimeBlock({ plan, style }: TimeBlockProps) {
  const { db } = useDatabase();
  const updateDailyPlan = usePlannerStore((s) => s.updateDailyPlan);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: DailyPlan['status']) => {
    switch(status) {
      case 'completed': return 'var(--color-success)';
      case 'in_progress': return 'var(--accent-primary)';
      case 'skipped': return 'var(--color-warning)';
      default: return 'var(--accent-violet)';
    }
  };

  const getBackgroundColor = (status: DailyPlan['status']) => {
    switch(status) {
      case 'completed': return 'rgba(16, 185, 129, 0.1)';
      case 'in_progress': return 'rgba(0, 212, 255, 0.1)';
      case 'skipped': return 'rgba(245, 158, 11, 0.1)';
      default: return 'var(--bg-surface)';
    }
  };

  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db) return;
    setIsUpdating(true);
    
    let newStatus: DailyPlan['status'] = 'completed';
    if (plan.status === 'completed') newStatus = 'scheduled';
    else if (plan.status === 'scheduled') newStatus = 'in_progress';
    else if (plan.status === 'in_progress') newStatus = 'completed';

    try {
      const updated = await db.updateDailyPlan(plan.id, { status: newStatus });
      if (updated) updateDailyPlan(plan.id, updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div 
      className="glass-hover"
      style={{
        ...style,
        backgroundColor: getBackgroundColor(plan.status),
        borderLeft: `4px solid ${getStatusColor(plan.status)}`,
        borderRadius: '6px',
        padding: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: '1px solid var(--border-default)',
        borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
        opacity: isUpdating ? 0.6 : (plan.status === 'skipped' ? 0.7 : 1),
        textDecoration: plan.status === 'skipped' ? 'line-through' : 'none'
      }}
      title={plan.description ?? undefined}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {plan.title}
        </h4>
        <button 
          onClick={toggleStatus}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: getStatusColor(plan.status) }}
        >
          {plan.status === 'completed' ? <Check size={14} /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${getStatusColor(plan.status)}` }} />}
        </button>
      </div>
      
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
        {formatTime12h(plan.time_start)} {plan.time_end ? `- ${formatTime12h(plan.time_end)}` : ''}
      </span>
    </div>
  );
}
