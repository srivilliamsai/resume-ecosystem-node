// services/notification-service/src/services/notification.ts
// Notification orchestrator service — coordinates email, WebSocket, and DB persistence

import { PrismaClient, NotificationType, NotificationChannel, NotificationStatus } from "../generated/client/index.js";
import { createLogger } from "common-lib";
import { emailService, EmailResult } from "./email.js";
import { websocketService } from "./websocket.js";
import { resumePublishedEmail } from "../templates/email.js";
import { config } from "../config.js";

const logger = createLogger({ serviceName: "notification-service" });
const prisma = new PrismaClient();

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResumePublishedPayload {
  userId: string;
  userEmail: string;
  userName: string;
  resumeVersionId: string;
  resumeScore: number;
  activitiesCount: number;
}

export interface DeliveryResult {
  emailResult?: EmailResult;
  wsSentCount: number;
  notificationIds: string[];
}

export interface NotificationListOptions {
  userId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

// ─── Service ─────────────────────────────────────────────────────────────────

class NotificationService {
  /**
   * Orchestrate notification delivery when a resume is published.
   * Checks user preferences, sends email + WebSocket, persists records.
   */
  async handleResumePublished(payload: ResumePublishedPayload): Promise<DeliveryResult> {
    const { userId, userEmail, userName, resumeVersionId, resumeScore, activitiesCount } = payload;
    const notificationIds: string[] = [];

    // 1. Check user notification preferences (create default if none exist)
    const prefs = await this.getOrCreatePreferences(userId);

    // 2. Build email and WebSocket payloads
    const downloadUrl = `${config.apiBaseUrl}/api/files/resume/${resumeVersionId}/pdf`;
    const viewUrl = `${config.appBaseUrl}/resume/${resumeVersionId}`;

    // 3. Send email notification
    let emailResult: EmailResult | undefined;
    if (prefs.emailEnabled && prefs.resumePublished) {
      try {
        const html = resumePublishedEmail({
          userName,
          resumeScore,
          versionId: resumeVersionId,
          activitiesCount,
          downloadUrl,
          viewUrl,
        });

        emailResult = await emailService.send({
          to: userEmail,
          subject: `Your Resume is Ready! Score: ${resumeScore}/100`,
          html,
        });

        // Persist email notification record
        const emailNotification = await prisma.notification.create({
          data: {
            userId,
            type: NotificationType.RESUME_PUBLISHED,
            channel: NotificationChannel.EMAIL,
            status: emailResult.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
            subject: `Your Resume is Ready! Score: ${resumeScore}/100`,
            message: `Resume version ${resumeVersionId} published with score ${resumeScore}/100 and ${activitiesCount} verified activities.`,
            metadata: {
              resumeVersionId,
              resumeScore,
              activitiesCount,
              downloadUrl,
              viewUrl,
              messageId: emailResult.messageId,
            },
            sentAt: emailResult.success ? new Date() : null,
            error: emailResult.error || null,
          },
        });
        notificationIds.push(emailNotification.id);
      } catch (error) {
        logger.error({ error, userId }, "Failed to send email notification");
        emailResult = { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    } else {
      logger.debug({ userId }, "Email notification skipped (disabled by preferences)");
    }

    // 4. Send WebSocket notification
    let wsSentCount = 0;
    if (prefs.websocketEnabled && prefs.resumePublished) {
      try {
        wsSentCount = websocketService.sendToUser(userId, {
          type: "resume_published",
          title: "Resume Ready!",
          message: `Your resume has been updated. Score: ${resumeScore}/100 with ${activitiesCount} verified activities.`,
          metadata: {
            resumeVersionId,
            resumeScore,
            activitiesCount,
            downloadUrl,
            viewUrl,
          },
        });

        // Persist WebSocket notification record
        const wsNotification = await prisma.notification.create({
          data: {
            userId,
            type: NotificationType.RESUME_PUBLISHED,
            channel: NotificationChannel.WEBSOCKET,
            status: wsSentCount > 0 ? NotificationStatus.SENT : NotificationStatus.PENDING,
            subject: "Resume Ready!",
            message: `Resume version ${resumeVersionId} published with score ${resumeScore}/100.`,
            metadata: {
              resumeVersionId,
              resumeScore,
              activitiesCount,
              sentToConnections: wsSentCount,
            },
            sentAt: wsSentCount > 0 ? new Date() : null,
          },
        });
        notificationIds.push(wsNotification.id);
      } catch (error) {
        logger.error({ error, userId }, "Failed to send WebSocket notification");
      }
    } else {
      logger.debug({ userId }, "WebSocket notification skipped (disabled by preferences)");
    }

    return { emailResult, wsSentCount, notificationIds };
  }

  // ─── Notification History ────────────────────────────────────────────────

  /**
   * Get paginated notification list for a user
   */
  async getUserNotifications(options: NotificationListOptions) {
    const { userId, page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(unreadOnly ? { readAt: null, status: { not: NotificationStatus.FAILED } } : {}),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
        status: { not: NotificationStatus.FAILED },
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        readAt: null,
        status: { not: NotificationStatus.FAILED },
      },
    });
  }

  // ─── Preferences ────────────────────────────────────────────────────────

  /**
   * Get or create default notification preferences for a user
   */
  async getOrCreatePreferences(userId: string) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId },
      });
      logger.debug({ userId }, "Created default notification preferences");
    }

    return prefs;
  }

  /**
   * Update notification preferences for a user
   */
  async updatePreferences(
    userId: string,
    updates: {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      websocketEnabled?: boolean;
      resumePublished?: boolean;
      activityVerified?: boolean;
      activityRejected?: boolean;
      systemMessages?: boolean;
    }
  ) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...updates },
      update: updates,
    });
  }
}

// Singleton instance
export const notificationService = new NotificationService();
export default notificationService;
