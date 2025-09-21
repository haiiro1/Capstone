import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // ✅ directorio de salida
  },
  server: {
    port: 5173,
    open: false,
  },
});