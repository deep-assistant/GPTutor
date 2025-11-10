"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUniversalAuthMiddleware = createUniversalAuthMiddleware;
exports.requireAuth = requireAuth;
exports.getUserId = getUserId;
const vkAuth_1 = require("../utils/vkAuth");
const LoggerService_1 = require("../services/LoggerService");
function createUniversalAuthMiddleware(userRepository, vkSecretKey) {
    return async function universalAuthMiddleware(request, reply) {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                return reply.code(401).send({
                    error: "Unauthorized",
                    message: "Missing authorization header",
                });
            }
            const authResult = await (0, vkAuth_1.authenticateUser)(authHeader, vkSecretKey, userRepository);
            if (!authResult) {
                return reply.code(401).send({
                    error: "Unauthorized",
                    message: "Invalid authentication. Use Bearer token (sk-...) or VK authorization.",
                });
            }
            let user;
            let userId;
            if (authResult.authType === "api_key") {
                user = authResult.user;
                userId = user.id.toString();
            }
            else if (authResult.authType === "vk") {
                const vkData = authResult.user;
                let dbUser = await userRepository.findByVkId(vkData.vk_user_id);
                if (!dbUser) {
                    dbUser = await userRepository.create({
                        vkId: vkData.vk_user_id,
                        isActive: true,
                    });
                }
                user = dbUser;
                userId = user.id.toString();
            }
            else {
                return reply.code(401).send({
                    error: "Unauthorized",
                    message: "Unknown authentication type",
                });
            }
            if (!user.isActive) {
                return reply.code(401).send({
                    error: "Unauthorized",
                    message: "User account is inactive",
                });
            }
            // Добавляем пользователя в request
            request.user = user;
            request.userId = userId;
            // Логируем успешную аутентификацию
            LoggerService_1.logger.auth(authResult.authType, userId, true, {
                requestId: request.requestId,
                authType: authResult.authType,
                userAgent: request.headers["user-agent"],
                ip: request.ip,
            });
            return; // Продолжаем выполнение
        }
        catch (error) {
            // Логируем ошибку аутентификации
            LoggerService_1.logger.auth("unknown", "anonymous", false, {
                requestId: request.requestId,
                error: error instanceof Error ? error.message : "Unknown error",
                userAgent: request.headers["user-agent"],
                ip: request.ip,
            });
            return reply.code(401).send({
                error: "Unauthorized",
                message: "Authentication failed",
            });
        }
    };
}
// Вспомогательная функция для проверки, что пользователь аутентифицирован
function requireAuth(request) {
    if (!request.user) {
        throw new Error("User not authenticated");
    }
    return request.user;
}
// Вспомогательная функция для получения ID пользователя
function getUserId(request) {
    if (!request.userId) {
        throw new Error("User not authenticated");
    }
    return request.userId;
}
