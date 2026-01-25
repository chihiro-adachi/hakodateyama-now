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
        const dataDir = resolve(__dirname, '..', '..', 'data');
        if (!existsSync(dataDir)) {
          console.warn(`[serve-data] Warning: data directory not found at ${dataDir}`);
        }

        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/hakodateyama-now/data/')) {
            const relativePath = req.url.replace('/hakodateyama-now/', '');
            const filePath = resolve(__dirname, '..', '..', relativePath);

            if (!existsSync(filePath)) {
              next();
              return;
            }

            try {
              const content = readFileSync(filePath);
              res.setHeader('Content-Type', 'application/json');
              res.end(content);
            } catch (error) {
              console.error(`[serve-data] Failed to read file: ${filePath}`, error);
              res.statusCode = 500;
              res.end('Internal Server Error');
            }
            return;
          }
          next();
        });
      },
    },
  ],
  base: '/hakodateyama-now/',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
});
