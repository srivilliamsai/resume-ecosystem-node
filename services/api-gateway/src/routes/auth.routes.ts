// services/api-gateway/src/routes/auth.routes.ts
import { FastifyInstance } from 'fastify';

const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4010';

export async function authRoutes(app: FastifyInstance) {
  
  app.post('/auth/register', {
    schema: {
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: { error: { type: 'string' } }
        },
        409: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const response = await fetch(`${AUTH_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Auth service unavailable' });
    }
  });

  app.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const response = await fetch(`${AUTH_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Auth service unavailable' });
    }
  });

  app.get('/auth/me', {
    schema: {
      tags: ['Auth'],
      security: [{ BearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            createdAt: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const token = req.headers.authorization;
      const response = await fetch(`${AUTH_URL}/auth/me`, {
        headers: { 'Authorization': token || '' }
      });
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Auth service unavailable' });
    }
  });
}
