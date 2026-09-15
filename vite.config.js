import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

function syncStaticAssets() {
  const sync = () => {
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true })
    }
    if (fs.existsSync('script.js')) {
      fs.copyFileSync('script.js', 'public/script.js')
    }
    if (fs.existsSync('style.css')) {
      fs.copyFileSync('style.css', 'public/style.css')
    }
  }

  return {
    name: 'sync-static-assets',
    buildStart() {
      sync()
    },
    configureServer() {
      sync()
    },
    closeBundle() {
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist', { recursive: true })
      }
      if (fs.existsSync('script.js')) {
        fs.copyFileSync('script.js', 'dist/script.js')
      }
      if (fs.existsSync('style.css')) {
        fs.copyFileSync('style.css', 'dist/style.css')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncStaticAssets()],
})

