import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/food/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app-types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@builder': path.resolve(__dirname, './src/builder'),
      '@cookbook': path.resolve(__dirname, './src/cookbook'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react';
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/@dnd-kit')) return 'dndkit';
          if (id.includes('node_modules/framer-motion')) return 'motion';
          if (id.includes('node_modules/zustand')) return 'zustand';
        },
      },
    },
  },
});
