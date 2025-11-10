import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './BaseController';
import { createRateLimitMiddleware, getRateLimitConfig } from '../middleware/rateLimitMiddleware';

export class HealthController extends BaseController {
  registerRoutes(): void {
    const healthRateLimit = createRateLimitMiddleware(getRateLimitConfig('/health')!);
    
    this.fastify.get(
      '/health', 
      { preHandler: healthRateLimit },
      this.healthCheck.bind(this)
    );
  }

  private async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    return this.sendSuccess(reply, {
      status: "ok",
      timestamp: new Date().toISOString()
    });
  }
}
