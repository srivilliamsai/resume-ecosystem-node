import { buildServer } from "@resume/services/server";
import { startKafka } from "@resume/services/kafka";
import { routes } from "./routes/webhooks.js";

const PORT = Number(process.env.PORT || 4050);
const HOST = process.env.HOST || "0.0.0.0";

const app = buildServer("integration-service", routes);

async function start() {
  await startKafka();
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`integration-service running on ${HOST}:${PORT}`);
}

start().catch((err) => {
  app.log.error(err, "failed to start integration-service");
  process.exit(1);
});
