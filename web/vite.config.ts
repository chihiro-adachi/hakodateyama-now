import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-data',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/hakodateyama-now/data/')) {
            const filePath = resolve(__dirname, '..', req.url.replace('/hakodateyama-now/', ''));
            if (existsSync(filePath)) {
              res.setHeader('Content-Type', 'application/json');
              res.end(readFileSync(filePath));
              return;
            }
          }
          next();
        });
      },
    },
  ],
  root: 'web',
  base: '/hakodateyama-now/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
});
