import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/personal/',
  define: {
    __APP_BUILD_ID__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [react()],
})
