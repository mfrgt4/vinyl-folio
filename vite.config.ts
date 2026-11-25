import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'og.png'],
      manifest: {
        name: 'Vinyl Folio',
        short_name: 'Vinyl Folio',
        description: 'Et si un site web se parcourait comme un vinyle ? Propose tes sons, écoute ceux des autres, discute autour de tes obsessions musicales.',
        theme_color: '#BF2158',
        background_color: '#E8E7E2',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})