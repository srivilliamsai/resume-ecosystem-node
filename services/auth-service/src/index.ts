import { buildServer } from "./server.ts";
import { routes } from "./routes/auth.js";
const PORT = Number(process.env.PORT || 4010);
const app = buildServer("auth-service", routes);
app.listen({ port: PORT, host: "0.0.0.0" });
