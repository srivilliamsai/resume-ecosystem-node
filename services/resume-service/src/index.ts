import { buildServer } from "@resume/services/server";
import { kafka, producer, startKafka, createConsumer } from "@resume/services/kafka";
import type { EachMessagePayload } from "kafkajs";

import { routes } from "./routes/resume.js";
import { Topics } from "common-lib";
import { rebuildForUser } from "./services/rebuilder.js";

const PORT = Number(process.env.PORT || 4040);
const HOST = process.env.HOST || "0.0.0.0";

const app = buildServer("resume-service", routes);

async function start() {
  await startKafka();

  const consumer = createConsumer("resume-consumer");
  await consumer.connect();
  await consumer.subscribe({ topic: Topics.ActivityVerified, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;

      const payload = JSON.parse(message.value.toString()) as { userId: string; status: string };
      if (payload.status !== "OK") {
        return;
      }

      try {
        const { version } = await rebuildForUser(payload.userId);
        await producer.send({
          topic: Topics.ResumePublished,
          messages: [
            {
              key: payload.userId,
              value: JSON.stringify({ userId: payload.userId, resumeVersionId: version.id })
            }
          ]
        });
      } catch (error) {
        app.log.error({ err: error, userId: payload.userId }, "failed to rebuild resume");
      }
    }
  });

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`resume-service running on ${HOST}:${PORT}`);
}

start().catch((err: unknown) => {
  app.log.error({ err }, "failed to start resume-service");
  process.exit(1);
});
