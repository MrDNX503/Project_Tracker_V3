// ============================================
// Reminder Scheduling Hook
// ============================================

import { useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  scheduleReminder,
  cancelAllReminders,
  showSusanNotification,
  isNotificationSupported,
  getNotificationPermission,
} from '../services/notifications';

export interface ReminderData {
  id: string;
  title: string;
  message?: string;
  remindAt: string; // ISO 8601
  projectName?: string;
}

/**
 * Hook for managing reminder notifications
 */
export function useReminders() {
  // Request permission on mount
  useEffect(() => {
    if (isNotificationSupported() && getNotificationPermission() === 'default') {
      // We'll request permission when user first tries to set a reminder
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't cancel reminders on unmount — they should persist during the session
    };
  }, []);

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    const permission = await requestNotificationPermission();
    return permission === 'granted';
  }, []);

  const scheduleReminderNotification = useCallback(
    async (reminder: ReminderData): Promise<boolean> => {
      const hasPermission = await ensurePermission();
      if (!hasPermission) {
        console.warn('Notification permission not granted');
        return false;
      }

      const triggerAt = new Date(reminder.remindAt);
      return scheduleReminder(
        reminder.id,
        {
          title: `⏰ ${reminder.title}`,
          body: reminder.message || (reminder.projectName ? `Project: ${reminder.projectName}` : 'Time to work on this!'),
          tag: `reminder-${reminder.id}`,
          requireInteraction: true,
        },
        triggerAt
      );
    },
    [ensurePermission]
  );

  const scheduleMultipleReminders = useCallback(
    async (reminders: ReminderData[]): Promise<void> => {
      const hasPermission = await ensurePermission();
      if (!hasPermission) return;

      for (const reminder of reminders) {
        const triggerAt = new Date(reminder.remindAt);
        if (triggerAt > new Date()) {
          scheduleReminder(
            reminder.id,
            {
              title: `⏰ ${reminder.title}`,
              body: reminder.message || 'Time to work on this!',
              tag: `reminder-${reminder.id}`,
              requireInteraction: true,
            },
            triggerAt
          );
        }
      }
    },
    [ensurePermission]
  );

  const sendSusanMessage = useCallback(
    async (message: string): Promise<void> => {
      const hasPermission = await ensurePermission();
      if (hasPermission) {
        showSusanNotification(message);
      }
    },
    [ensurePermission]
  );

  return {
    scheduleReminderNotification,
    scheduleMultipleReminders,
    cancelAllReminders,
    sendSusanMessage,
    isSupported: isNotificationSupported(),
    permission: getNotificationPermission(),
  };
}
