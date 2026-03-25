// services/notification-service/src/events/consumer.ts
// Kafka consumer for notification-service events

import { consumer } from "../kafka.js";
import { Topics, createLogger } from "common-lib";
import { PrismaClient } from "../generated/client/index.js";
import { notificationService } from "../services/notification.js";

const logger = createLogger({ serviceName: "notification-service" });
const prisma = new PrismaClient();

/**
 * Event payload from resume.version.published topic
 */
export interface ResumePublishedEvent {
  userId: string;
  resumeVersionId: string;
}

/**
 * Start the Kafka consumer and subscribe to relevant topics.
 * Handles `resume.version.published` events by orchestrating
 * email + WebSocket notification delivery.
 */
export async function startConsumer(): Promise<void> {
  await consumer.connect();
  logger.info("Kafka consumer connected");

  await consumer.subscribe({
    topic: Topics.ResumePublished,
    fromBeginning: false,
  });

  logger.info({ topic: Topics.ResumePublished }, "Subscribed to topic");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const raw = message.value?.toString();
      if (!raw) {
        logger.warn({ topic, partition }, "Received empty message, skipping");
        return;
      }

      try {
        const event: ResumePublishedEvent = JSON.parse(raw);
        logger.info(
          { topic, userId: event.userId, resumeVersionId: event.resumeVersionId },
          "Processing resume.version.published event"
        );

        await handleResumePublished(event);
      } catch (error) {
        logger.error(
          { error, topic, partition, offset: message.offset },
          "Failed to process message"
        );
      }
    },
  });

  logger.info("Kafka consumer running");
}

/**
 * Handle a resume.version.published event:
 * 1. Look up user and resume version from the database
 * 2. Delegate to NotificationService for orchestrated delivery
 */
async function handleResumePublished(event: ResumePublishedEvent): Promise<void> {
  const { userId, resumeVersionId } = event;

  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    logger.warn({ userId }, "User not found for notification, skipping");
    return;
  }

  // Fetch resume version details
  const resumeVersion = await prisma.resumeVersion.findUnique({
    where: { id: resumeVersionId },
    include: {
      resume: {
        include: {
          _count: {
            select: { versions: true },
          },
        },
      },
    },
  });

  if (!resumeVersion) {
    logger.warn({ resumeVersionId }, "Resume version not found, skipping");
    return;
  }

  // Count verified activities for the user
  const activitiesCount = await prisma.activity.count({
    where: { userId, status: "VERIFIED" },
  });

  // Orchestrate notification delivery
  const result = await notificationService.handleResumePublished({
    userId: user.id,
    userEmail: user.email,
    userName: user.name || "User",
    resumeVersionId: resumeVersion.id,
    resumeScore: resumeVersion.score,
    activitiesCount,
  });

  logger.info(
    {
      userId,
      resumeVersionId,
      emailSent: result.emailResult?.success ?? false,
      wsSent: result.wsSentCount,
      notificationIds: result.notificationIds,
    },
    "Resume published notification delivered"
  );
}

/**
 * Gracefully disconnect the Kafka consumer
 */
export async function stopConsumer(): Promise<void> {
  await consumer.disconnect();
  await prisma.$disconnect();
  logger.info("Kafka consumer disconnected");
}
