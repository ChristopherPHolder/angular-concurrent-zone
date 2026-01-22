import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import { fastifyPlugin } from 'fastify-plugin';

const angularSsrPlugin: FastifyPluginAsync = async (instance) => {
  const angularApp = new AngularNodeAppEngine();

  instance.get('/*', async (request, reply) => {
    try {
      const response = await angularApp.handle(request.raw);

      if (response) {
        return writeResponseToNodeResponse(response, reply.raw);
      }

      return reply.code(404).send('Not Found');
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send('Internal Server Error');
    }
  });
};

export default fastifyPlugin(angularSsrPlugin, {
  name: 'angular-ssr-plugin',
});

export function createFastifyRequestHandler(instance: FastifyInstance) {
  return createNodeRequestHandler(async (req, res) => {
    await instance.ready();
    instance.server.emit('request', req, res);
  });
}
