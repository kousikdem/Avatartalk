/**
 * Vite dev-only plugin: serves `/api/*` Vercel serverless functions
 * locally so the Emergent preview can exercise the same handlers that
 * production Vercel runs.
 *
 * Resolution:
 *   /api/profile/by-username/foo  →  /app/api/profile/by-username/[username].ts
 *   /api/payment/x/y              →  /app/api/payment/x/y.ts
 *
 * The handler is loaded via Vite's `ssrLoadModule` so TypeScript and
 * ESM imports just work. The Express req/res are wrapped in a tiny
 * shim that mimics `@vercel/node`'s VercelRequest / VercelResponse
 * surface our handlers actually use (status, json, setHeader, end,
 * body, query, headers, method).
 *
 * This file is NEVER bundled into the production build.
 */
import type { Plugin, ViteDevServer, Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// /app/frontend/vite-plugins  →  /app/api
const API_ROOT = path.resolve(__dirname, '../../api');

interface MaybeBodyReq extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
}

/** Load /app/backend/.env into process.env (idempotent). */
function loadBackendEnv() {
  const candidates = [
    path.resolve(__dirname, '../../backend/.env'),
    path.resolve(__dirname, '../../.env'),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      const [, key, rawVal] = m;
      if (process.env[key]) continue; // don't override
      let val = rawVal.trim();
      // strip wrapping quotes
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

/**
 * Node < 22 needs a WebSocket polyfill for @supabase/realtime-js. On
 * Vercel production Node 22+ this is a native global; here in the
 * Emergent dev environment (Node 20) we install it onto globalThis at
 * plugin-startup so the Vercel handlers don't have to worry about it.
 */
async function ensureWebSocketGlobal() {
  if (typeof (globalThis as any).WebSocket !== 'undefined') return;
  try {
    const { createRequire } = await import('module');
    const req = createRequire(import.meta.url);
    const ws = req('ws');
    // `ws` exports the WebSocket class as both default (CJS) and as
    // `.WebSocket` named. Take the class, NOT the whole module — the
    // module-as-global would interfere with undici's fetch internals.
    (globalThis as any).WebSocket = ws.WebSocket || ws;
  } catch (e) {
    console.warn('[dev-api] ws polyfill failed:', e);
  }
}

/**
 * Resolve the URL pathname (e.g. "/api/profile/by-username/alice") to
 * an absolute filesystem path under /app/api. Supports dynamic `[name]`
 * segments — the captured value is stored on `query[name]`.
 */
function resolveHandlerFile(
  urlPath: string,
): { file: string; params: Record<string, string> } | null {
  // strip /api/ prefix and any query string
  const cleaned = urlPath.replace(/^\/api\//, '').split('?')[0];
  const segments = cleaned.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  let currentDir = API_ROOT;
  const params: Record<string, string> = {};

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const isLast = i === segments.length - 1;

    if (isLast) {
      // Try exact .ts file first
      const direct = path.join(currentDir, `${seg}.ts`);
      if (fs.existsSync(direct)) return { file: direct, params };

      // Then directory with index.ts
      const idx = path.join(currentDir, seg, 'index.ts');
      if (fs.existsSync(idx)) return { file: idx, params };

      // Then dynamic [param].ts in current dir
      const entries = fs.readdirSync(currentDir);
      const dynamic = entries.find(
        (e) => /^\[.+\]\.ts$/.test(e),
      );
      if (dynamic) {
        const paramName = dynamic.slice(1, -4); // strip [ and ].ts
        params[paramName] = decodeURIComponent(seg);
        return { file: path.join(currentDir, dynamic), params };
      }
      return null;
    }

    // intermediate segment — match dir
    const dirPath = path.join(currentDir, seg);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      currentDir = dirPath;
      continue;
    }
    // dynamic intermediate
    const entries = fs.readdirSync(currentDir);
    const dynamic = entries.find((e) => {
      const full = path.join(currentDir, e);
      return /^\[.+\]$/.test(e) && fs.statSync(full).isDirectory();
    });
    if (dynamic) {
      const paramName = dynamic.slice(1, -1);
      params[paramName] = decodeURIComponent(seg);
      currentDir = path.join(currentDir, dynamic);
      continue;
    }
    return null;
  }
  return null;
}

async function parseBody(req: MaybeBodyReq): Promise<any> {
  if (req.body !== undefined) return req.body;
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;

  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      const raw = Buffer.concat(chunks).toString('utf8');
      const ct = req.headers['content-type'] || '';
      if (ct.includes('application/json')) {
        try {
          return resolve(JSON.parse(raw));
        } catch {
          return resolve({});
        }
      }
      resolve(raw);
    });
    req.on('error', () => resolve({}));
  });
}

function shimResponse(res: ServerResponse) {
  // Augment with Vercel-style chainable helpers
  const r = res as any;
  r.status = (code: number) => {
    r.statusCode = code;
    return r;
  };
  r.json = (payload: any) => {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(payload));
    return r;
  };
  r.send = (payload: any) => {
    if (typeof payload === 'object' && payload !== null) {
      return r.json(payload);
    }
    res.end(String(payload ?? ''));
    return r;
  };
  return r;
}

export function devApiPlugin(): Plugin {
  return {
    name: 'avatartalk:dev-api',
    apply: 'serve',
    async configResolved() {
      loadBackendEnv();
      await ensureWebSocketGlobal();
    },
    configureServer(server: ViteDevServer) {
      const middleware: Connect.NextHandleFunction = async (
        req,
        res,
        next,
      ) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();

        const resolved = resolveHandlerFile(req.url);
        if (!resolved) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(
            JSON.stringify({
              success: false,
              error: `No handler for ${req.url}`,
            }),
          );
        }

        try {
          const mod = await server.ssrLoadModule(resolved.file);
          const handler = mod.default || mod.handler;
          if (typeof handler !== 'function') {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(
              JSON.stringify({
                success: false,
                error: `Handler ${resolved.file} has no default export`,
              }),
            );
          }

          // Parse body and query
          const url = new URL(req.url, 'http://localhost');
          const query: Record<string, string | string[]> = { ...resolved.params };
          url.searchParams.forEach((value, key) => {
            if (key in query) {
              const existing = query[key];
              query[key] = Array.isArray(existing)
                ? [...existing, value]
                : [existing as string, value];
            } else {
              query[key] = value;
            }
          });

          const body = await parseBody(req as MaybeBodyReq);

          const vReq = req as any;
          vReq.body = body;
          vReq.query = query;
          // VercelRequest.cookies (we don't use it but populate empty)
          if (!vReq.cookies) vReq.cookies = {};

          const vRes = shimResponse(res);
          await handler(vReq, vRes);
        } catch (err: any) {
          console.error(`[dev-api] ${req.url} threw:`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                error: err?.message || 'Internal error',
                stack:
                  process.env.NODE_ENV !== 'production' ? err?.stack : undefined,
              }),
            );
          }
        }
      };

      // Run before Vite's own middlewares so /api requests don't fall
      // through to the SPA index.html.
      server.middlewares.use(middleware);
    },
  };
}

export default devApiPlugin;
