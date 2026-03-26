// services/notification-service/src/consumers/resumeConsumer.ts
import { Kafka } from 'kafkajs';
import { emailService } from '../services/emailService.js';
import { wsService } from '../services/wsService.js';

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: (process.env.KAFKA_BROKER || 'localhost:9092').split(','),
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

export interface ResumePublishedPayload {
  userId: string;
  resumeId: string;
  version: number;
  downloadUrl: string;
  score: number;
}

export async function startResumeConsumer() {
  await consumer.connect();
  console.log('[Kafka] Consumer connected');

  await consumer.subscribe({ topic: 'resume.version.published', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        if (!message.value) return;
        
        const payload: ResumePublishedPayload = JSON.parse(message.value.toString());
        console.log(`[Kafka] Received resume.version.published for user ${payload.userId}`);

        // Call services in parallel
        await Promise.all([
          // Email Service
          emailService.sendResumeReadyEmail(payload.userId, payload).catch(err => {
            console.error('[Email] Failed to send email:', err);
          }),
          
          // WebSocket Service
          wsService.broadcastToUser(payload.userId, {
            type: 'RESUME_READY',
            data: payload
          })
        ]);

      } catch (error) {
        console.error('[Kafka] Error processing message:', error);
      }
    },
  });
}

export async function disconnectConsumer() {
  await consumer.disconnect();
}
