export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  htmlLink?: string;
}

export class CalendarAPI {
  private static token: string | null = null;

  static setToken(token: string) {
    this.token = token;
  }

  static getToken(): string | null {
    return this.token;
  }

  static hasToken(): boolean {
    return !!this.token;
  }

  /**
   * Fetch events from the primary calendar for a given date range
   */
  static async getEvents(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> {
    if (!this.token) throw new Error('Google Calendar token not found');

    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.statusText}`);
    }

    const data = await res.json();
    return data.items || [];
  }

  /**
   * Create a new event in the primary calendar
   */
  static async createEvent(
    summary: string,
    startTime: Date,
    endTime: Date,
    description?: string
  ): Promise<CalendarEvent> {
    if (!this.token) throw new Error('Google Calendar token not found');

    const event = {
      summary,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      throw new Error(`Failed to create event: ${res.statusText}`);
    }

    return res.json();
  }
}
