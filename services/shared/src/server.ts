import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

type RouteRegistrar = (app: FastifyInstance) => Promise<void> | void;

export function buildServer(name: string, routesRegister: RouteRegistrar): FastifyInstance {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });
  app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  app.get("/health", async () => ({ status: "ok", service: name }));
  app.register(swagger, { openapi: { info: { title: name, version: "1.0.0" } } });
  app.register(swaggerUI, { routePrefix: "/docs" });

  app.addHook("onRequest", async (req: FastifyRequest) => {
    const headers = req.headers as Record<string, string>;
    headers["x-correlation-id"] = headers["x-correlation-id"] ?? Date.now().toString();
  });

  const maybePromise = routesRegister(app);
  if (maybePromise && typeof (maybePromise as Promise<unknown>).then === "function") {
    void maybePromise.catch((err) => {
      app.log.error({ err }, "failed to register routes");
      throw err;
    });
  }

  return app;
}
