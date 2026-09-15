import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
    if (fs.existsSync('admin.html')) {
      fs.copyFileSync('admin.html', 'public/admin.html')
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
      if (fs.existsSync('admin.html')) {
        fs.copyFileSync('admin.html', 'dist/admin.html')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncStaticAssets()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html'),
      },
    },
  },
})


