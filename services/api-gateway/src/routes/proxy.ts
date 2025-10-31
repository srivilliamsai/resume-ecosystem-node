import type { FastifyInstance } from "fastify";
import fastifyHttpProxy, { type FastifyHttpProxyOptions } from "@fastify/http-proxy";

const MAP: Record<string, string> = {
  "/auth": process.env.AUTH_URL || "http://localhost:4010",
  "/activities": process.env.ACTIVITY_URL || "http://localhost:4020",
  "/verify": process.env.VERIFY_URL || "http://localhost:4030",
  "/resume": process.env.RESUME_URL || "http://localhost:4040",
  "/webhooks": process.env.INTEGRATION_URL || "http://localhost:4050",
  "/render": process.env.FILE_URL || "http://localhost:4070"
};

export async function proxyRegister(app: FastifyInstance): Promise<void> {
  for (const [prefix, upstream] of Object.entries(MAP)) {
    const options: FastifyHttpProxyOptions & { prefix: string } = {
      upstream,
      prefix,
      rewritePrefix: prefix
    };

    await app.register(fastifyHttpProxy, options);
  }
}
