import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte()
  ],
  server: {
    proxy: {
      '/api/route': {
        target: 'https://router.project-osrm.org',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/route/, '/route/v1/driving')
      },
      '/api/tiles/light': {
        target: 'https://a.basemaps.cartocdn.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/tiles\/light/, '/light_all')
      },
      '/api/tiles/dark': {
        target: 'https://a.basemaps.cartocdn.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/tiles\/dark/, '/dark_all')
      }
    }
  }
})
