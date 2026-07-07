import { useEffect, useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useCalendarSync } from '../../hooks/useCalendarSync';
import { WeekOverview } from './WeekOverview';
import { Timeline } from './Timeline';
import { Button, Input } from '../ui';
import { RefreshCw, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { addDays, getTodayISO } from '../../utils/dates';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export function PlannerView() {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const { db } = useDatabase();
  const selectedDate = usePlannerStore(s => s.selectedDate);
  const setSelectedDate = usePlannerStore(s => s.setSelectedDate);
  const dailyPlans = usePlannerStore(s => s.dailyPlans);
  const setDailyPlans = usePlannerStore(s => s.setDailyPlans);
  const addDailyPlan = usePlannerStore(s => s.addDailyPlan);
  
  const { isConnected, isSyncing, syncToday } = useCalendarSync();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  useEffect(() => {
    async function load() {
      if (!db) return;
      try {
        const plans = await db.listDailyPlans(selectedDate);
        setDailyPlans(plans);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [db, selectedDate, setDailyPlans]);

  const handlePrevDay = () => setSelectedDate(addDays(selectedDate, -1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(getTodayISO());

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !db) return;

    try {
      // Basic time parsing (e.g. "14:00" -> time_start: "14:00", time_end: "15:00")
      let time_start, time_end;
      if (newTaskTime) {
        time_start = newTaskTime;
        const [h, m] = newTaskTime.split(':');
        const endH = String((parseInt(h) + 1) % 24).padStart(2, '0');
        time_end = `${endH}:${m}`;
      }

      const plan = await db.createDailyPlan({
        plan_date: selectedDate,
        title: newTaskTitle,
        status: 'scheduled',
        time_start,
        time_end
      });
      addDailyPlan(plan);
      setNewTaskTitle('');
      setNewTaskTime('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '2rem', padding: isMobile ? '0.25rem' : '1rem', height: '100%', minHeight: 0 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Daily Planner</h1>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <Button variant="ghost" onClick={handlePrevDay}><ChevronLeft size={20} /></Button>
            <Button variant="ghost" onClick={handleToday}>Today</Button>
            <Button variant="ghost" onClick={handleNextDay}><ChevronRight size={20} /></Button>
          </div>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>{displayDate}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            variant="secondary" 
            icon={<RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />} 
            onClick={syncToday}
            disabled={!isConnected || isSyncing}
          >
            {isConnected ? 'Sync Calendar' : 'Calendar not connected'}
          </Button>
        </div>
      </header>

      <WeekOverview selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '2rem', flex: 1, minHeight: 0, overflowY: isMobile ? 'auto' : undefined }}>
        {/* Timeline */}
        <div className="glass-card" style={{ flex: 2, padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', minHeight: isMobile ? '420px' : undefined }}>
          <Timeline plans={dailyPlans} date={selectedDate} />
        </div>

        {/* Sidebar / Add Task */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Schedule Task</h3>
            {isAdding ? (
              <form onSubmit={handleAddPlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                  autoFocus
                />
                <Input 
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  label="Start Time (optional)"
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" onClick={() => setIsAdding(false)} type="button">Cancel</Button>
                  <Button variant="primary" type="submit">Add</Button>
                </div>
              </form>
            ) : (
              <Button variant="secondary" icon={<Plus size={16} />} onClick={() => setIsAdding(true)} style={{ width: '100%' }}>
                Add to Schedule
              </Button>
            )}
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', flex: 1 }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Unscheduled Today</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {dailyPlans.filter(p => !p.time_start).length > 0 ? (
                dailyPlans.filter(p => !p.time_start).map(p => (
                  <div key={p.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.title}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>All tasks have a time assigned.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
