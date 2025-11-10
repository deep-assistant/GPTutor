import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "../services/AuthService";
import { RequestWithLogging } from "./loggingMiddleware";
import { logger } from "../services/LoggerService";

export function createVkAuthMiddleware(authService: AuthService) {
  return async function vkAuthMiddleware(
    request: RequestWithLogging,
    reply: FastifyReply
  ) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      reply
        .code(401)
        .send({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    try {
      const authResult = await authService.authorizeVKUser(token);
      (request as any).vkUser = authResult.vkData;
      (request as any).dbUser = authResult.dbUser;

      request.userId = authResult.dbUser.id.toString();

      logger.auth("vk_authorize", request.userId, true, {
        requestId: request.requestId,
        vkId: (authResult.vkData as any).id,
      });
    } catch (error) {
      logger.auth("vk_authorize", request.userId, false, {
        requestId: request.requestId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      reply.code(401).send({
        error: error instanceof Error ? error.message : "Authorization failed",
      });
      return;
    }
  };
}
