import { Kafka } from "kafkajs";
const broker = process.env.KAFKA_BROKER || "localhost:9092";
export const kafka = new Kafka({ clientId: "resume-eco", brokers: [broker] });
export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: grp-${Math.random().toString(36).slice(2)} });
export async function startKafka() { await producer.connect(); }
