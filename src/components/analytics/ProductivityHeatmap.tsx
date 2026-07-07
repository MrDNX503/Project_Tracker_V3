import { useMemo } from 'react';
import type { ProgressLog } from '../../types';
import { Tooltip } from '../ui';

export function ProductivityHeatmap({ logs }: { logs: ProgressLog[] }) {
  // Generate last 90 days
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      result.push(d.toISOString().split('T')[0]);
    }
    return result;
  }, []);

  // Map dates to activity counts
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach(log => {
      const date = log.logged_at.split('T')[0];
      map.set(date, (map.get(date) || 0) + 1);
    });
    return map;
  }, [logs]);

  const getColor = (count: number) => {
    if (count === 0) return 'var(--bg-primary)';
    if (count === 1) return 'rgba(0, 212, 255, 0.2)';
    if (count <= 3) return 'rgba(0, 212, 255, 0.5)';
    if (count <= 5) return 'rgba(0, 212, 255, 0.8)';
    return 'var(--accent-primary)';
  };

  // Group by weeks for grid layout (7 rows, ~13 columns)
  const weeks = [];
  let currentWeek = [];
  for (let i = 0; i < days.length; i++) {
    currentWeek.push(days[i]);
    if (currentWeek.length === 7 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {weeks.map((week, wIndex) => (
        <div key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {week.map(date => {
            const count = activityMap.get(date) || 0;
            return (
              <Tooltip key={date} content={`${count} activities on ${date}`}>
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '3px',
                    backgroundColor: getColor(count),
                    border: count === 0 ? '1px solid var(--border-default)' : 'none'
                  }} 
                />
              </Tooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
}
