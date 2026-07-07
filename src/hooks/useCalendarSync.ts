// ============================================
// Calendar Sync Hook
// ============================================

import { useCallback } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import * as calendarService from '../services/googleCalendar';

/**
 * Hook for managing Google Calendar synchronization
 */
export function useCalendarSync() {
  const setCalendarConnected = usePlannerStore((s) => s.setCalendarConnected);
  const setCalendarSyncing = usePlannerStore((s) => s.setCalendarSyncing);
  const setCalendarEvents = usePlannerStore((s) => s.setCalendarEvents);
  const setLastSyncTime = usePlannerStore((s) => s.setLastSyncTime);
  const calendarConnected = usePlannerStore((s) => s.calendarConnected);
  const calendarSyncing = usePlannerStore((s) => s.calendarSyncing);

  /**
   * Initialize Google Calendar connection
   */
  const connect = useCallback(async (clientId: string) => {
    try {
      await calendarService.loadGISScript();
      calendarService.initTokenClient(clientId);
      await calendarService.requestAccessToken();
      setCalendarConnected(true);
    } catch (error) {
      console.error('Calendar connection failed:', error);
      setCalendarConnected(false);
      throw error;
    }
  }, [setCalendarConnected]);

  /**
   * Disconnect from Google Calendar
   */
  const disconnect = useCallback(() => {
    calendarService.revokeToken();
    setCalendarConnected(false);
    setCalendarEvents([]);
    setLastSyncTime(null);
  }, [setCalendarConnected, setCalendarEvents, setLastSyncTime]);

  /**
   * Sync events for a specific date range
   */
  const syncEvents = useCallback(async (startDate: Date, endDate: Date) => {
    if (!calendarService.isAuthenticated()) {
      console.warn('Not authenticated with Google Calendar');
      return;
    }

    setCalendarSyncing(true);
    try {
      const events = await calendarService.getEventsInRange(startDate, endDate);
      const mappedEvents = events.map((e) => ({
        id: e.id || '',
        summary: e.summary,
        start: e.start.dateTime || e.start.date || '',
        end: e.end.dateTime || e.end.date || '',
      }));
      setCalendarEvents(mappedEvents);
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error('Calendar sync failed:', error);
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
    if (!calendarService.isAuthenticated()) {
      throw new Error('Not connected to Google Calendar');
    }

    const event: calendarService.CalendarEvent = {
      summary: title,
      description,
      start: timeStart
        ? { dateTime: `${date}T${timeStart}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
        : { date },
      end: timeEnd
        ? { dateTime: `${date}T${timeEnd}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
        : { date },
    };

    return calendarService.createEvent(event);
  }, []);

  return {
    connect,
    disconnect,
    syncEvents,
    syncToday,
    createCalendarEvent,
    isConnected: calendarConnected,
    isSyncing: calendarSyncing,
  };
}
