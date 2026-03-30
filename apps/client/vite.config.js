import { defineConfig } from 'vite';
import path from 'path'; // pathをインポート
import UnoCSS from 'unocss/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      share: path.resolve(__dirname, '../share/index.ts'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
