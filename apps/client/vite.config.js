import path from "path"; // pathをインポート
import UnoCSS from "unocss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig, lazyPlugins } from "vite-plus";

export default defineConfig({
  plugins: lazyPlugins(() => [vue(), UnoCSS()]),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      share: path.resolve(__dirname, "../share/index.ts"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  run: {
    tasks: {
      typecheck: {
        command: "vue-tsc --noEmit -p tsconfig.json",
      },
    },
  },
});
