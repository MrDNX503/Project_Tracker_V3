// ============================================================
// Google Drive auto-backup — single overwritten file in the
// app's hidden appDataFolder (not visible in the user's Drive UI)
// ============================================================

import { getDB } from '../db';

const BACKUP_FILENAME = 'kashtracker-backup.json';
const FILE_ID_KEY = 'kash_drive_backup_file_id';
const LAST_BACKUP_KEY = 'kash_drive_last_backup';
const TOKEN_KEY = 'kash_google_token';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

let backupTimer: ReturnType<typeof setTimeout> | null = null;
let backupInFlight = false;

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getLastBackupTime(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY);
}

async function driveFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  if (!token) throw new Error('NO_TOKEN');
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401 || res.status === 403) throw new Error('TOKEN_EXPIRED');
  return res;
}

async function findBackupFileId(): Promise<string | null> {
  const cached = localStorage.getItem(FILE_ID_KEY);
  if (cached) return cached;
  const res = await driveFetch(
    `${DRIVE_API}/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id,name)`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const id = data.files?.[0]?.id ?? null;
  if (id) localStorage.setItem(FILE_ID_KEY, id);
  return id;
}

/**
 * Upload the full database dump to Drive.
 * Overwrites the existing backup file — only ONE copy ever exists.
 */
export async function backupNow(): Promise<'ok' | 'no-session' | 'error'> {
  if (backupInFlight) return 'ok';
  backupInFlight = true;
  try {
    const db = await getDB();
    const dump = await db.exportAllData();
    const payload = JSON.stringify({
      version: '3.0.0',
      appName: 'KashFinance Project Tracker V3',
      savedAt: new Date().toISOString(),
      data: dump,
    });

    let fileId = await findBackupFileId();

    if (fileId) {
      // Overwrite existing file content
      const res = await driveFetch(
        `${DRIVE_UPLOAD}/files/${fileId}?uploadType=media`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: payload }
      );
      if (res.status === 404) {
        localStorage.removeItem(FILE_ID_KEY);
        fileId = null; // fall through to create
      } else if (!res.ok) {
        throw new Error(`Drive upload failed: ${res.status}`);
      }
    }

    if (!fileId) {
      // Create the file (multipart: metadata + content)
      const boundary = 'kash_backup_boundary';
      const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify({ name: BACKUP_FILENAME, parents: ['appDataFolder'] }) +
        `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
        payload +
        `\r\n--${boundary}--`;
      const res = await driveFetch(`${DRIVE_UPLOAD}/files?uploadType=multipart&fields=id`, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
        body,
      });
      if (!res.ok) throw new Error(`Drive create failed: ${res.status}`);
      const created = await res.json();
      localStorage.setItem(FILE_ID_KEY, created.id);
    }

    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
    console.info('[Backup] Saved to Google Drive');
    return 'ok';
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'NO_TOKEN' || msg === 'TOKEN_EXPIRED') {
      console.warn('[Backup] Skipped — no valid Google session. Sign in again from Settings.');
      return 'no-session';
    }
    console.error('[Backup] Failed:', e);
    return 'error';
  } finally {
    backupInFlight = false;
  }
}

/**
 * Debounced trigger — call this on every data change.
 * Waits 8s of inactivity so rapid edits produce a single upload.
 */
export function scheduleBackup(): void {
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    backupTimer = null;
    void backupNow();
  }, 8000);
}

/**
 * Download the backup from Drive and REPLACE all local data.
 */
export async function restoreFromDrive(): Promise<'ok' | 'not-found' | 'no-session' | 'error'> {
  try {
    const fileId = await findBackupFileId();
    if (!fileId) return 'not-found';

    const res = await driveFetch(`${DRIVE_API}/files/${fileId}?alt=media`);
    if (res.status === 404) return 'not-found';
    if (!res.ok) return 'error';

    const backup = await res.json();
    if (!backup?.data || backup.appName !== 'KashFinance Project Tracker V3') {
      throw new Error('Invalid backup format');
    }

    const db = await getDB();
    await db.importAllData(backup.data);
    console.info('[Backup] Restored from Google Drive (saved at', backup.savedAt, ')');
    return 'ok';
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'NO_TOKEN' || msg === 'TOKEN_EXPIRED') return 'no-session';
    console.error('[Backup] Restore failed:', e);
    return 'error';
  }
}
