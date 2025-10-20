import Fastify from "fastify";

export async function startServer() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ status: "ok", service: "api-gateway" }));

  try {
    const portMap: Record<string, number> = {
      "api-gateway": 4000,
      "auth-service": 4010,
      "activity-service": 4020,
      "verification-service": 4030,
      "resume-service": 4040,
      "integration-service": 4050,
      "notification-service": 4060,
      "file-service": 4070
    };

    const port = Number(process.env.PORT) || portMap["api-gateway"] || 5000;
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`✅ api-gateway running on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

startServer();
