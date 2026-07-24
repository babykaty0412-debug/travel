import { defineConfig } from 'vite';

// GitHub Pages 專案站台路徑為 /travel/
export default defineConfig({
  base: '/travel/',
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: false,
  },
});
