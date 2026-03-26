// services/api-gateway/src/plugins/swagger.ts
import fp from 'fastify-plugin';
import swagger, { FastifySwaggerOptions } from '@fastify/swagger';
import swaggerUi, { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Resume Ecosystem API',
        description: 'Event-driven resume builder API',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      servers: [
        {
          url: 'http://localhost:4000',
          description: 'Local server'
        }
      ]
    }
  } as FastifySwaggerOptions);

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    },
    theme: {
      title: 'Resume Ecosystem Docs'
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
  } as FastifySwaggerUiOptions);
});
