import Fastify from "fastify";

export async function startServer() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ status: "ok", service: "prisma" }));

  try {
    const port = Number(process.env.PORT) || {
      "api-gateway": 4000,
      "auth-service": 4010,
      "activity-service": 4020,
      "verification-service": 4030,
      "resume-service": 4040,
      "integration-service": 4050,
      "notification-service": 4060,
      "file-service": 4070
    }["prisma"] || 5000;

    await app.listen({ port, host: "0.0.0.0" });
    console.log(`✅ prisma running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
