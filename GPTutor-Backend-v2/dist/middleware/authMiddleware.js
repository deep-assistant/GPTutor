"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVkAuthMiddleware = createVkAuthMiddleware;
const LoggerService_1 = require("../services/LoggerService");
function createVkAuthMiddleware(authService) {
    return async function vkAuthMiddleware(request, reply) {
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
            request.vkUser = authResult.vkData;
            request.dbUser = authResult.dbUser;
            request.userId = authResult.dbUser.id.toString();
            LoggerService_1.logger.auth("vk_authorize", request.userId, true, {
                requestId: request.requestId,
                vkId: authResult.vkData.id,
            });
        }
        catch (error) {
            LoggerService_1.logger.auth("vk_authorize", request.userId, false, {
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
