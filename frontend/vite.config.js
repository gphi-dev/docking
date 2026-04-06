import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Default to 3001: port 3000 is often another local app returning HTML 404 for /api/*.
  const apiProxyTarget = env.VITE_DEV_API_PROXY_TARGET || "http://127.0.0.1:3001";

  const apiProxyConfig = {
    "/api": {
      target: apiProxyTarget,
      changeOrigin: true,
    },
    "/health": {
      target: apiProxyTarget,
      changeOrigin: true,
    },
  };

  return {
    plugins: [vue()],
    server: {
      port: 5173,
      proxy: apiProxyConfig,
    },
    preview: {
      port: 4173,
      proxy: apiProxyConfig,
    },
  };
});
