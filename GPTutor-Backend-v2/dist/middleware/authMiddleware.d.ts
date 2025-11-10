import { FastifyReply } from "fastify";
import { AuthService } from "../services/AuthService";
import { RequestWithLogging } from "./loggingMiddleware";
export declare function createVkAuthMiddleware(authService: AuthService): (request: RequestWithLogging, reply: FastifyReply) => Promise<void>;
