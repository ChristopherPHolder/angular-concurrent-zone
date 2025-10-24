import {
  createNodeRequestHandler,
  createWebRequestFromNodeRequest,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import { AngularAppEngine } from '@angular/ssr';
import Fastify, { FastifyRequest } from 'fastify';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';
import type { IncomingMessage } from 'node:http';
import fastifyStatic from '@fastify/static';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = Fastify({
  logger: false
});

const angularApp = new AngularAppEngine();

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
async function buildServer() {
  // Register static file serving plugin with a specific prefix
  await app.register(fastifyStatic, {
    root: resolve(dirname(fileURLToPath(import.meta.url)), '../browser'),
    wildcard: false,
  });

  app.get('/health', async (req, reply) => {
    console.log(req.url);

    await setTimeout(5_000);
    console.log('REQUEST HELLO timer end');
    return reply.code(200).send('health');
  })

  /**
   * Handle all other requests by rendering the Angular application.
   */
  app.get('/*', async (request, reply) => {
    console.log('Running request route', request.url);

    try {
      const response = await angularApp.handle(convertToNgRequest(request));

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

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
// if (isMainModule(import.meta.url)) {
  buildServer()
    .then(async (server) => {
      const port = process.env['PORT'] || 4000;
      try {
        await server.listen({ port: Number(port), host: '0.0.0.0' });
        console.log(`Node Fastify server listening on http://localhost:${port}`);
      } catch (err) {
        server.log.error(err);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Error building server:', err);
      process.exit(1);
    });
// }

function convertToNgRequest(req: FastifyRequest) {
  const { socket, originalUrl, url = '', headers } = req;

  return createWebRequestFromNodeRequest({ headers, socket, url, originalUrl, method: 'GET' } as any as IncomingMessage);
}


/**
 * Expose request handler for angular dev server
 */
export const reqHandler = createNodeRequestHandler(async (req, res) => {
    await app.ready();
    app.server.emit('request', req, res);
});
