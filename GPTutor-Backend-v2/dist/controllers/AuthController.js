"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const BaseController_1 = require("./BaseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
class AuthController extends BaseController_1.BaseController {
    constructor(fastify, authService) {
        super(fastify);
        this.authService = authService;
    }
    registerRoutes() {
        const vkAuthMiddleware = (0, authMiddleware_1.createVkAuthMiddleware)(this.authService);
        const userRateLimit = (0, rateLimitMiddleware_1.createRateLimitMiddleware)((0, rateLimitMiddleware_1.getRateLimitConfig)('/user'));
        const updateTokenRateLimit = (0, rateLimitMiddleware_1.createRateLimitMiddleware)((0, rateLimitMiddleware_1.getRateLimitConfig)('/update-token'));
        this.fastify.get('/user', {
            preHandler: [userRateLimit, vkAuthMiddleware]
        }, this.getUser.bind(this));
        this.fastify.post('/update-token', {
            preHandler: [updateTokenRateLimit, vkAuthMiddleware]
        }, this.updateToken.bind(this));
    }
    async getUser(request, reply) {
        this.logInfo('User data requested', {
            vkId: request.dbUser.vkId,
            balance: request.dbUser.balance
        }, request);
        return this.sendSuccess(reply, {
            message: "User data retrieved successfully!",
            vkData: request.vkUser,
            user: {
                id: request.dbUser.id,
                vkId: request.dbUser.vkId,
                balance: request.dbUser.balance,
                apiKey: request.dbUser.apiKey,
                isActive: request.dbUser.isActive,
                createdAt: request.dbUser.createdAt,
                updatedAt: request.dbUser.updatedAt,
            },
            timestamp: new Date().toISOString(),
        });
    }
    async updateToken(request, reply) {
        try {
            this.logInfo('Token update requested', {
                userId: request.dbUser.id,
                vkId: request.dbUser.vkId
            }, request);
            const updatedUser = await this.authService.updateUserToken(request.dbUser.id);
            this.logInfo('Token updated successfully', {
                userId: updatedUser.id,
                newApiKey: updatedUser.apiKey.substring(0, 10) + '...'
            }, request);
            return this.sendSuccess(reply, {
                message: "API token updated successfully!",
                newApiKey: updatedUser.apiKey,
                user: {
                    id: updatedUser.id,
                    vkId: updatedUser.vkId,
                    balance: updatedUser.balance,
                    isActive: updatedUser.isActive,
                    updatedAt: updatedUser.updatedAt,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            this.logError('Token update failed', error, request);
            return this.sendError(reply, 'Failed to update token', 500);
        }
    }
}
exports.AuthController = AuthController;
