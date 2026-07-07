// ============================================
// Calendar Sync Hook — unified on CalendarAPI
// (same token as the Google sign-in in Settings)
// ============================================

import { useCallback } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { useAppStore } from '../store/useAppStore';
import { CalendarAPI } from '../services/calendarAPI';

/**
 * Hook for managing Google Calendar synchronization.
 * Connection state comes from the app-level Google session
 * (Settings -> Sign in with Google), NOT a separate token client.
 */
export function useCalendarSync() {
  const calendarConnected = useAppStore((s) => s.calendarConnected);
  const setCalendarSyncing = usePlannerStore((s) => s.setCalendarSyncing);
  const setCalendarEvents = usePlannerStore((s) => s.setCalendarEvents);
  const setLastSyncTime = usePlannerStore((s) => s.setLastSyncTime);
  const calendarSyncing = usePlannerStore((s) => s.calendarSyncing);

  /**
   * Sync events for a specific date range
   */
  const syncEvents = useCallback(async (startDate: Date, endDate: Date) => {
    if (!CalendarAPI.hasToken()) {
      console.warn('[CalendarSync] No Google session token — sign in from Settings');
      return [];
    }

    setCalendarSyncing(true);
    try {
      const events = await CalendarAPI.getEvents(startDate, endDate);
      const mappedEvents = events.map((e) => ({
        id: e.id || '',
        summary: e.summary,
        start: e.start?.dateTime || '',
        end: e.end?.dateTime || '',
      }));
      setCalendarEvents(mappedEvents);
      setLastSyncTime(new Date().toISOString());
      return mappedEvents;
    } catch (error) {
      console.error('[CalendarSync] Sync failed (token may have expired — reconnect from Settings):', error);
      return [];
    } finally {
      setCalendarSyncing(false);
    }
  }, [setCalendarEvents, setCalendarSyncing, setLastSyncTime]);

  /**
   * Sync today's events
   */
  const syncToday = useCallback(async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return syncEvents(start, end);
  }, [syncEvents]);

  /**
   * Create a calendar event from a daily plan
   */
  const createCalendarEvent = useCallback(async (
    title: string,
    date: string,
    timeStart?: string,
    timeEnd?: string,
    description?: string
  ) => {
    if (!CalendarAPI.hasToken()) {
      throw new Error('Not connected to Google Calendar — sign in from Settings');
    }
    const startDT = timeStart ? new Date(`${date}T${timeStart}:00`) : new Date(`${date}T09:00:00`);
    const endDT = timeEnd ? new Date(`${date}T${timeEnd}:00`) : new Date(startDT.getTime() + 60 * 60 * 1000);
    return CalendarAPI.createEvent(title, startDT, endDT, description);
  }, []);

  return {
    syncEvents,
    syncToday,
    createCalendarEvent,
    isConnected: calendarConnected,
    isSyncing: calendarSyncing,
  };
}
