// ============================================
// Google Calendar API Integration
// Uses Google Identity Services (GIS) with PKCE
// ============================================

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status?: string;
  colorId?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
}

export interface CalendarConfig {
  clientId: string;
  calendarId: string; // usually 'primary'
}

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = null;

/**
 * Load the Google Identity Services SDK script
 */
export function loadGISScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('gis-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

/**
 * Initialize the OAuth2 token client
 */
export function initTokenClient(clientId: string): void {
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services not loaded');
  }

  tokenClient = window.google!.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: () => {}, // Will be overridden per-request
  });
}

/**
 * Request an access token (triggers consent popup if needed)
 */
export function requestAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized. Call initTokenClient first.'));
      return;
    }

    tokenClient.callback = (response: google.accounts.oauth2.TokenResponse) => {
      if (response.error) {
        reject(new Error(`OAuth error: ${response.error}`));
        return;
      }
      accessToken = response.access_token;
      resolve(response.access_token);
    };

    if (accessToken) {
      // Try to use existing token, request with prompt:'' to skip consent if still valid
      tokenClient.requestAccessToken({ prompt: '' });
    } else {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  });
}

/**
 * Revoke the current access token
 */
export function revokeToken(): void {
  if (accessToken) {
    window.google?.accounts.oauth2.revoke(accessToken, () => {
      accessToken = null;
      console.log('Calendar access token revoked');
    });
  }
}

/**
 * Check if we have a valid access token
 */
export function isAuthenticated(): boolean {
  return accessToken !== null;
}

// ---- Calendar API Methods ----

async function calendarFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!accessToken) {
    throw new Error('Not authenticated. Call requestAccessToken first.');
  }

  const response = await fetch(`${CALENDAR_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, clear it
    accessToken = null;
    throw new Error('Access token expired. Please re-authenticate.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Calendar API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json() as Promise<T>;
}

/**
 * List events from the user's calendar
 */
export async function listEvents(
  calendarId: string = 'primary',
  options: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    orderBy?: 'startTime' | 'updated';
    singleEvents?: boolean;
  } = {}
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams();
  if (options.timeMin) params.set('timeMin', options.timeMin);
  if (options.timeMax) params.set('timeMax', options.timeMax);
  if (options.maxResults) params.set('maxResults', String(options.maxResults));
  if (options.orderBy) params.set('orderBy', options.orderBy);
  if (options.singleEvents !== undefined) params.set('singleEvents', String(options.singleEvents));

  const query = params.toString();
  const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events${query ? '?' + query : ''}`;

  const result = await calendarFetch<{ items: CalendarEvent[] }>(endpoint);
  return result.items || [];
}

/**
 * Get today's events
 */
export async function getTodayEvents(calendarId: string = 'primary'): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return listEvents(calendarId, {
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
}

/**
 * Get events for a specific date range
 */
export async function getEventsInRange(
  startDate: Date,
  endDate: Date,
  calendarId: string = 'primary'
): Promise<CalendarEvent[]> {
  return listEvents(calendarId, {
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
}

/**
 * Create a new calendar event
 */
export async function createEvent(
  event: CalendarEvent,
  calendarId: string = 'primary'
): Promise<CalendarEvent> {
  return calendarFetch<CalendarEvent>(
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      body: JSON.stringify(event),
    }
  );
}

/**
 * Update an existing calendar event
 */
export async function updateEvent(
  eventId: string,
  event: Partial<CalendarEvent>,
  calendarId: string = 'primary'
): Promise<CalendarEvent> {
  return calendarFetch<CalendarEvent>(
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(event),
    }
  );
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> {
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete event: ${response.status}`);
  }
}

// ---- GIS Type Declarations ----
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: google.accounts.oauth2.TokenResponse) => void;
          }) => google.accounts.oauth2.TokenClient;
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
  }
  namespace google.accounts.oauth2 {
    interface TokenClient {
      callback: (response: TokenResponse) => void;
      requestAccessToken: (options?: { prompt?: string }) => void;
    }
    interface TokenResponse {
      access_token: string;
      error?: string;
      expires_in: number;
      scope: string;
      token_type: string;
    }
  }
}

export type { CalendarConfig as GoogleCalendarConfig };
