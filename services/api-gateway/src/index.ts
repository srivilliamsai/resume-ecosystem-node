import { buildServer } from "@resume/services/server";
import type { FastifyInstance } from "fastify";

import { proxyRegister } from "./routes/proxy.js";
import swagger from "./plugins/swagger.js";
import { authRoutes } from "./routes/auth.routes.js";
import { activityRoutes } from "./routes/activity.routes.js";
import { resumeRoutes } from "./routes/resume.routes.js";

const PORT = Number(process.env.PORT || 4000);

const app = buildServer("api-gateway", async (instance: FastifyInstance) => {
  await instance.register(swagger);
  await instance.register(authRoutes);
  await instance.register(activityRoutes);
  await instance.register(resumeRoutes);
  await proxyRegister(instance);
});

app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`api-gateway running on ${PORT}`);
  })
  .catch((err: unknown) => {
    app.log.error({ err }, "failed to start api-gateway");
    process.exit(1);
  });
