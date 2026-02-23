import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    allowedHosts: [
      '.emergentagent.com',
      '.emergentcf.cloud',
      '.preview.emergentagent.com',
      'localhost'
    ],
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2020",
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1500,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Group Three.js and related 3D libraries first (most specific)
            if (id.includes("three") || id.includes("@react-three")) {
              return "vendor-3d";
            }
            // Group Radix UI components
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            // Group routing libraries
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            // Group charting libraries
            if (id.includes("recharts") || id.includes("d3")) {
              return "vendor-charts";
            }
            // Group animation libraries
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            // Group Supabase
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            // Group icons
            if (id.includes("lucide")) {
              return "vendor-icons";
            }
            // Group React core last (most general, must come after router check)
            if (id.includes("react-dom") || id.includes("react")) {
              return "vendor-react";
            }
          }
        },
      },
    },
  },
}));
