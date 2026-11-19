import { createApp } from './src/server/app';
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';

// Resolve port: control plane sends `--port 3000`, container env may have `PORT=8080` for nginx.
// The app must bind to port 3000 on 0.0.0.0.
function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const p = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(p)) return p;
  }
  for (const arg of process.argv) {
    if (arg.startsWith('--port=')) {
      const p = parseInt(arg.split('=')[1], 10);
      if (!isNaN(p)) return p;
    }
  }

  if (process.env.APP_PORT) {
    const p = parseInt(process.env.APP_PORT, 10);
    if (!isNaN(p)) return p;
  }

  // Never bind to 8080 if nginx is listening on 8080
  if (process.env.PORT && process.env.PORT !== '8080') {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p)) return p;
  }

  if (process.env.DEFAULT_APP_PORT) {
    const p = parseInt(process.env.DEFAULT_APP_PORT, 10);
    if (!isNaN(p)) return p;
  }

  return 3000;
}

async function startServer() {
  const app = createApp();
  const PORT = getPort();
  const HOST = '0.0.0.0';
  const isProd = process.env.NODE_ENV === 'production';

  let viteServer: Awaited<ReturnType<(typeof import('vite'))['createServer']>> | null = null;

  if (!isProd) {
    // Initialize Vite middleware in the background so the HTTP port binds immediately
    const viteReadyPromise = import('vite').then(({ createServer }) =>
      createServer({
        server: {
          middlewareMode: true,
          hmr: false,
          ws: false,
          watch: null,
        },
        appType: 'spa',
      })
    );

    viteReadyPromise
      .then((vite) => {
        viteServer = vite;
      })
      .catch((err) => {
        console.error('[BiblioEST] Failed to initialize Vite dev middleware:', err);
      });

    app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const vite = viteServer ?? (await viteReadyPromise);
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    // In production mode, serve built static assets from dist/
    const distPath = path.resolve(import.meta.dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(
      `[BiblioEST] Server running on http://${HOST}:${PORT} in ${isProd ? 'production' : 'development'} mode`
    );
  });

  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    const forceExitTimer = setTimeout(() => process.exit(0), 1000);
    forceExitTimer.unref();

    try {
      server.closeAllConnections?.();
      server.close();
      if (viteServer) {
        await viteServer.close();
      }
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('[BiblioEST] Failed to start server:', err);
  process.exit(1);
});
