// services/api-gateway/src/routes/resume.routes.ts
import { FastifyInstance } from 'fastify';

const RESUME_URL = process.env.RESUME_URL || 'http://localhost:4040';

export async function resumeRoutes(app: FastifyInstance) {

  app.get('/resume/latest', {
    schema: {
      tags: ['Resume'],
      security: [{ BearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            version: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            score: { type: 'number' },
            downloadUrl: { type: 'string' },
            createdAt: { type: 'string' }
          }
        },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    try {
      const response = await fetch(`${RESUME_URL}/resume/latest`, {
        headers: { 'Authorization': req.headers.authorization || '' }
      });
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Resume service unavailable' });
    }
  });

  app.post('/resume/rebuild', {
    schema: {
      tags: ['Resume'],
      security: [{ BearerAuth: [] }],
      response: {
        202: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            jobId: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const response = await fetch(`${RESUME_URL}/resume/rebuild`, {
        method: 'POST',
        headers: { 'Authorization': req.headers.authorization || '' }
      });
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Resume service unavailable' });
    }
  });

  app.get('/resume/versions', {
    schema: {
      tags: ['Resume'],
      security: [{ BearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              version: { type: 'number' },
              createdAt: { type: 'string' },
              score: { type: 'number' }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const response = await fetch(`${RESUME_URL}/resume/versions`, {
        headers: { 'Authorization': req.headers.authorization || '' }
      });
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Resume service unavailable' });
    }
  });

  app.get('/resume/download/:version', {
    schema: {
      tags: ['Resume'],
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        properties: { version: { type: 'number' } }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            downloadUrl: { type: 'string' },
            expiresAt: { type: 'string' }
          }
        },
        302: { description: 'Redirect to file' }
      }
    }
  }, async (req, reply) => {
    try {
      const { version } = req.params as { version: string };
      const response = await fetch(`${RESUME_URL}/resume/download/${version}`, {
        headers: { 'Authorization': req.headers.authorization || '' }
      });
      // If service returns redirect
      if (response.redirected) {
        return reply.redirect(response.url);
      }
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Resume service unavailable' });
    }
  });
}
