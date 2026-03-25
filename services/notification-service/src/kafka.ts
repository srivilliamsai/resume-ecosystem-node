// services/notification-service/src/kafka.ts
// KafkaJS client setup for notification-service

import { Kafka } from "kafkajs";
import { config } from "./config.js";

export const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: [config.kafkaBroker],
});

export const consumer = kafka.consumer({ groupId: config.kafkaGroupId });
