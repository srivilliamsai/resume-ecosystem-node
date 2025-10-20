import { buildServer } from "./server.ts";
import { routes } from "./routes/activities.js";
import { startKafka } from "./kafka.js";
const PORT = Number(process.env.PORT || 4020);
const app = buildServer("activity-service", routes);
startKafka().then(()=> app.listen({ port: PORT, host: "0.0.0.0" }));
