import { useEffect, useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useCalendarSync } from '../../hooks/useCalendarSync';
import { CalendarAPI } from '../../services/calendarAPI';
import { WeekOverview } from './WeekOverview';
import { Timeline } from './Timeline';
import { Button, Input } from '../ui';
import { RefreshCw, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { addDays, getTodayISO } from '../../utils/dates';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useT } from '../../i18n';

export function PlannerView() {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const t = useT();
  const { db } = useDatabase();
  const selectedDate = usePlannerStore(s => s.selectedDate);
  const setSelectedDate = usePlannerStore(s => s.setSelectedDate);
  const dailyPlans = usePlannerStore(s => s.dailyPlans);
  const setDailyPlans = usePlannerStore(s => s.setDailyPlans);
  const addDailyPlan = usePlannerStore(s => s.addDailyPlan);
  
  const { isConnected, isSyncing, syncEvents } = useCalendarSync();
  const calendarEvents = usePlannerStore((st) => st.calendarEvents);
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

  /**
   * Sync Google Calendar events for the WHOLE visible week (Mon–Sun of
   * the selected date) and import them into the planner, each on its
   * own date. Idempotent: events are matched by calendar_event_id.
   */
  const handleSync = async () => {
    if (!db) return;

    // From Monday of the selected week to +30 days
    const [y, m, d] = selectedDate.split('-').map(Number);
    const sel = new Date(y, m - 1, d);
    const dayOfWeek = (sel.getDay() + 6) % 7; // 0 = Monday
    const weekStart = new Date(y, m - 1, d - dayOfWeek);
    const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 30);

    const events = await syncEvents(weekStart, weekEnd);
    console.info('[Planner] Synced events from Google:', events);
    if (!events || events.length === 0) {
      alert(t('planner.sync.none'));
      return;
    }

    const localYMD = (dt: Date) =>
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    const hhmm = (iso: string) => {
      const dt = new Date(iso);
      return isNaN(dt.getTime()) ? undefined : `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    };

    try {
      const existing = await db.listDailyPlansByRange(localYMD(weekStart), localYMD(new Date(weekEnd.getTime() - 1)));
      const known = new Set(existing.map((p) => p.calendar_event_id).filter(Boolean));

      const imported: string[] = [];
      for (const ev of events) {
        if (!ev.id || known.has(ev.id)) continue;
        // All-day events come as plain YYYY-MM-DD (no time) — use the
        // date literally; parsing it with new Date() would shift a day
        // in negative-offset timezones.
        const isAllDay = !!ev.start && !ev.start.includes('T');
        let planDate = selectedDate;
        if (isAllDay) {
          planDate = ev.start;
        } else if (ev.start) {
          const startDt = new Date(ev.start);
          if (!isNaN(startDt.getTime())) planDate = localYMD(startDt);
        }
        imported.push(planDate);
        await db.createDailyPlan({
          plan_date: planDate,
          title: ev.summary || '(sin título)',
          time_start: !isAllDay && ev.start ? hhmm(ev.start) ?? null : null,
          time_end: !isAllDay && ev.end ? hhmm(ev.end) ?? null : null,
          is_calendar_event: 1,
          calendar_event_id: ev.id,
        });
      }

      // Refresh the plans for the date currently on screen
      const plans = await db.listDailyPlans(selectedDate);
      setDailyPlans(plans);

      // Visible summary of what was imported
      const byDate: Record<string, number> = {};
      for (const dte of imported) byDate[dte] = (byDate[dte] ?? 0) + 1;
      const summary = Object.entries(byDate).map(([k, v]) => `${k}: ${v}`).join('\n');
      alert(
        imported.length > 0
          ? `${t('planner.sync.done')} (${imported.length}):\n${summary}`
          : t('planner.sync.uptodate')
      );
    } catch (err) {
      console.error('[Planner] Failed to import calendar events:', err);
      alert(`${t('planner.sync.error')}: ${err instanceof Error ? err.message : err}`);
    }
  };

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

      // Mirror timed tasks to Google Calendar so it sends the
      // notification (10 min before) — even with the PWA closed.
      if (time_start && CalendarAPI.hasToken()) {
        try {
          const startDT = new Date(`${selectedDate}T${time_start}:00`);
          const endDT = time_end
            ? new Date(`${selectedDate}T${time_end}:00`)
            : new Date(startDT.getTime() + 60 * 60 * 1000);
          const event = await CalendarAPI.createEvent(newTaskTitle, startDT, endDT, 'Created from Project Tracker V3');
          if (event?.id) {
            // Link it so Sync Calendar never re-imports it as a duplicate
            await db.updateDailyPlan(plan.id, { calendar_event_id: event.id });
          }
        } catch (err) {
          console.warn('[Planner] Could not mirror task to Google Calendar (token expired?):', err);
        }
      }
      setNewTaskTitle('');
      setNewTaskTime('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const displayDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '2rem', padding: isMobile ? '0.25rem' : '1rem', height: '100%', minHeight: 0 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{t('planner.title')}</h1>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <Button variant="ghost" onClick={handlePrevDay}><ChevronLeft size={20} /></Button>
            <Button variant="ghost" onClick={handleToday}>{t('planner.today')}</Button>
            <Button variant="ghost" onClick={handleNextDay}><ChevronRight size={20} /></Button>
          </div>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>{displayDate}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            variant="secondary" 
            icon={<RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />} 
            onClick={handleSync}
            disabled={!isConnected || isSyncing}
          >
            {isConnected ? t('planner.sync') : t('planner.notconnected')}
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
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>{t('planner.scheduletask')}</h3>
            {isAdding ? (
              <form onSubmit={handleAddPlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={t('planner.tasktitle')}
                  autoFocus
                />
                <Input 
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  label={t('planner.starttime')}
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" onClick={() => setIsAdding(false)} type="button">Cancel</Button>
                  <Button variant="primary" type="submit">Add</Button>
                </div>
              </form>
            ) : (
              <Button variant="secondary" icon={<Plus size={16} />} onClick={() => setIsAdding(true)} style={{ width: '100%' }}>
                {t('planner.addtoschedule')}
              </Button>
            )}
          </div>

          {calendarEvents.filter((ev) => ev.start && ev.start.startsWith('') && new Date(ev.start).toDateString() === new Date(`${selectedDate}T00:00:00`).toDateString()).length > 0 && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Google Calendar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {calendarEvents.filter((ev) => ev.start && new Date(ev.start).toDateString() === new Date(`${selectedDate}T00:00:00`).toDateString()).map((ev) => {
                  const fmt = (iso: string) => {
                    if (!iso) return '';
                    const d = new Date(iso);
                    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  };
                  const time = fmt(ev.start);
                  return (
                    <div key={ev.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)', border: '1px solid var(--border-default)' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ev.summary}</span>
                      {time && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {time}{fmt(ev.end) ? ` – ${fmt(ev.end)}` : ''}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="glass-card" style={{ padding: '1.5rem', flex: 1 }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>{t('planner.unscheduled')}</h3>
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
