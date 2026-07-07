// ============================================================
// LoginPage — Google sign-in gate
// ============================================================

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { GOOGLE_SCOPES } from '../../config';
import {
  fetchUserProfile,
  isEmailAllowed,
  saveSession,
  type UserProfile,
} from '../../services/auth';

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    scope: GOOGLE_SCOPES,
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const profile = await fetchUserProfile(tokenResponse.access_token);
        if (!isEmailAllowed(profile.email)) {
          setError(`La cuenta ${profile.email} no tiene acceso a esta app.`);
          return;
        }
        saveSession(profile, tokenResponse.access_token);
        onLogin(profile);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('No se pudo iniciar sesión con Google.'),
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'var(--bg-base, #0a0e1a)',
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: '2.5rem 2rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          alignItems: 'center',
        }}
      >
        {/* Susan avatar */}
        <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
          <defs>
            <linearGradient id="g-login" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00d4ff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect x="12" y="16" width="40" height="36" rx="8" fill="url(#g-login)" />
          <line x1="32" y1="16" x2="32" y2="6" stroke="url(#g-login)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="4" r="3" fill="#00d4ff" />
          <circle cx="22" cy="32" r="5" fill="#0a0e1a" />
          <circle cx="42" cy="32" r="5" fill="#0a0e1a" />
          <circle cx="23" cy="31" r="2" fill="#fff" />
          <circle cx="43" cy="31" r="2" fill="#fff" />
          <rect x="24" y="42" width="16" height="3" rx="1.5" fill="#0a0e1a" />
        </svg>

        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
            Project Tracker V3
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Inicia sesión con tu cuenta de Google. El mismo permiso conecta tu
            Google Calendar — sin configuración extra.
          </p>
        </div>

        <button
          onClick={() => login()}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-default, #334155)',
            background: '#fff',
            color: '#1f2937',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {/* Google "G" logo */}
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {loading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        {error && (
          <p style={{ margin: 0, color: 'var(--color-danger, #ef4444)', fontSize: '0.85rem' }}>
            {error}
          </p>
        )}

        <p style={{ margin: 0, color: 'var(--text-tertiary, #64748b)', fontSize: '0.75rem' }}>
          Tus datos se guardan localmente en este dispositivo.
        </p>
      </div>
    </div>
  );
}
