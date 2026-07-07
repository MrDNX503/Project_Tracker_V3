// ============================================================
// App configuration
// ============================================================

/**
 * Google OAuth Client ID (Web application).
 * OAuth Client IDs are PUBLIC by design — safe to commit.
 * Never put the Client SECRET here.
 *
 * Priority: build-time env var > hardcoded value.
 * You can set VITE_GOOGLE_CLIENT_ID in a .env file, or just
 * paste your Client ID below.
 */
export const GOOGLE_CLIENT_ID: string =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ??
  'PASTE_YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';

/**
 * OAuth scopes requested at login.
 * Calendar access is granted in the same consent screen.
 */
export const GOOGLE_SCOPES =
  'openid email profile https://www.googleapis.com/auth/calendar.events';

/**
 * Optional allow-list. If non-empty, only these Google accounts
 * can use the app after login. Note: while your OAuth consent
 * screen is in "Testing" mode, Google already blocks everyone
 * who is not a registered test user.
 */
export const ALLOWED_EMAILS: string[] = ['oreyes.work@gmail.com'];
