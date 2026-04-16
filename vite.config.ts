import path from 'path';
import { readFileSync } from 'fs';
import { defineConfig, type ViteDevServer, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { IncomingMessage, ServerResponse } from 'http';

function apiRoutesPlugin(): Plugin {
  return {
    name: 'api-routes',
    config() {
      // Load .env.local into process.env for server-side API handlers
      try {
        const envContent = readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8');
        for (const line of envContent.split('\n')) {
          const idx = line.indexOf('=');
          if (idx > 0) {
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx + 1).trim();
            if (key && !process.env[key]) process.env[key] = val;
          }
        }
      } catch {}
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/')) return next();

        // Parse JSON body for POST
        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          await new Promise<void>((resolve) => {
            req.on('data', (c: Buffer) => chunks.push(c));
            req.on('end', resolve);
          });
          try {
            (req as any).body = JSON.parse(Buffer.concat(chunks).toString());
          } catch {
            (req as any).body = {};
          }
        }

        // Express-compatible response shim
        const mockRes: any = {
          _statusCode: 200,
          _headers: {} as Record<string, string>,
          setHeader(k: string, v: string) { this._headers[k] = v; return this; },
          status(code: number) { this._statusCode = code; return this; },
          json(data: unknown) {
            res.writeHead(this._statusCode, { 'Content-Type': 'application/json', ...this._headers });
            res.end(JSON.stringify(data));
          },
        };

        const route = req.url.replace(/^\/api\//, '').replace(/\?.*$/, '');
        try {
          const mod = await server.ssrLoadModule(`/api/${route}.js`);
          await mod.default(req, mockRes);
        } catch (e) {
          console.error(`API route error [${route}]:`, e);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    },
  };
}

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), tailwindcss(), apiRoutesPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
