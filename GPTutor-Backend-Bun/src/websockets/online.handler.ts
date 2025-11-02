import { ServerWebSocket } from 'bun';

interface WebSocketData {
  userId?: string;
  connectionId: string;
}

export class OnlineWebSocketHandler {
  private connections: Map<string, ServerWebSocket<WebSocketData>> = new Map();
  private userIds: Set<string> = new Set();

  handleConnection(ws: ServerWebSocket<WebSocketData>, userId?: string) {
    const connectionId = crypto.randomUUID();
    ws.data = { userId, connectionId };

    this.connections.set(connectionId, ws);

    if (userId) {
      this.userIds.add(userId);
      console.log(`✅ User ${userId} connected (total online: ${this.userIds.size})`);
    }

    // Send current online count to the new connection
    ws.send(JSON.stringify({
      type: 'online_count',
      count: this.userIds.size,
    }));
  }

  handleClose(ws: ServerWebSocket<WebSocketData>) {
    const { userId, connectionId } = ws.data;

    this.connections.delete(connectionId);

    if (userId) {
      // Check if user has other connections
      const hasOtherConnections = Array.from(this.connections.values())
        .some((conn) => conn.data.userId === userId);

      if (!hasOtherConnections) {
        this.userIds.delete(userId);
        console.log(`❌ User ${userId} disconnected (total online: ${this.userIds.size})`);
      }
    }
  }

  handleMessage(ws: ServerWebSocket<WebSocketData>, message: string) {
    try {
      const data = JSON.parse(message);

      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      } else if (data.type === 'get_online_count') {
        ws.send(JSON.stringify({
          type: 'online_count',
          count: this.userIds.size,
        }));
      }
    } catch (error) {
      console.error('WebSocket message parse error:', error);
    }
  }

  getOnlineUsers(): Set<string> {
    return this.userIds;
  }

  broadcastOnlineCount() {
    const message = JSON.stringify({
      type: 'online_count',
      count: this.userIds.size,
    });

    for (const ws of this.connections.values()) {
      try {
        ws.send(message);
      } catch (error) {
        console.error('Failed to send online count:', error);
      }
    }
  }
}

export const onlineHandler = new OnlineWebSocketHandler();

// Broadcast online count every 30 seconds
setInterval(() => {
  onlineHandler.broadcastOnlineCount();
}, 30000);
