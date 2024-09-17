import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
// import typescript from '@rollup/plugin-typescript';
import tla from 'rollup-plugin-tla';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom'
  },
  server: {
    // Configure server options
    headers: {
      // Add the required headers for cross-origin isolation
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    target: "esnext",
    minify: false,
    modulePreload: {
      polyfill: false
    },
  },
});
