import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Limit coverage to test files so the coverage run focuses on executed tests
    coverage: {
      provider: 'v8',
      include: ['src/__tests__/**/*.{ts,tsx}'],
      reporter: ['text', 'lcov'],
      all: true
    }
  }
})
