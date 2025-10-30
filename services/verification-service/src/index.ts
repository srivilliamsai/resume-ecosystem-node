import { buildServer } from "@resume/services/server";
import { startKafka } from "@resume/services/kafka";
import { routes } from "./routes/verify.js";

const PORT = Number(process.env.PORT || 4030);
const HOST = process.env.HOST || "0.0.0.0";

const app = buildServer("verification-service", routes);

async function start() {
  await startKafka();
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`verification-service running on ${HOST}:${PORT}`);
}

start().catch((err) => {
  app.log.error(err, "failed to start verification-service");
  process.exit(1);
});
