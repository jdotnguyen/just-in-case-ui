/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Library build. The demo app has its own config (vite.demo.config.ts),
// so no demo code ends up in dist/.
export default defineConfig({
  plugins: [
    react(),
    dts({ tsconfigPath: './tsconfig.build.json', entryRoot: 'src' }),
  ],
  css: {
    modules: { generateScopedName: 'jic-[local]-[hash:base64:5]' },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'demo/**/*.test.{ts,tsx}'],
  },
});
