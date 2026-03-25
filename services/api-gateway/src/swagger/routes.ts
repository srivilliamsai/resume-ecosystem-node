// services/api-gateway/src/swagger/routes.ts
// Route definitions with OpenAPI schemas for documentation
// These routes are documented in Swagger but proxy to backend services

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import http from "http";
import {
  authSchemas,
  activitySchemas,
  verifySchemas,
  resumeSchemas,
  webhookSchemas,
  renderSchemas,
} from "./schemas.js";

// Service URL mapping
const SERVICE_URLS = {
  auth: process.env.AUTH_URL || "http://localhost:4010",
  activity: process.env.ACTIVITY_URL || "http://localhost:4020",
  verify: process.env.VERIFY_URL || "http://localhost:4030",
  resume: process.env.RESUME_URL || "http://localhost:4040",
  integration: process.env.INTEGRATION_URL || "http://localhost:4050",
  file: process.env.FILE_URL || "http://localhost:4070",
};

/**
 * Proxy request to a backend service
 */
async function proxyRequest(
  request: FastifyRequest,
  reply: FastifyReply,
  targetUrl: string,
  path: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, targetUrl);

    const options: http.RequestOptions = {
      method: request.method,
      headers: {
        ...request.headers,
        host: url.host,
      },
    };

    // Remove hop-by-hop headers
    if (options.headers) {
      const h = options.headers as any;
      delete h["connection"];
      delete h["keep-alive"];
      delete h["transfer-encoding"];
    }

    const proxyReq = http.request(url, options, (proxyRes) => {
      reply.code(proxyRes.statusCode || 502);

      // Forward response headers
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        if (key !== "transfer-encoding") {
          reply.header(key, value as string);
        }
      }

      // Pipe response body
      proxyRes.pipe(reply.raw);
      proxyRes.on("end", () => resolve());
      proxyRes.on("error", reject);
    });

    proxyReq.on("error", (err) => {
      reply.code(502).send({ error: "Service unavailable", details: err.message });
      resolve();
    });

    // Forward request body for POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      request.raw.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });
}

/**
 * Register all documented routes
 */
export async function registerDocumentedRoutes(app: FastifyInstance): Promise<void> {
  // ==========================================================================
  // Authentication Routes (/auth/*)
  // ==========================================================================

  app.post("/auth/register", {
    schema: authSchemas.register,
    handler: async (request, reply) => {
      await proxyRequest(request, reply, SERVICE_URLS.auth, "/auth/register");
    },
  });

  app.post("/auth/token", {
    schema: authSchemas.login,
    handler: async (request, reply) => {
      await proxyRequest(request, reply, SERVICE_URLS.auth, "/auth/token");
    },
  });

  app.get("/auth/me", {
    schema: authSchemas.me,
    handler: async (request, reply) => {
      await proxyRequest(request, reply, SERVICE_URLS.auth, "/auth/me");
    },
  });

  // ==========================================================================
  // Activity Routes (/activities/*)
  // ==========================================================================

  app.get("/activities", {
    schema: activitySchemas.list,
    handler: async (request, reply) => {
      const query = request.url.includes("?") ? request.url.split("?")[1] : "";
      await proxyRequest(request, reply, SERVICE_URLS.activity, `/activities?${query}`);
    },
  });

  app.post("/activities", {
    schema: activitySchemas.create,
    handler: async (request, reply) => {
      await proxyRequest(request, reply, SERVICE_URLS.activity, "/activities");
    },
  });

  app.get("/activities/:id", {
    schema: activitySchemas.get,
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await proxyRequest(request, reply, SERVICE_URLS.activity, `/activities/${id}`);
    },
  });

  app.put("/activities/:id", {
    schema: activitySchemas.update,
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await proxyRequest(request, reply, SERVICE_URLS.activity, `/activities/${id}`);
    },
  });

  app.delete("/activities/:id", {
    schema: activitySchemas.delete,
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await proxyRequest(request, reply, SERVICE_URLS.activity, `/activities/${id}`);
    },
  });

  // ==========================================================================
  // Verification Routes (/verify/*)
  // ==========================================================================

  app.post("/verify/hash", {
    schema: verifySchemas.hash,
    handler: async (request, reply) => {
      await proxyRequest(request, reply, SERVICE_URLS.verify, "/verify/hash");
    },
  });

  app.get("/verify/status/:activityId", {
    schema: verifySchemas.status,
    handler: async (request, reply) => {
      const { activityId } = request.params as { activityId: string };
      await proxyRequest(request, reply, SERVICE_URLS.verify, `/verify/status/${activityId}`);
    },
  });

  // ==========================================================================
  // Resume Routes (/resume/*)
  // ==========================================================================

  app.get("/resume", {
    schema: resumeSchemas.get,
    handler: async (request, reply) => {
      await proxyRequest(request, reply, SERVICE_URLS.resume, "/resume");
    },
  });

  app.post("/resume/rebuild", {
    schema: resumeSchemas.rebuild,
    handler: async (request, reply) => {
      await proxyRequest(request, reply, SERVICE_URLS.resume, "/resume/rebuild");
    },
  });

  app.get("/resume/versions", {
    schema: resumeSchemas.versions,
    handler: async (request, reply) => {
      const query = request.url.includes("?") ? request.url.split("?")[1] : "";
      await proxyRequest(request, reply, SERVICE_URLS.resume, `/resume/versions?${query}`);
    },
  });

  app.patch("/resume/visibility", {
    schema: resumeSchemas.updateVisibility,
    handler: async (request, reply) => {
      await proxyRequest(request, reply, SERVICE_URLS.resume, "/resume/visibility");
    },
  });

  // ==========================================================================
  // Webhook Routes (/webhooks/*)
  // ==========================================================================

  app.post("/webhooks/:platform", {
    schema: webhookSchemas.receive,
    handler: async (request, reply) => {
      const { platform } = request.params as { platform: string };
      await proxyRequest(request, reply, SERVICE_URLS.integration, `/webhooks/${platform}`);
    },
  });

  // ==========================================================================
  // File/Render Routes (/render/*)
  // ==========================================================================

  app.post("/render/pdf", {
    schema: renderSchemas.pdf,
    handler: async (request, reply) => {
      await proxyRequest(request, reply, SERVICE_URLS.file, "/render/pdf");
    },
  });

  app.get("/render/preview", {
    schema: renderSchemas.preview,
    handler: async (request, reply) => {
      const query = request.url.includes("?") ? request.url.split("?")[1] : "";
      await proxyRequest(request, reply, SERVICE_URLS.file, `/render/preview?${query}`);
    },
  });

  // ==========================================================================
  // Catch-all proxy for undocumented routes (backwards compatibility)
  // ==========================================================================

  const PROXY_MAP: Record<string, string> = {
    "/auth": SERVICE_URLS.auth,
    "/activities": SERVICE_URLS.activity,
    "/verify": SERVICE_URLS.verify,
    "/resume": SERVICE_URLS.resume,
    "/webhooks": SERVICE_URLS.integration,
    "/render": SERVICE_URLS.file,
  };

  // Register catch-all routes for paths not explicitly documented
  for (const [prefix, targetUrl] of Object.entries(PROXY_MAP)) {
    app.all(`${prefix}/*`, {
      schema: {
        hide: true, // Hide from Swagger docs
      },
      handler: async (request, reply) => {
        const path = request.url.replace(prefix, "") || "/";
        await proxyRequest(request, reply, targetUrl, path);
      },
    });
  }
}

export default registerDocumentedRoutes;
