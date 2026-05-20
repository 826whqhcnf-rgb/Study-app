import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: { env: Record<string, string | undefined> };

// When deployed to GitHub Pages the app is served from
// https://<user>.github.io/<repo>/, so production assets need a base
// path matching the repo name. Set VITE_BASE in CI to override.
const base = process.env.VITE_BASE ?? '/Study-app/';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? base : '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
}));
