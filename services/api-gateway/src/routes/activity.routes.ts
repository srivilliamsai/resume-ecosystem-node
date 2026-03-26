// services/api-gateway/src/routes/activity.routes.ts
import { FastifyInstance } from 'fastify';

const ACTIVITY_URL = process.env.ACTIVITY_URL || 'http://localhost:4020';

const activitySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    type: { type: 'string' },
    issuer: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    impactScore: { type: 'number' },
    verified: { type: 'boolean' }
  }
};

export async function activityRoutes(app: FastifyInstance) {

  // Create Activity
  app.post('/activities', {
    schema: {
      tags: ['Activity'],
      security: [{ BearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title', 'type'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['education', 'experience', 'project', 'certification'] },
          issuer: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          certificateUrl: { type: 'string' },
          impactScore: { type: 'number', minimum: 1, maximum: 10 }
        }
      },
      response: {
        201: activitySchema,
        400: { type: 'object', properties: { error: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    try {
      const response = await fetch(`${ACTIVITY_URL}/activities`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || ''
        },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Activity service unavailable' });
    }
  });

  // List Activities
  app.get('/activities', {
    schema: {
      tags: ['Activity'],
      security: [{ BearerAuth: [] }],
      querystring: {
        page: { type: 'number', default: 1 },
        limit: { type: 'number', default: 10 },
        type: { type: 'string' },
        status: { type: 'string' }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            activities: { type: 'array', items: activitySchema },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' }
          }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const query = new URLSearchParams(req.query as any).toString();
      const response = await fetch(`${ACTIVITY_URL}/activities?${query}`, {
        headers: { 'Authorization': req.headers.authorization || '' }
      });
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Activity service unavailable' });
    }
  });

  // Get Activity
  app.get('/activities/:id', {
    schema: {
      tags: ['Activity'],
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      response: {
        200: activitySchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const response = await fetch(`${ACTIVITY_URL}/activities/${id}`, {
        headers: { 'Authorization': req.headers.authorization || '' }
      });
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Activity service unavailable' });
    }
  });

  // Update Activity
  app.patch('/activities/:id', {
    schema: {
      tags: ['Activity'],
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          impactScore: { type: 'number' }
          // partial update
        }
      },
      response: {
        200: activitySchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const response = await fetch(`${ACTIVITY_URL}/activities/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || ''
        },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Activity service unavailable' });
    }
  });

  // Delete Activity
  app.delete('/activities/:id', {
    schema: {
      tags: ['Activity'],
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      response: {
        204: { type: 'null' },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const response = await fetch(`${ACTIVITY_URL}/activities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': req.headers.authorization || '' }
      });
      if (response.status === 204) return reply.code(204).send();
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (err) {
      return reply.code(500).send({ error: 'Activity service unavailable' });
    }
  });
}
