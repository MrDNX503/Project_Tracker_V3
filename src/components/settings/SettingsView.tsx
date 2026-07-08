import { useState } from 'react';
import { useT, useLangStore } from '../../i18n';
import { Globe } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useSusan } from '../../hooks/useSusan';
import { Button, Input } from '../ui';
import { Moon, Sun, Key, Calendar, HardDrive, Download, Upload, Trash2, CheckCircle2, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useGoogleLogin } from '@react-oauth/google';
import { GOOGLE_SCOPES } from '../../config';
import { fetchUserProfile, getStoredProfile, saveSession, signOut } from '../../services/auth';
import { backupNow, restoreFromDrive, getLastBackupTime } from '../../services/driveBackup';
import { getDB } from '../../db';

export function SettingsView() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const { theme, setTheme } = useTheme();
  const { initializeSusan, apiKey: currentApiKey } = useSusan();
  const setCalendarConnected = useAppStore(s => s.setCalendarConnected);
  const calendarConnected = useAppStore(s => s.calendarConnected);

  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [profile, setProfile] = useState(getStoredProfile);

  const [isSaved, setIsSaved] = useState(false);
  const [backupBusy, setBackupBusy] = useState(false);
  const [lastBackup, setLastBackup] = useState(getLastBackupTime());

  const handleBackupNow = async () => {
    setBackupBusy(true);
    const result = await backupNow();
    setBackupBusy(false);
    if (result === 'ok') { setLastBackup(getLastBackupTime()); showSaved(); }
    else if (result === 'no-session') alert('Tu sesión de Google expiró. Presiona "Reconnect Calendar" y vuelve a intentar.');
    else alert('El respaldo falló. Revisa la consola para más detalles.');
  };

  const handleRestore = async () => {
    if (!window.confirm('Esto REEMPLAZARÁ todos los datos locales con el respaldo de Google Drive. ¿Continuar?')) return;
    setBackupBusy(true);
    const result = await restoreFromDrive();
    setBackupBusy(false);
    if (result === 'ok') { alert('Datos restaurados. La app se recargará.'); window.location.reload(); }
    else if (result === 'not-found') alert('No hay ningún respaldo en Google Drive todavía.');
    else if (result === 'no-session') alert('Tu sesión de Google expiró. Reconéctate primero.');
    else alert('La restauración falló. Revisa la consola.');
  };

  const handleExportFile = async () => {
    const db = await getDB();
    const dump = await db.exportAllData();
    const json = JSON.stringify({ version: '3.0.0', appName: 'KashFinance Project Tracker V3', savedAt: new Date().toISOString(), data: dump }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kashtracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const backup = JSON.parse(await file.text());
        if (!backup?.data || backup.appName !== 'KashFinance Project Tracker V3') throw new Error('Formato inválido');
        if (!window.confirm('Esto REEMPLAZARÁ todos los datos locales con el archivo. ¿Continuar?')) return;
        const db = await getDB();
        await db.importAllData(backup.data);
        alert('Datos importados. La app se recargará.');
        window.location.reload();
      } catch (e) {
        alert(`No se pudo importar: ${e instanceof Error ? e.message : e}`);
      }
    };
    input.click();
  };

  const handleSaveAPIKey = () => {
    localStorage.setItem('kash_gemini_api_key', apiKey);
    initializeSusan(apiKey);
    showSaved();
  };

  // Refresh the Google session/token (also renews Calendar access)
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const p = await fetchUserProfile(tokenResponse.access_token);
        saveSession(p, tokenResponse.access_token);
        setProfile(p);
        setCalendarConnected(true);
        showSaved();
      } catch (e) {
        console.error('[Auth] Post-login error:', e);
        alert(`Login OK pero falló al obtener el perfil: ${e instanceof Error ? e.message : e}`);
      }
    },
    scope: GOOGLE_SCOPES,
    onError: () => alert('Login Failed')
  });

  const showSaved = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) {
      indexedDB.deleteDatabase('kashfinance_v3');
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{t('settings.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>{t('settings.subtitle')}</p>
      </header>

      {isSaved && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', borderRadius: '8px', textAlign: 'center' }}>
          {t('settings.saved')}
        </div>
      )}

      {/* Appearance */}
      <section className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sun size={20} /> {t('settings.appearance')}
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            variant={theme === 'dark' ? 'primary' : 'secondary'} 
            onClick={() => setTheme('dark')}
            icon={<Moon size={16} />}
          >
            Nebula Dark
          </Button>
          <Button 
            variant={theme === 'light' ? 'primary' : 'secondary'} 
            onClick={() => setTheme('light')}
            icon={<Sun size={16} />}
          >
            Crystal Light
          </Button>
        </div>
      </section>

      {/* Language */}
      <section className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={20} /> {t('settings.language')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {t('settings.language.desc')}
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant={lang === 'es' ? 'primary' : 'secondary'} onClick={() => setLang('es')}>
            Español
          </Button>
          <Button variant={lang === 'en' ? 'primary' : 'secondary'} onClick={() => setLang('en')}>
            English
          </Button>
        </div>
      </section>

      {/* Susan AI Integration */}
      <section className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={20} /> Susan AI (Gemini)
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Enter your Google Gemini API key to enable Susan AI features. Your key is stored securely in your browser's local storage and is never sent anywhere else.
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input 
              type="password" 
              label="Gemini API Key" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder="AIzaSy..." 
            />
          </div>
          <Button variant="primary" onClick={handleSaveAPIKey}>Save Key</Button>
        </div>
      </section>

      {/* Google Calendar */}
      <section className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} /> Google Calendar
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Sign in with Google to sync your daily plan with Google Calendar.
          One sign-in grants everything — no manual configuration. If sync stops
          working (tokens expire after ~1 hour), press Reconnect. Your password
          is managed by Google, not by this app.
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {profile && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {profile.picture && (
                <img src={profile.picture} alt="" width={28} height={28} style={{ borderRadius: '50%' }} referrerPolicy="no-referrer" />
              )}
              {profile.email}
            </span>
          )}
          <Button
            variant="primary"
            onClick={() => login()}
            icon={calendarConnected ? <CheckCircle2 size={16} /> : undefined}
          >
            {profile
              ? (calendarConnected ? t('settings.calendar.connected') : t('settings.calendar.notconnected'))
              : t('settings.calendar.connect')}
          </Button>
          {profile && (
            <>
              <div style={{ flex: 1 }} />
              <Button variant="ghost" icon={<LogOut size={16} />} onClick={signOut}>
                {t('settings.signout')}
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Data Management */}
      <section className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HardDrive size={20} /> {t('settings.data')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Your data is stored locally in your browser using SQLite WASM. Every change
          is auto-backed up to a single (overwritten) file in your Google Drive.
          {lastBackup && ` Último respaldo: ${new Date(lastBackup).toLocaleString()}.`}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary" disabled={backupBusy} onClick={handleBackupNow} icon={<Upload size={16} />}>
            {backupBusy ? '...' : t('settings.backupnow')}
          </Button>
          <Button variant="secondary" disabled={backupBusy} onClick={handleRestore} icon={<Download size={16} />}>
            {t('settings.restore')}
          </Button>
          <Button variant="secondary" icon={<Download size={16} />} onClick={handleExportFile}>{t('settings.export')}</Button>
          <Button variant="secondary" icon={<Upload size={16} />} onClick={handleImportFile}>{t('settings.import')}</Button>
          <div style={{ flex: 1 }} />
          <Button variant="ghost" icon={<Trash2 size={16} />} onClick={clearData} style={{ color: 'var(--color-danger)' }}>
            {t('settings.erase')}
          </Button>
        </div>
      </section>
    </div>
  );
}
