import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // The coi-serviceworker handles COOP/COEP headers
    // The PWA service worker is registered by vite-plugin-pwa
  });
}

// Track online/offline status
window.addEventListener('online', () => {
  import('./store/useAppStore').then(({ useAppStore }) => {
    useAppStore.getState().setOnline(true);
  });
});

window.addEventListener('offline', () => {
  import('./store/useAppStore').then(({ useAppStore }) => {
    useAppStore.getState().setOnline(false);
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
