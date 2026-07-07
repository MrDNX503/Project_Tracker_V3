// ============================================================
// Auth service — Google sign-in session (client-side)
// ============================================================

import { ALLOWED_EMAILS } from '../config';
import { CalendarAPI } from './calendarAPI';

export interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

const PROFILE_KEY = 'kash_user_profile';
const TOKEN_KEY = 'kash_google_token';

/** Fetch the Google profile for an OAuth access token */
export async function fetchUserProfile(accessToken: string): Promise<UserProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('No se pudo obtener el perfil de Google');
  const data = await res.json();
  return { email: data.email, name: data.name || data.email, picture: data.picture };
}

export function isEmailAllowed(email: string): boolean {
  if (ALLOWED_EMAILS.length === 0) return true;
  return ALLOWED_EMAILS.some((e) => e.toLowerCase() === email.toLowerCase());
}

/** Persist session (profile + calendar token) */
export function saveSession(profile: UserProfile, accessToken: string): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(TOKEN_KEY, accessToken);
  CalendarAPI.setToken(accessToken);
}

export function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

/** Restore the calendar token into the API client on app start */
export function restoreCalendarToken(): boolean {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) {
    CalendarAPI.setToken(t);
    return true;
  }
  return false;
}

export function signOut(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.location.reload();
}
