import net from 'node:net';
import { pathToFileURL } from 'node:url';
import { app } from './app.js';
import { env } from './config/env.js';

const host = '0.0.0.0';
const port = env.PORT;

const isMainModule = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

const startServer = async () => {
  console.log(`[SERVER] Starting backend on port ${port}...`);

  await new Promise<void>((resolve, reject) => {
    const probe = net.createServer();

    probe.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`[SERVER] Port ${port} is already in use. Another backend instance may be running.`));
        return;
      }

      reject(error);
    });

    probe.once('listening', () => {
      probe.close(() => resolve());
    });

    probe.listen(port, host);
  });

  const server = app.listen(port, host, () => {
    console.log(`[SERVER] Listening on http://localhost:${port}`);
  });

  server.once('error', (error) => {
    console.error('[SERVER] Failed to start:', error instanceof Error ? error.name : 'UnknownError');
    process.exit(1);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

if (isMainModule) {
  startServer().catch((error) => {
    console.error('[SERVER] Startup failed:', error instanceof Error ? error.name : 'UnknownError');
    process.exit(1);
  });
}
