import { buildServer } from "./server.ts";
import { proxyRegister } from "./routes/proxy.js";
const PORT = Number(process.env.PORT || 4000);
const app = buildServer("api-gateway", async (app)=>{ proxyRegister(app); });
app.listen({ port: PORT, host: "0.0.0.0" });
