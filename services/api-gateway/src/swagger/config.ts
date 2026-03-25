// services/api-gateway/src/swagger/config.ts
// Swagger/OpenAPI configuration for resume-ecosystem API Gateway

import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

/**
 * OpenAPI specification configuration
 */
export const swaggerOptions = {
  openapi: {
    openapi: "3.0.3",
    info: {
      title: "Resume Ecosystem API",
      description: `
## Overview

The Resume Ecosystem API provides a comprehensive platform for building verified,
auto-generated resumes from your professional activities including internships,
courses, hackathons, and projects.

## Authentication

Most endpoints require authentication via JWT Bearer token. To authenticate:

1. Register an account via \`POST /auth/register\`
2. Login via \`POST /auth/token\` to receive a JWT
3. Include the token in the \`Authorization\` header: \`Bearer <your-token>\`

## Rate Limiting

API requests are rate-limited to prevent abuse:
- Anonymous endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute

## Services

This API gateway proxies requests to the following microservices:

| Service | Prefix | Description |
|---------|--------|-------------|
| Auth | \`/auth\` | User authentication and authorization |
| Activities | \`/activities\` | Manage professional activities |
| Verification | \`/verify\` | Verify activity authenticity |
| Resume | \`/resume\` | Build and manage resumes |
| Webhooks | \`/webhooks\` | Receive external platform events |
| Files | \`/render\` | Generate PDF/HTML exports |

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
\`\`\`

Common HTTP status codes:
- \`400\` - Bad Request (validation error)
- \`401\` - Unauthorized (missing/invalid token)
- \`403\` - Forbidden (insufficient permissions)
- \`404\` - Not Found
- \`409\` - Conflict (e.g., duplicate email)
- \`429\` - Too Many Requests (rate limited)
- \`500\` - Internal Server Error
      `,
      version: "1.0.0",
      contact: {
        name: "Resume Ecosystem Support",
        url: "https://github.com/your-org/resume-ecosystem-node",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    externalDocs: {
      description: "GitHub Repository",
      url: "https://github.com/your-org/resume-ecosystem-node",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
      {
        url: "https://api.resume-ecosystem.example.com",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User registration, login, and token management",
      },
      {
        name: "Activities",
        description: "CRUD operations for professional activities (internships, courses, hackathons, projects)",
      },
      {
        name: "Verification",
        description: "Verify activity authenticity using various methods (hash, OAuth, webhook)",
      },
      {
        name: "Resume",
        description: "Build, manage, and publish resumes from verified activities",
      },
      {
        name: "Webhooks",
        description: "Receive activity events from external platforms (GitHub, Coursera, etc.)",
      },
      {
        name: "File Generation",
        description: "Generate PDF and HTML exports of resumes",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from /auth/token endpoint",
        },
      },
    },
  },
};

/**
 * Swagger UI configuration
 */
export const swaggerUiOptions = {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    persistAuthorization: true,
  },
  uiHooks: {
    onRequest: function (request: any, reply: any, next: () => void) {
      next();
    },
    preHandler: function (request: any, reply: any, next: () => void) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header: string) => header,
  transformSpecification: (swaggerObject: any) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
};

/**
 * Register Swagger plugins with Fastify
 */
export async function registerSwagger(app: FastifyInstance): Promise<void> {
  // Register swagger (OpenAPI spec generation)
  await app.register(fastifySwagger, swaggerOptions as any);

  // Register swagger-ui (documentation UI)
  await app.register(fastifySwaggerUi, swaggerUiOptions as any);

  console.log("[api-gateway] Swagger UI available at /docs");
}

export default registerSwagger;
