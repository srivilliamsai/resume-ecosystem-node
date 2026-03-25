// services/notification-service/src/routes/notification.ts
// REST API routes for notification-service

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { jwtVerify } from "jose";
import { createLogger } from "common-lib";
import { notificationService } from "../services/notification.js";
import { websocketService } from "../services/websocket.js";
import { config } from "../config.js";

const logger = createLogger({ serviceName: "notification-service" });

// ─── JWT Auth Helper ─────────────────────────────────────────────────────────

interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  roles?: string[];
}

async function extractUser(request: FastifyRequest): Promise<JwtPayload> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw { statusCode: 401, message: "Missing or invalid Authorization header" };
  }

  const token = authHeader.slice(7);
  const secret = new TextEncoder().encode(config.jwtSecret);

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      email: (payload as any).email as string,
      name: (payload as any).name as string | undefined,
      roles: (payload as any).roles as string[] | undefined,
    };
  } catch {
    throw { statusCode: 401, message: "Invalid or expired token" };
  }
}

// ─── Route Registration ──────────────────────────────────────────────────────

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /notifications
   * List the authenticated user's notifications (paginated)
   */
  app.get(
    "/notifications",
    async (
      request: FastifyRequest<{
        Querystring: { page?: string; limit?: string; unreadOnly?: string };
      }>,
      reply: FastifyReply
    ) => {
      const user = await extractUser(request);
      const page = parseInt(request.query.page || "1", 10);
      const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
      const unreadOnly = request.query.unreadOnly === "true";

      const result = await notificationService.getUserNotifications({
        userId: user.sub,
        page,
        limit,
        unreadOnly,
      });

      return reply.send(result);
    }
  );

  /**
   * GET /notifications/unread-count
   * Get the number of unread notifications for the user
   */
  app.get("/notifications/unread-count", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await extractUser(request);
    const count = await notificationService.getUnreadCount(user.sub);
    return reply.send({ unreadCount: count });
  });

  /**
   * PATCH /notifications/:id/read
   * Mark a single notification as read
   */
  app.patch(
    "/notifications/:id/read",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const user = await extractUser(request);
      await notificationService.markAsRead(request.params.id, user.sub);
      return reply.send({ success: true });
    }
  );

  /**
   * POST /notifications/read-all
   * Mark all notifications as read
   */
  app.post("/notifications/read-all", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await extractUser(request);
    const result = await notificationService.markAllAsRead(user.sub);
    return reply.send({ success: true, updated: result.count });
  });

  /**
   * GET /notifications/preferences
   * Get the user's notification preferences
   */
  app.get("/notifications/preferences", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await extractUser(request);
    const prefs = await notificationService.getOrCreatePreferences(user.sub);
    return reply.send(prefs);
  });

  /**
   * PUT /notifications/preferences
   * Update the user's notification preferences
   */
  app.put(
    "/notifications/preferences",
    async (
      request: FastifyRequest<{
        Body: {
          emailEnabled?: boolean;
          pushEnabled?: boolean;
          websocketEnabled?: boolean;
          resumePublished?: boolean;
          activityVerified?: boolean;
          activityRejected?: boolean;
          systemMessages?: boolean;
        };
      }>,
      reply: FastifyReply
    ) => {
      const user = await extractUser(request);
      const prefs = await notificationService.updatePreferences(user.sub, request.body);
      return reply.send(prefs);
    }
  );

  /**
   * GET /notifications/stats
   * Get notification stats including unread count & WebSocket connection info
   */
  app.get("/notifications/stats", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await extractUser(request);
    const [unreadCount, wsStats] = await Promise.all([
      notificationService.getUnreadCount(user.sub),
      Promise.resolve(websocketService.getStats()),
    ]);

    return reply.send({
      unreadCount,
      websocket: wsStats,
    });
  });
}

export default notificationRoutes;
