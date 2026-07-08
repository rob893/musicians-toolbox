import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

// https://vite.dev/config/
// Set VITE_BASE_PATH (e.g. '/click-track-builder/') for GitHub Pages project-site deployment.
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Click Track Builder',
          short_name: 'Click Track',
          description: 'A metronome and click-track exporter — set BPM and time signature, then export a WAV.',
          theme_color: '#0b0f19',
          background_color: '#0b0f19',
          display: 'standalone',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    base: process.env.VITE_BASE_PATH || '/',
    publicDir: 'public',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      sourcemap: !isProd
    }
  } satisfies UserConfig;
});
