// services/notification-service/src/services/wsService.ts
import { WebSocketServer, WebSocket } from 'ws';

class WSService {
  private wss;
  private connections = new Map<string, Set<WebSocket>>();
  private port = Number(process.env.WS_PORT) || 4061;

  constructor() {
    this.wss = new WebSocketServer({ port: this.port });
    console.log(`[WS] WebSocket server listening on port ${this.port}`);

    this.wss.on('connection', (ws, req) => {
      // Simulate userId extraction from query params or auth token
      // e.g. ws://localhost:4061?userId=123
      const userId = new URL(req.url || '', `http://localhost:${this.port}`).searchParams.get('userId');
      
      if (!userId) {
        console.log('[WS] Connection attempt without userId, closing');
        ws.close(1008, 'Missing userId');
        return;
      }

      this.registerConnection(userId, ws);

      ws.on('close', () => {
        this.removeConnection(userId, ws);
      });
      
      ws.on('ping', () => ws.pong()); // Heartbeat
    });

    // Setup heartbeat interval to keep connections alive
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, 30000);
  }

  registerConnection(userId: string, ws: WebSocket) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)?.add(ws);
    console.log(`[WS] User ${userId} connected. Total connections for user: ${this.connections.get(userId)?.size}`);
  }

  removeConnection(userId: string, ws: WebSocket) {
    const userConns = this.connections.get(userId);
    if (userConns) {
      userConns.delete(ws);
      if (userConns.size === 0) {
        this.connections.delete(userId);
      }
    }
    console.log(`[WS] User ${userId} disconnected`);
  }

  broadcastToUser(userId: string, payload: any) {
    const userConns = this.connections.get(userId);
    if (!userConns) return;

    const msg = JSON.stringify(payload);
    let sentCount = 0;
    
    userConns.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
        sentCount++;
      }
    });
    
    console.log(`[WS] Broadcast to user ${userId}: sent to ${sentCount} clients`);
  }

  close() {
    this.wss.close();
  }
}

export const wsService = new WSService();
