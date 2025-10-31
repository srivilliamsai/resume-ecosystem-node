import { buildServer } from "@resume/services/server";
import { createConsumer } from "@resume/services/kafka";
import type { EachMessagePayload } from "kafkajs";

import { Topics } from "common-lib";

const PORT = Number(process.env.PORT || 4060);
const HOST = process.env.HOST || "0.0.0.0";

const app = buildServer("notification-service", async () => {});

async function start() {
  const consumer = createConsumer("notification-consumer");
  await consumer.connect();
  await consumer.subscribe({ topic: Topics.ResumePublished, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) {
        return;
      }

      const event = JSON.parse(message.value.toString());
      app.log.info({ event }, "notification dispatched");
    }
  });

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`notification-service running on ${HOST}:${PORT}`);
}

start().catch((err: unknown) => {
  app.log.error({ err }, "failed to start notification-service");
  process.exit(1);
});
