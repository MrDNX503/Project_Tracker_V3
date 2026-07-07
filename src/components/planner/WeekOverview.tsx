import { useMemo } from 'react';
import { getWeekStart, addDays, getTodayISO } from '../../utils/dates';

interface WeekOverviewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function WeekOverview({ selectedDate, onSelectDate }: WeekOverviewProps) {
  const weekDates = useMemo(() => {
    const start = getWeekStart(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const today = getTodayISO();

  return (
    <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
      {weekDates.map((date) => {
        const isSelected = date === selectedDate;
        const isToday = date === today;
        const d = new Date(date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = d.getDate();
        
        return (
          <button
            key={date}
            onClick={() => onSelectDate(date)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0.75rem 0.5rem',
              borderRadius: '8px',
              border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
              backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
              color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="hover:bg-primary"
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase' }}>{dayName}</span>
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: isSelected || isToday ? 700 : 400,
              color: isSelected ? 'var(--text-primary)' : (isToday ? 'var(--accent-violet)' : 'inherit'),
              marginTop: '0.25rem'
            }}>
              {dayNum}
            </span>
            {isToday && <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--accent-violet)', marginTop: '0.25rem' }} />}
          </button>
        );
      })}
    </div>
  );
}
