// services/notification-service/src/services/websocket.ts
// WebSocket service for real-time notifications

import { WebSocket, WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import { createLogger } from "common-lib";
import { jwtVerify } from "jose";

const logger = createLogger({ serviceName: "notification-service" });

export interface WebSocketClient {
  ws: WebSocket;
  userId: string;
  isAlive: boolean;
  connectedAt: Date;
}

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocketClient>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server
   */
  initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
      verifyClient: (info, callback) => {
        // Allow connection, authentication happens after
        callback(true);
      },
    });

    this.wss.on("connection", (ws, request) => {
      this.handleConnection(ws, request);
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat();

    logger.info("WebSocket server initialized on /ws");
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, request: any): void {
    const client: WebSocketClient = {
      ws,
      userId: "", // Will be set after authentication
      isAlive: true,
      connectedAt: new Date(),
    };

    // Set up event handlers
    ws.on("pong", () => {
      client.isAlive = true;
    });

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(client, message);
      } catch (error) {
        this.sendError(ws, "Invalid message format");
      }
    });

    ws.on("close", () => {
      this.removeClient(client);
    });

    ws.on("error", (error) => {
      logger.error({ error }, "WebSocket error");
      this.removeClient(client);
    });

    // Send welcome message with authentication instructions
    this.send(ws, {
      type: "connected",
      payload: {
        message: "Connected to notification service",
        instructions: "Send { type: 'auth', token: 'your-jwt-token' } to authenticate",
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(
    client: WebSocketClient,
    message: { type: string; token?: string; [key: string]: unknown }
  ): Promise<void> {
    switch (message.type) {
      case "auth":
        await this.authenticateClient(client, message.token || "");
        break;

      case "ping":
        this.send(client.ws, {
          type: "pong",
          payload: {},
          timestamp: new Date().toISOString(),
        });
        break;

      case "subscribe":
        // Future: Allow subscribing to specific notification types
        if (!client.userId) {
          this.sendError(client.ws, "Not authenticated");
          return;
        }
        this.send(client.ws, {
          type: "subscribed",
          payload: { message: "Subscription updated" },
          timestamp: new Date().toISOString(),
        });
        break;

      default:
        if (!client.userId) {
          this.sendError(client.ws, "Not authenticated");
          return;
        }
        // Echo for debugging
        logger.debug({ type: message.type }, "Unknown message type");
    }
  }

  /**
   * Authenticate client with JWT token
   */
  private async authenticateClient(
    client: WebSocketClient,
    token: string
  ): Promise<void> {
    if (!token) {
      this.sendError(client.ws, "Token required");
      return;
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      const userId = payload.sub as string;
      if (!userId) {
        this.sendError(client.ws, "Invalid token");
        return;
      }

      client.userId = userId;
      this.addClient(client);

      this.send(client.ws, {
        type: "authenticated",
        payload: {
          userId,
          message: "Successfully authenticated",
        },
        timestamp: new Date().toISOString(),
      });

      logger.info({ userId }, "WebSocket client authenticated");
    } catch (error) {
      this.sendError(client.ws, "Authentication failed");
      logger.warn("WebSocket authentication failed");
    }
  }

  /**
   * Add authenticated client to the clients map
   */
  private addClient(client: WebSocketClient): void {
    if (!this.clients.has(client.userId)) {
      this.clients.set(client.userId, new Set());
    }
    this.clients.get(client.userId)!.add(client);

    logger.debug(
      { userId: client.userId, totalConnections: this.clients.get(client.userId)!.size },
      "Client added"
    );
  }

  /**
   * Remove client from the clients map
   */
  private removeClient(client: WebSocketClient): void {
    if (client.userId && this.clients.has(client.userId)) {
      this.clients.get(client.userId)!.delete(client);
      if (this.clients.get(client.userId)!.size === 0) {
        this.clients.delete(client.userId);
      }
      logger.debug({ userId: client.userId }, "Client removed");
    }
  }

  /**
   * Send message to a WebSocket
   */
  private send(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send error message
   */
  private sendError(ws: WebSocket, error: string): void {
    this.send(ws, {
      type: "error",
      payload: { error },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    metadata?: unknown;
  }): number {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.size === 0) {
      logger.debug({ userId }, "No active WebSocket connections for user");
      return 0;
    }

    const message: WebSocketMessage = {
      type: "notification",
      payload: notification,
      timestamp: new Date().toISOString(),
    };

    let sentCount = 0;
    for (const client of userClients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        this.send(client.ws, message);
        sentCount++;
      }
    }

    logger.info({ userId, sentCount }, "WebSocket notification sent");
    return sentCount;
  }

  /**
   * Broadcast notification to all connected users
   */
  broadcast(notification: {
    type: string;
    title: string;
    message: string;
    metadata?: unknown;
  }): number {
    const message: WebSocketMessage = {
      type: "notification",
      payload: notification,
      timestamp: new Date().toISOString(),
    };

    let sentCount = 0;
    for (const [userId, userClients] of this.clients) {
      for (const client of userClients) {
        if (client.ws.readyState === WebSocket.OPEN) {
          this.send(client.ws, message);
          sentCount++;
        }
      }
    }

    logger.info({ sentCount }, "Broadcast notification sent");
    return sentCount;
  }

  /**
   * Start heartbeat interval to detect dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [userId, userClients] of this.clients) {
        for (const client of userClients) {
          if (!client.isAlive) {
            client.ws.terminate();
            this.removeClient(client);
            continue;
          }
          client.isAlive = false;
          client.ws.ping();
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get connection statistics
   */
  getStats(): { totalUsers: number; totalConnections: number } {
    let totalConnections = 0;
    for (const clients of this.clients.values()) {
      totalConnections += clients.size;
    }
    return {
      totalUsers: this.clients.size,
      totalConnections,
    };
  }

  /**
   * Shutdown WebSocket server
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.wss) {
      for (const [userId, userClients] of this.clients) {
        for (const client of userClients) {
          client.ws.close(1001, "Server shutting down");
        }
      }
      this.wss.close();
    }

    logger.info("WebSocket server shut down");
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

export default websocketService;
