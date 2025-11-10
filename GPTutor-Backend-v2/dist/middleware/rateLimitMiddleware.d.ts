import { FastifyRequest, FastifyReply } from "fastify";
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
export declare function generateRateLimitKey(request: FastifyRequest): string;
export declare function generateIPRateLimitKey(request: FastifyRequest): string;
export declare function createRateLimitMiddleware(config: RateLimitConfig): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
export declare function getRateLimitConfig(route: string): RateLimitConfig | null;
export declare function cleanupRateLimitStore(store: Map<string, {
    count: number;
    resetTime: number;
}>): void;
export declare function getGlobalRateLimitStore(): Map<string, {
    count: number;
    resetTime: number;
}>;
