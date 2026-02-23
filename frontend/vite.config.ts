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
    reportCompressedSize: false, // Faster builds
    rollupOptions: {
      output: {
        // Optimize for initial load
        experimentalMinChunkSize: 20000, // Merge small chunks
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Critical path - load first (combine react core)
            if (id.includes("react/jsx") || id.includes("react-dom") || 
                (id.includes("react") && !id.includes("react-router") && !id.includes("@react-three"))) {
              return "vendor-react";
            }
            
            // UI framework - load second
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            
            // Routing - needed for navigation
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            
            // Supabase - needed for auth
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            
            // Defer heavy libraries
            if (id.includes("three") || id.includes("@react-three")) {
              return "vendor-3d";
            }
            if (id.includes("recharts") || id.includes("d3")) {
              return "vendor-charts";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide")) {
              return "vendor-icons";
            }
          }
        },
      },
    },
  },
}));
