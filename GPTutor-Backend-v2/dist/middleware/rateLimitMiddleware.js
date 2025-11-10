"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRateLimitKey = generateRateLimitKey;
exports.generateIPRateLimitKey = generateIPRateLimitKey;
exports.createRateLimitMiddleware = createRateLimitMiddleware;
exports.getRateLimitConfig = getRateLimitConfig;
exports.cleanupRateLimitStore = cleanupRateLimitStore;
exports.getGlobalRateLimitStore = getGlobalRateLimitStore;
const LoggerService_1 = require("../services/LoggerService");
const rateLimitConfig_1 = require("../config/rateLimitConfig");
function generateRateLimitKey(request) {
    const ip = request.ip;
    const userId = request.userId || "anonymous";
    const userAgent = request.headers["user-agent"] || "unknown";
    return `rate_limit:${ip}:${userId}:${Buffer.from(userAgent)
        .toString("base64")
        .slice(0, 10)}`;
}
function generateIPRateLimitKey(request) {
    const ip = request.ip;
    return `rate_limit:${ip}`;
}
const globalRateLimitStore = new Map();
function createRateLimitMiddleware(config) {
    const store = globalRateLimitStore;
    return async (request, reply) => {
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
            LoggerService_1.logger.warn("Rate limit exceeded", {
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
            }
            else {
                reply.code(429).send({
                    error: "Too Many Requests",
                    message: `Rate limit exceeded. Maximum ${config.max} requests per ${config.timeWindow / 1000} seconds.`,
                    retryAfter: Math.ceil((record.resetTime - now) / 1000),
                });
            }
            return;
        }
        reply.header("X-RateLimit-Limit", config.max.toString());
        reply.header("X-RateLimit-Remaining", Math.max(0, config.max - record.count).toString());
        reply.header("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000).toString());
        store.set(key, record);
    };
}
function getRateLimitConfig(route) {
    const env = process.env.NODE_ENV || "production";
    return (0, rateLimitConfig_1.getRateLimitForRoute)(route);
}
function cleanupRateLimitStore(store) {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [key, record] of store.entries()) {
        if (now > record.resetTime) {
            store.delete(key);
            cleanedCount++;
        }
    }
    if (cleanedCount > 0) {
        LoggerService_1.logger.debug(`Cleaned up ${cleanedCount} expired rate limit records`);
    }
}
function getGlobalRateLimitStore() {
    return globalRateLimitStore;
}
setInterval(() => {
    cleanupRateLimitStore(globalRateLimitStore);
}, 5 * 60 * 1000);
