import { cloudflare } from '@cloudflare/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

const cloudflarePlugin = process.env.DISABLE_CLOUDFLARE === 'true' ? [] : [cloudflare()];

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), ...cloudflarePlugin, UnoCSS()],
  resolve: { alias: { '@/': fileURLToPath(new URL('./', import.meta.url)) } },
  server: {
    host: true, // Listen on all interfaces (localhost, 127.0.0.1, etc.)
  },
});
