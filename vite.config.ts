import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { inspectorServer } from '@react-dev-inspector/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    UnoCSS(),
    inspectorServer()
  ],
  server: {
    host: true,
    port: 3000
  }
})
