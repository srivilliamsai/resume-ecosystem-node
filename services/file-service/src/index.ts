import { buildServer } from "./server.ts";
import { routes } from "./routes/render.js";
const PORT = Number(process.env.PORT || 4070);
const app = buildServer("file-service", routes);
app.listen({ port: PORT, host: "0.0.0.0" });
