import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Defaults miss the font and the background textures, so they 404 offline.
        globPatterns: ['**/*.{js,css,html,svg,woff2,webp}'],
        navigateFallback: 'index.html',
      },
      manifest: {
        name: 'Quick Prosets',
        short_name: 'Quick Prosets',
        description: 'Single-player ProSet-based card game',
        theme_color: '#7f52c3',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  base: './',
});
