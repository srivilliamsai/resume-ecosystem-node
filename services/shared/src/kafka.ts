import { Kafka, logLevel, Producer, Consumer } from "kafkajs";

const broker = process.env.KAFKA_BROKER || "localhost:9092";
const clientId = process.env.KAFKA_CLIENT_ID || "resume-ecosystem";

export const kafka = new Kafka({
  clientId,
  brokers: [broker],
  logLevel: logLevel.NOTHING
});

export const producer = kafka.producer();

let producerReady: Promise<void> | null = null;

export async function startKafka(): Promise<Producer> {
  if (!producerReady) {
    producerReady = producer.connect();
  }
  await producerReady;
  return producer;
}

export function createConsumer(groupId?: string): Consumer {
  return kafka.consumer({
    groupId: groupId ?? `resume-eco-${Math.random().toString(36).slice(2)}`
  });
}

async function shutdown() {
  if (producerReady) {
    await producer.disconnect().catch(() => undefined);
  }
}

process.once("beforeExit", shutdown);
process.once("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});
process.once("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});
