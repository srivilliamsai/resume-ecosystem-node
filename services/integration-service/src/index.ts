import { buildServer } from "./server.ts";
import { routes } from "./routes/webhooks.js";
import { startKafka } from "./kafka.js";
const PORT = Number(process.env.PORT || 4050);
const app = buildServer("integration-service", routes);
startKafka().then(()=> app.listen({ port: PORT, host: "0.0.0.0" }));
