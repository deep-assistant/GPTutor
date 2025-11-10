import { FastifyRequest, FastifyReply } from "fastify";
import { UserRepository } from "../repositories/UserRepository";
export interface AuthenticatedUser {
    id: string;
    username?: string | null;
    email?: string | null;
    vkId?: string | null;
    balance: number;
    apiKey: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthenticatedRequest extends FastifyRequest {
    user?: AuthenticatedUser;
    userId?: string;
    requestId?: string;
    startTime?: number;
}
export declare function createUniversalAuthMiddleware(userRepository: UserRepository, vkSecretKey: string): (request: AuthenticatedRequest, reply: FastifyReply) => Promise<undefined>;
export declare function requireAuth(request: AuthenticatedRequest): AuthenticatedUser;
export declare function getUserId(request: AuthenticatedRequest): string;
