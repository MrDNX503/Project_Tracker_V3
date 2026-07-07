import { useMemo } from 'react';
import type { DailyPlan } from '../../types';
import { TimeBlock } from './TimeBlock';

interface TimelineProps {
  plans: DailyPlan[];
  date: string;
}

export function Timeline({ plans, date }: TimelineProps) {
  // Generate hours from 6 AM to 11 PM
  const hours = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => i + 6);
  }, []);

  const timedPlans = plans.filter((p) => p.time_start);

  return (
    <div style={{ position: 'relative', minHeight: '800px', display: 'flex', flexDirection: 'column' }}>
      {/* Background grid */}
      <div style={{ position: 'absolute', top: 0, left: '60px', right: 0, bottom: 0, zIndex: 0 }}>
        {hours.map((hour) => (
          <div 
            key={hour} 
            style={{ 
              height: '60px', 
              borderTop: '1px solid var(--border-default)', 
              opacity: 0.5 
            }} 
          />
        ))}
      </div>

      {/* Hour labels */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '50px', bottom: 0, zIndex: 1 }}>
        {hours.map((hour) => (
          <div 
            key={hour} 
            style={{ 
              height: '60px', 
              textAlign: 'right', 
              paddingRight: '10px', 
              color: 'var(--text-secondary)', 
              fontSize: '0.75rem',
              transform: 'translateY(-50%)'
            }}
          >
            {hour % 12 || 12} {hour >= 12 ? 'PM' : 'AM'}
          </div>
        ))}
      </div>

      {/* Render blocks */}
      <div style={{ position: 'absolute', top: 0, left: '60px', right: '10px', bottom: 0, zIndex: 2 }}>
        {timedPlans.map((plan) => {
          if (!plan.time_start) return null;
          
          const [startH, startM] = plan.time_start.split(':').map(Number);
          const [endH, endM] = plan.time_end ? plan.time_end.split(':').map(Number) : [startH + 1, startM];
          
          // Calculate top position based on start time relative to 6 AM
          const startOffsetH = startH - 6 + (startM / 60);
          const top = startOffsetH * 60; // 60px per hour
          
          // Calculate height
          let durationH = (endH + endM / 60) - (startH + startM / 60);
          if (durationH <= 0) durationH = 1; // Default 1 hour if invalid end time
          const height = durationH * 60;
          
          // Don't render if outside our 6am-11pm window
          if (top < 0 || top > 18 * 60) return null;

          return (
            <TimeBlock 
              key={plan.id} 
              plan={plan} 
              style={{
                position: 'absolute',
                top: `${top}px`,
                height: `${height - 2}px`, // -2 for margin
                left: '10px',
                right: 0
              }} 
            />
          );
        })}
      </div>
      
      {/* Current time indicator */}
      {new Date().toISOString().split('T')[0] === date && (
        <CurrentTimeIndicator />
      )}
    </div>
  );
}

function CurrentTimeIndicator() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  
  if (h < 6 || h > 23) return null;
  
  const top = (h - 6 + m / 60) * 60;
  
  return (
    <div style={{ position: 'absolute', top: `${top}px`, left: '50px', right: 0, zIndex: 3, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: '-5px', top: '-5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
      <div style={{ height: '2px', backgroundColor: 'var(--color-danger)', opacity: 0.7 }} />
    </div>
  );
}
