import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm}'],
      },
      manifest: {
        name: 'Project Tracker V3',
        short_name: 'Project Tracker V3',
        description: 'AI-powered project tracker & daily planner with Susan AI assistant',
        theme_color: '#0a0e1a',
        background_color: '#0a0e1a',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        categories: ['productivity', 'utilities'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'New Project',
            short_name: 'New Project',
            url: './?action=new-project',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Daily Planner',
            short_name: 'Planner',
            url: './?view=planner',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Talk to Susan',
            short_name: 'Susan AI',
            url: './?view=susan',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['wa-sqlite'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) types only accept the function form of manualChunks
        manualChunks(id: string) {
          if (id.includes('node_modules/wa-sqlite')) return 'wa-sqlite';
          if (id.includes('node_modules/@google/generative-ai')) return 'ai';
          if (/node_modules\/(react|react-dom|zustand|scheduler)\//.test(id)) return 'vendor';
        },
      },
    },
  },
})
