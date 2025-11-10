import { FastifyRequest, FastifyReply } from "fastify";
import { logger } from "../services/LoggerService";
import { getRateLimitForRoute } from "../config/rateLimitConfig";

export interface RateLimitConfig {
  max: number;
  timeWindow: number;
  keyGenerator?: (request: FastifyRequest) => string;
  onLimitReached?: (request: FastifyRequest, reply: FastifyReply) => void;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitOptions {
  [route: string]: RateLimitConfig;
}

export function generateRateLimitKey(request: FastifyRequest): string {
  const ip = request.ip;
  const userId = (request as any).userId || "anonymous";
  const userAgent = request.headers["user-agent"] || "unknown";

  return `rate_limit:${ip}:${userId}:${Buffer.from(userAgent)
    .toString("base64")
    .slice(0, 10)}`;
}

export function generateIPRateLimitKey(request: FastifyRequest): string {
  const ip = request.ip;
  return `rate_limit:${ip}`;
}

const globalRateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

export function createRateLimitMiddleware(config: RateLimitConfig) {
  const store = globalRateLimitStore;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const key = config.keyGenerator
      ? config.keyGenerator(request)
      : generateIPRateLimitKey(request);
    const now = Date.now();

    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + config.timeWindow,
      };
      store.set(key, record);
    }

    record.count++;

    if (record.count > config.max) {
      logger.warn("Rate limit exceeded", {
        ip: request.ip,
        url: request.url,
        method: request.method,
        key,
        count: record.count,
        max: config.max,
        timeWindow: config.timeWindow,
      });

      if (config.onLimitReached) {
        config.onLimitReached(request, reply);
      } else {
        reply.code(429).send({
          error: "Too Many Requests",
          message: `Rate limit exceeded. Maximum ${config.max} requests per ${
            config.timeWindow / 1000
          } seconds.`,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        });
      }
      return;
    }

    reply.header("X-RateLimit-Limit", config.max.toString());
    reply.header(
      "X-RateLimit-Remaining",
      Math.max(0, config.max - record.count).toString()
    );
    reply.header(
      "X-RateLimit-Reset",
      Math.ceil(record.resetTime / 1000).toString()
    );

    store.set(key, record);
  };
}

export function getRateLimitConfig(route: string): RateLimitConfig | null {
  const env = process.env.NODE_ENV || "production";
  return getRateLimitForRoute(route);
}

export function cleanupRateLimitStore(
  store: Map<string, { count: number; resetTime: number }>
) {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    logger.debug(`Cleaned up ${cleanedCount} expired rate limit records`);
  }
}

export function getGlobalRateLimitStore() {
  return globalRateLimitStore;
}

setInterval(() => {
  cleanupRateLimitStore(globalRateLimitStore);
}, 5 * 60 * 1000);
