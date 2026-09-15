import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor'
          if (id.includes('node_modules/@supabase/')) return 'supabase'
          if (id.includes('node_modules/recharts/')) return 'recharts'
          if (id.includes('node_modules/motion/')) return 'motion'
          if (id.includes('node_modules/lucide-react/')) return 'icons'
        },
      },
    },
  },
})
