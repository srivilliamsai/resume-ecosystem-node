import { buildServer } from "@resume/services/server";
import { startKafka, createConsumer } from "@resume/services/kafka";
import { routes } from "./routes/activities.js";
import { Topics } from "common-lib";
import { ingestWebhookEvent } from "./services/webhook-ingestor.js";

const PORT = Number(process.env.PORT || 4020);
const HOST = process.env.HOST || "0.0.0.0";

const app = buildServer("activity-service", routes);

async function start() {
  await startKafka();
  const consumer = createConsumer("activity-service-webhooks");
  await consumer.connect();
  await consumer.subscribe({ topic: Topics.WebhookReceived, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      try {
        const payload = JSON.parse(message.value.toString());
        await ingestWebhookEvent(payload);
      } catch (error) {
        app.log.error({ err: error }, "failed to ingest webhook event");
      }
    }
  });

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`activity-service running on ${HOST}:${PORT}`);
}

start().catch((err) => {
  app.log.error(err, "failed to start activity-service");
  process.exit(1);
});
