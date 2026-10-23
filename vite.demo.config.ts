import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Kitchen-sink demo app: `npm run dev`. Not part of the library build.
export default defineConfig({
  root: 'demo',
  plugins: [react()],
  css: {
    modules: { generateScopedName: 'jic-[local]-[hash:base64:5]' },
  },
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
});
