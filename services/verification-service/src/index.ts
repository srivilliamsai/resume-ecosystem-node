import { buildServer } from "./server.ts";
import { routes } from "./routes/verify.js";
import { startKafka } from "./kafka.js";
const PORT = Number(process.env.PORT || 4030);
const app = buildServer("verification-service", routes);
startKafka().then(()=> app.listen({ port: PORT, host: "0.0.0.0" }));
