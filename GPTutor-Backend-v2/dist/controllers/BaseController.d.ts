import { FastifyInstance, FastifyReply } from 'fastify';
import { RequestWithLogging } from '../middleware/loggingMiddleware';
export declare abstract class BaseController {
    protected fastify: FastifyInstance;
    constructor(fastify: FastifyInstance);
    abstract registerRoutes(): void;
    protected sendSuccess(reply: FastifyReply, data: any, statusCode?: number): FastifyReply<import("fastify").RouteGenericInterface, import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
    protected sendError(reply: FastifyReply, message: string, statusCode?: number, request?: RequestWithLogging): FastifyReply<import("fastify").RouteGenericInterface, import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
    protected sendValidationError(reply: FastifyReply, message: string, request?: RequestWithLogging): FastifyReply<import("fastify").RouteGenericInterface, import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
    protected sendUnauthorized(reply: FastifyReply, message?: string, request?: RequestWithLogging): FastifyReply<import("fastify").RouteGenericInterface, import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
    protected sendNotFound(reply: FastifyReply, message?: string, request?: RequestWithLogging): FastifyReply<import("fastify").RouteGenericInterface, import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
    protected sendInsufficientBalance(reply: FastifyReply, request?: RequestWithLogging): FastifyReply<import("fastify").RouteGenericInterface, import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown>;
    protected logInfo(message: string, meta?: any, request?: RequestWithLogging): void;
    protected logError(message: string, error?: Error | any, meta?: any, request?: RequestWithLogging): void;
    protected logWarn(message: string, meta?: any, request?: RequestWithLogging): void;
    protected logDebug(message: string, meta?: any, request?: RequestWithLogging): void;
}
