import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import Fastify from 'fastify';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';

const app = Fastify({
  logger: false,
});

const angularApp = new AngularNodeAppEngine();

/**
 * Example Fastify Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', async (request, reply) => {
 *   // Handle API request
 *   return { message: 'API response' };
 * });
 * ```
 */

/**
 * Initialize Fastify server
 */
function buildServer() {
  // Register static file serving plugin with a specific prefix
  app.register(fastifyStatic, {
    root: resolve(dirname(fileURLToPath(import.meta.url)), '../browser'),
    wildcard: false,
  });

  app.get('/health', async (req, reply) => {
    return (
      reply
        .code(200)
        .send('OK')
    );
  })

  /**
   * Handle all other requests by rendering the Angular application.
   */
  app.get('/*', async (request, reply) => {
    try {
      const response = await angularApp.handle(request.raw);

      if (response) {
        return writeResponseToNodeResponse(response, reply.raw);
      }

      return reply.code(404).send('Not Found');
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send('Internal Server Error');
    }
  });

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
}


/**
 * Expose request handler for angular dev server
 */
export const reqHandler = createNodeRequestHandler(async (req, res) => {
    await app.ready();
    app.server.emit('request', req, res);
});
