import { buildServer } from "@resume/services/server";
import { routes } from "./routes/render.js";

const PORT = Number(process.env.PORT || 4070);
const HOST = process.env.HOST || "0.0.0.0";

const app = buildServer("file-service", routes);

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    app.log.info(`file-service running on ${HOST}:${PORT}`);
  })
  .catch((err) => {
    app.log.error(err, "failed to start file-service");
    process.exit(1);
  });
