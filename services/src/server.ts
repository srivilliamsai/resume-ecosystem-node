import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
export function buildServer(name: string, routesRegister: (app: any)=>Promise<void>) {
const app = Fastify({ logger: true });
app.register(cors, { origin: true });
app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
app.get("/health", async () => ({ status: "ok", service: name }));
app.register(swagger, { openapi: { info: { title: name, version: "1.0.0" } } });
app.register(swaggerUI, { routePrefix: "/docs" });
app.addHook("onRequest", async (req, _reply) => {
(req.headers as any)["x-correlation-id"] = (req.headers["x-correlation-id"] as string) || Date.now().toString();
});
routesRegister(app);
return app;
}
