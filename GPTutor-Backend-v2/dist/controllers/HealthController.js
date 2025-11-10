"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const BaseController_1 = require("./BaseController");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
class HealthController extends BaseController_1.BaseController {
    registerRoutes() {
        const healthRateLimit = (0, rateLimitMiddleware_1.createRateLimitMiddleware)((0, rateLimitMiddleware_1.getRateLimitConfig)('/health'));
        this.fastify.get('/health', { preHandler: healthRateLimit }, this.healthCheck.bind(this));
    }
    async healthCheck(request, reply) {
        return this.sendSuccess(reply, {
            status: "ok",
            timestamp: new Date().toISOString()
        });
    }
}
exports.HealthController = HealthController;
