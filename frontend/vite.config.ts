import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: { outDir: "dist" },
  server: {
    proxy: mode === "development" ? {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    } : undefined,
  },
}));