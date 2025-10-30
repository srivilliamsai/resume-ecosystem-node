import { buildServer } from "@resume/services/server";
import { proxyRegister } from "./routes/proxy.js";

const PORT = Number(process.env.PORT || 4000);

const app = buildServer("api-gateway", async (instance) => {
  await proxyRegister(instance);
});

app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`api-gateway running on ${PORT}`);
  })
  .catch((err) => {
    app.log.error(err, "failed to start api-gateway");
    process.exit(1);
  });
