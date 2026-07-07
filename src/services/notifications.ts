// ============================================
// Browser Notification Service
// Uses the Notification API (no backend required)
// ============================================

export interface AppNotification {
  title: string;
  body: string;
  icon?: string;
  tag?: string; // Prevents duplicate notifications
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return 'denied';
  }

  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';

  return Notification.requestPermission();
}

/**
 * Show a browser notification
 */
export function showNotification(notification: AppNotification): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    console.warn('Cannot show notification: permission not granted');
    return null;
  }

  const n = new Notification(notification.title, {
    body: notification.body,
    icon: notification.icon || './icons/icon-192.png',
    tag: notification.tag,
    data: notification.data,
    requireInteraction: notification.requireInteraction || false,
    silent: false,
  });

  n.onclick = () => {
    window.focus();
    n.close();
  };

  return n;
}

// ---- Reminder Scheduling ----

interface ScheduledReminder {
  id: string;
  timerId: ReturnType<typeof setTimeout>;
  notification: AppNotification;
  triggerAt: Date;
}

const scheduledReminders = new Map<string, ScheduledReminder>();

/**
 * Schedule a notification for a specific time
 */
export function scheduleReminder(
  id: string,
  notification: AppNotification,
  triggerAt: Date
): boolean {
  // Cancel existing reminder with same ID
  cancelReminder(id);

  const now = new Date();
  const delay = triggerAt.getTime() - now.getTime();

  if (delay <= 0) {
    console.warn(`Reminder ${id} is in the past, skipping`);
    return false;
  }

  // Max setTimeout delay is ~24.8 days (2^31 - 1 ms)
  if (delay > 2147483647) {
    console.warn(`Reminder ${id} is too far in the future (>24 days), skipping`);
    return false;
  }

  const timerId = setTimeout(() => {
    showNotification(notification);
    scheduledReminders.delete(id);
  }, delay);

  scheduledReminders.set(id, {
    id,
    timerId,
    notification,
    triggerAt,
  });

  return true;
}

/**
 * Cancel a scheduled reminder
 */
export function cancelReminder(id: string): void {
  const existing = scheduledReminders.get(id);
  if (existing) {
    clearTimeout(existing.timerId);
    scheduledReminders.delete(id);
  }
}

/**
 * Cancel all scheduled reminders
 */
export function cancelAllReminders(): void {
  for (const [, reminder] of scheduledReminders) {
    clearTimeout(reminder.timerId);
  }
  scheduledReminders.clear();
}

/**
 * Get all currently scheduled reminders
 */
export function getScheduledReminders(): Array<{
  id: string;
  triggerAt: Date;
  title: string;
}> {
  return Array.from(scheduledReminders.values()).map((r) => ({
    id: r.id,
    triggerAt: r.triggerAt,
    title: r.notification.title,
  }));
}

/**
 * Show a Susan AI notification
 */
export function showSusanNotification(message: string): Notification | null {
  return showNotification({
    title: '🤖 Susan AI',
    body: message,
    tag: 'susan-notification',
    icon: './favicon.svg',
  });
}

/**
 * Show a task reminder notification
 */
export function showTaskReminder(taskTitle: string, projectName?: string): Notification | null {
  return showNotification({
    title: '⏰ Task Reminder',
    body: projectName ? `${taskTitle} (${projectName})` : taskTitle,
    tag: `task-reminder-${taskTitle}`,
    requireInteraction: true,
  });
}
