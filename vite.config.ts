import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

function githubBase(): string {
  if (process.env.BASE_PATH) return process.env.BASE_PATH;
  const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
  if (process.env.GITHUB_ACTIONS && repository && !repository.endsWith(".github.io")) {
    return `/${repository}/`;
  }
  return "/";
}

export default defineConfig({
  base: githubBase(),
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.svg", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"],
      manifest: {
        name: "Language Learner",
        short_name: "Language",
        description: "Practical language learning with offline-first lessons and character practice.",
        lang: "en",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "any",
        background_color: "#f8f4ef",
        theme_color: "#f8f4ef",
        categories: ["education", "travel"],
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,json}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: "index.html",
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024
      },
      devOptions: { enabled: true, navigateFallback: "index.html" }
    })
  ]
});
