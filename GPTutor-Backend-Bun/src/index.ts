import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { testConnection } from './db/connection';
import { config } from './config/env';

// Middleware
import { corsMiddleware } from './interceptors/cors';
import { authMiddleware } from './interceptors/auth';
import { rateLimitMiddleware } from './interceptors/rate-limit';
import { durationLimitMiddleware } from './interceptors/duration-limit';

// Controllers
import { messageController } from './controllers/message.controller';
import { historyController } from './controllers/history.controller';
import { conversationController } from './controllers/conversation.controller';
import { imageController } from './controllers/image.controller';
import {
  modelsController,
  userController,
  analyticsController,
  leetCodeController,
  badListController,
  additionalRequestController,
  humorController,
  vkController,
  purchaseController,
} from './controllers/other.controllers';

// WebSocket
import { onlineHandler } from './websockets/online.handler';
import { parseAuthHeader } from './utils/auth';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', corsMiddleware);
app.use('*', authMiddleware);
app.use('*', rateLimitMiddleware);
app.use('*', durationLimitMiddleware);

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'GPTutor Backend (Bun)',
    version: '0.0.1',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.route('/', messageController);
app.route('/', historyController);
app.route('/', conversationController);
app.route('/', imageController);
app.route('/', modelsController);
app.route('/', userController);
app.route('/', analyticsController);
app.route('/', leetCodeController);
app.route('/', badListController);
app.route('/', additionalRequestController);
app.route('/', humorController);
app.route('/', vkController);
app.route('/', purchaseController);

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);

  if (err.message.includes('Unauthorized')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (err.message.includes('Too Many Requests') || err.message.includes('Rate limit')) {
    return c.json({ error: 'Too Many Requests', message: err.message }, 429);
  }

  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

// Start server
async function start() {
  console.log('🚀 Starting GPTutor Backend (Bun)...');

  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }

  // Start HTTP server with WebSocket support
  const server = Bun.serve({
    port: config.port,
    fetch(req, server) {
      const url = new URL(req.url);

      // WebSocket upgrade for /online endpoint
      if (url.pathname === '/online') {
        // Parse auth from query or headers
        const authHeader = req.headers.get('Authorization');
        let userId: string | undefined;

        if (authHeader) {
          const authResult = parseAuthHeader(authHeader);
          userId = authResult?.vkUserId;
        }

        const success = server.upgrade(req, {
          data: { userId },
        });

        if (success) {
          return undefined;
        }

        return new Response('WebSocket upgrade failed', { status: 400 });
      }

      // Regular HTTP requests
      return app.fetch(req);
    },
    websocket: {
      open(ws) {
        const userId = ws.data?.userId;
        onlineHandler.handleConnection(ws, userId);
      },
      message(ws, message) {
        const messageStr = typeof message === 'string' ? message : new TextDecoder().decode(message);
        onlineHandler.handleMessage(ws, messageStr);
      },
      close(ws) {
        onlineHandler.handleClose(ws);
      },
    },
  });

  console.log(`✅ Server running on http://localhost:${server.port}`);
  console.log(`✅ WebSocket endpoint: ws://localhost:${server.port}/online`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /              - Health check');
  console.log('  POST /messages      - Create message');
  console.log('  POST /history       - Create history');
  console.log('  POST /conversation  - Chat completion');
  console.log('  POST /image         - Generate image');
  console.log('  GET  /models        - List models');
  console.log('  ...and more');
}

start().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
