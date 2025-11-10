import { FastifyRequest, FastifyReply } from 'fastify';
export interface RequestWithLogging extends FastifyRequest {
    requestId: string;
    startTime: number;
    userId?: string;
}
export declare function createLoggingMiddleware(): (request: RequestWithLogging, reply: FastifyReply) => Promise<void>;
export declare function createErrorLoggingMiddleware(): (error: Error, request: RequestWithLogging, reply: FastifyReply) => Promise<never>;
