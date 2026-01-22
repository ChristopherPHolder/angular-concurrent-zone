import { isMainModule } from '@angular/ssr/node';
import Fastify from 'fastify';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import angularSsr, { createFastifyRequestHandler } from './server/ssr.plugin';

function buildServer() {
  const app = Fastify({ logger: false });

  app.register(fastifyStatic, {
    root: resolve(dirname(fileURLToPath(import.meta.url)), '../browser'),
    wildcard: false,
  });

  app.get('/health', (req, reply) => {
    return reply.code(200).send('OK');
  });

  app.register(angularSsr);

  return app;
}

const serverApp = buildServer();

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  await serverApp.listen({ port: Number(port), host: '0.0.0.0' });
} else {
  serverApp.log.info('Build dev server');
}

/**
 * Expose request handler for angular dev server
 */
export const reqHandler = createFastifyRequestHandler(serverApp);
