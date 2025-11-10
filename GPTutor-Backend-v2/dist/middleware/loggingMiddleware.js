"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoggingMiddleware = createLoggingMiddleware;
exports.createErrorLoggingMiddleware = createErrorLoggingMiddleware;
const LoggerService_1 = require("../services/LoggerService");
const uuid_1 = require("uuid");
function createLoggingMiddleware() {
    return async function loggingMiddleware(request, reply) {
        // Generate unique request ID
        request.requestId = (0, uuid_1.v4)();
        request.startTime = Date.now();
        // Try to extract user ID from various sources
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            // This will be set by auth middleware later, but we can try to extract it
            request.userId = 'unknown'; // Will be updated by auth middleware
        }
        // Log incoming request
        LoggerService_1.logger.apiRequest(request.method, request.url, request.userId, {
            requestId: request.requestId,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
            headers: {
                'content-type': request.headers['content-type'],
                'authorization': authHeader ? 'Bearer [REDACTED]' : undefined
            }
        });
        // We'll log response in the main request handler instead
        // since Fastify's hook system has complex typing
        // Add request ID to response headers for tracking
        reply.header('X-Request-ID', request.requestId);
    };
}
function createErrorLoggingMiddleware() {
    return async function errorLoggingMiddleware(error, request, reply) {
        const duration = Date.now() - request.startTime;
        LoggerService_1.logger.error(`Request failed: ${request.method} ${request.url}`, error, {
            requestId: request.requestId,
            userId: request.userId,
            duration,
            statusCode: reply.statusCode,
            userAgent: request.headers['user-agent'],
            ip: request.ip
        });
        // Don't modify the error, just log it
        throw error;
    };
}
